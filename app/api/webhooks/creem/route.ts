import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import { handleCreemOrderSession } from "@/services/creem-order";
import { 
  createSubscription, 
  updateSubscriptionStatus, 
  getSubscriptionByCreemId,
  getUserSubscription
} from "@/models/subscription";
import { increaseCredits } from "@/services/credit";
import { CreditsTransType } from "@/services/credit";
import { findUserByEmail } from "@/models/user";

export async function POST(request: NextRequest) {
  try {
    console.log("Creem webhook received");
    
    // 获取请求头
    const headersList = await headers();
    const signature = headersList.get("creem-signature");
    const eventType = headersList.get("creem-event-type");
    
    if (!signature) {
      console.error("Missing Creem signature");
      return NextResponse.json(
        { error: "Missing signature" },
        { status: 400 }
      );
    }

    // 获取原始请求体
    const body = await request.text();
    console.log("Webhook body:", body);
    console.log("Event type:", eventType);
    console.log("Signature:", signature);

    // 验证webhook签名
    const webhookSecret = process.env.CREEM_WEBHOOK_SECRET;
    if (!webhookSecret) {
      console.error("CREEM_WEBHOOK_SECRET not configured");
      return NextResponse.json(
        { error: "Webhook secret not configured" },
        { status: 500 }
      );
    }

    // TODO: 实现签名验证逻辑
    // 目前跳过签名验证，仅用于测试
    console.log("Webhook signature verification skipped for testing");

    // 解析JSON数据
    let event;
    try {
      event = JSON.parse(body);
    } catch (error) {
      console.error("Failed to parse webhook JSON:", error);
      return NextResponse.json(
        { error: "Invalid JSON" },
        { status: 400 }
      );
    }

    console.log("Parsed webhook event:", event);

    // 从事件数据中获取事件类型（如果header中没有）
    const actualEventType = eventType || event.eventType || event.type;
    console.log("Actual event type:", actualEventType);

    // 根据事件类型处理不同的webhook事件
    switch (actualEventType) {
      case "checkout.completed":
      case "checkout.session.completed":
        console.log("Processing checkout completed event");
        await handleCheckoutCompleted(event);
        break;

      case "subscription.paid":
      case "invoice.payment_succeeded":
        console.log("Processing subscription paid event");
        await handleSubscriptionPaid(event);
        break;

      case "payment.succeeded":
      case "payment_intent.succeeded":
        console.log("Processing payment success event");
        
        // 处理支付成功事件 - 只调用handleCreemOrderSession，避免重复添加积分
        if (event.data && event.data.object) {
          await handleCreemOrderSession(event.data.object);
        } else if (event.object) {
          await handleCreemOrderSession(event.object);
        } else {
          console.log("Processing payment success with full event data");
          await handleCreemOrderSession(event);
        }
        break;

      case "checkout.failed":
      case "payment.failed":
        console.log("Processing payment failure event");
        // 处理支付失败事件
        break;

      case "subscription.created":
        console.log("Processing subscription created event");
        await handleSubscriptionCreated(event.data || event);
        break;

      case "subscription.updated":
        console.log("Processing subscription updated event");
        await handleSubscriptionUpdated(event.data || event);
        break;

      case "subscription.cancelled":
        console.log("Processing subscription cancelled event");
        await handleSubscriptionCancelled(event.data || event);
        break;

      default:
        console.log("Unhandled webhook event type:", actualEventType);
        // 对于未知事件，不进行任何处理，避免意外的重复积分添加
        break;
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Webhook error:", error);
    return NextResponse.json(
      { error: "Webhook processing failed" },
      { status: 500 }
    );
  }
}

// 核心：处理支付成功和订阅创建 - 同时处理订阅创建和积分添加
async function handleCheckoutCompleted(event: any) {
  try {
    console.log("=== handleCheckoutCompleted DEBUG ===");
    console.log("Full event object:", JSON.stringify(event, null, 2));
    
    // 尝试不同的数据结构访问方式
    let checkoutData = event.data?.object || event.object || event;
    
    // 如果找不到checkout数据，尝试其他可能的结构
    if (!checkoutData || !checkoutData.id) {
      console.log("Trying alternative data structures...");
      checkoutData = event.checkout || event.session || event.payment || event;
    }
    
    console.log("Extracted checkoutData:", JSON.stringify(checkoutData, null, 2));
    
    if (!checkoutData || !checkoutData.id) {
      console.error("No valid checkout data found in event");
      return;
    }

    console.log("Processing checkout completed:", checkoutData.id);

    // 尝试不同的用户邮箱访问方式
    const userEmail = checkoutData.customer?.email || 
                     checkoutData.customerEmail || 
                     checkoutData.email ||
                     checkoutData.customer_details?.email ||
                     checkoutData.customer_email;
                     
    const metadata = checkoutData.metadata || checkoutData.meta || {};
    
    console.log("User email:", userEmail);
    console.log("Metadata:", JSON.stringify(metadata, null, 2));

    if (!userEmail) {
      console.error("No user email found in checkout data");
      return;
    }

    // 获取用户信息
    const user = await findUserByEmail(userEmail);
    if (!user) {
      console.error("User not found for checkout:", userEmail);
      return;
    }

    // 获取产品信息 - 尝试多种方式获取产品ID
    const originalProductId = metadata.product_id || 
                             metadata.original_product_id ||
                             checkoutData.product_id ||
                             checkoutData.order?.items?.[0]?.product?.id ||
                             checkoutData.productId;
                             
    console.log("Original product ID:", originalProductId);
    
    const productInfo = getProductInfo(originalProductId);
    if (!productInfo) {
      console.error("Unknown product for checkout:", originalProductId);
      console.error("Available product IDs:", Object.keys({
        'starter': true,
        'standard': true, 
        'premium': true
      }));
      return;
    }

    console.log(`Processing checkout for user ${user.uuid}, product: ${originalProductId}`);
    console.log("Product info:", JSON.stringify(productInfo, null, 2));

    // --- 订阅处理逻辑 ---
    let shouldCreateNew = false;
    const existingSubscription = await getUserSubscription(user.uuid!);

    if (!existingSubscription) {
      shouldCreateNew = true;
      console.log("No existing subscription, will create new one");
    } else {
      console.log("Existing subscription found:", JSON.stringify(existingSubscription, null, 2));
      const isUpgrade = existingSubscription.product_id !== originalProductId;
      const isPendingCancel = existingSubscription.cancel_at_period_end;

      console.log("Upgrade check:", { isUpgrade, isPendingCancel });

      if (isUpgrade || isPendingCancel) {
        // 立即取消旧订阅，创建新订阅
        try {
          await updateSubscriptionStatus(existingSubscription.creem_subscription_id || "", {
            status: "canceled",
            canceled_at: new Date().toISOString(),
          });
          console.log(`Canceled previous subscription ${existingSubscription.id} for upgrade.`);
        } catch (e) {
          console.error("cancel previous subscription failed:", e);
        }
        shouldCreateNew = true;
      }
    }

    if (shouldCreateNew) {
      console.log(`Creating new subscription for user ${user.uuid}`);
      const newSubscription = await createSubscription({
        user_uuid: user.uuid!,
        product_id: originalProductId,
        plan_name: productInfo.plan_name,
        status: 'active',
        credits_monthly: productInfo.credits,
        creem_subscription_id: checkoutData.subscription || checkoutData.subscriptionId || `sub_${Date.now()}`,
        current_period_start: new Date().toISOString(),
        current_period_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      });

      if (!newSubscription) {
        throw new Error("Failed to create subscription in database.");
      }
      console.log(`Successfully created subscription ${newSubscription.id} for user ${user.uuid}`);
    } else {
      console.log(`User ${user.uuid} already has an active subscription, no new subscription created.`);
    }

    // --- 积分处理 - 使用统一 order_no 保证幂等 ---
    const orderNoForCredit = metadata.order_no || metadata.orderNo || checkoutData.orderNo || checkoutData.id;
    console.log(`Adding ${productInfo.credits} credits for user ${user.uuid} with order_no ${orderNoForCredit}`);
    
    await increaseCredits({
      user_uuid: user.uuid!,
      trans_type: CreditsTransType.SubscriptionPayment,
      credits: productInfo.credits,
      expired_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      order_no: orderNoForCredit, // 使用统一 order_no 保证幂等
    });
    console.log("Successfully added credits via webhook");

    console.log("--- Checkout event processed successfully (subscription + credits) ---", userEmail);
  } catch (error: any) {
    console.error("!! FATAL ERROR in handleCheckoutCompleted !!");
    console.error("Message:", error.message);
    console.error("Stack:", error.stack);
    console.error("Event that caused error:", JSON.stringify(event, null, 2));
  }
}

// 废弃，逻辑已合并到 handleCheckoutCompleted
async function handleSubscriptionPaid(event: any) {
  console.log("handleSubscriptionPaid is deprecated. Logic moved to handleCheckoutCompleted.");
  await handleCheckoutCompleted(event);
}

// 处理订阅创建事件
async function handleSubscriptionCreated(data: any) {
  try {
    const subscription = data.object;
    console.log("Creating subscription:", subscription);

    // 获取用户信息
    const user = await findUserByEmail(subscription.customer.email);
    if (!user) {
      console.error("User not found for subscription:", subscription.customer.email);
      return;
    }

    // 获取产品信息
    const productInfo = getProductInfo(subscription.price.product.id);
    if (!productInfo) {
      console.error("Unknown product:", subscription.price.product.id);
      return;
    }

    // 创建订阅记录
    await createSubscription({
      user_uuid: user.uuid!,
      product_id: productInfo.product_id,
      plan_name: productInfo.plan_name,
      status: subscription.status,
      credits_monthly: productInfo.credits,
      creem_subscription_id: subscription.id,
      current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
      current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
    });

    // 注意：不在这里添加积分，积分只在checkout.completed事件中添加
    // 这样可以避免重复添加积分的问题
    console.log("Subscription created successfully (credits will be added via checkout.completed event)");
  } catch (error) {
    console.error("Error handling subscription created:", error);
  }
}

// 处理订阅更新事件
async function handleSubscriptionUpdated(data: any) {
  try {
    const subscription = data.object;
    console.log("Updating subscription:", subscription);

    await updateSubscriptionStatus(subscription.id, {
      status: subscription.status,
      current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
      current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
      cancel_at_period_end: subscription.cancel_at_period_end,
      canceled_at: subscription.canceled_at ? new Date(subscription.canceled_at * 1000).toISOString() : undefined,
    });

    console.log("Subscription updated successfully");
  } catch (error) {
    console.error("Error handling subscription updated:", error);
  }
}

// 处理订阅取消事件
async function handleSubscriptionCancelled(data: any) {
  try {
    const subscription = data.object;
    console.log("Cancelling subscription:", subscription);

    await updateSubscriptionStatus(subscription.id, {
      status: 'canceled',
      canceled_at: new Date().toISOString(),
    });

    console.log("Subscription cancelled successfully");
  } catch (error) {
    console.error("Error handling subscription cancelled:", error);
  }
}

// 获取产品信息
function getProductInfo(productId: string) {
  const productMap: Record<string, { product_id: string, plan_name: string, credits: number }> = {
    'starter': { product_id: 'starter', plan_name: 'AI涂色页生成器 入门版', credits: 100 },
    'standard': { product_id: 'standard', plan_name: 'AI涂色页生成器 标准版', credits: 500 },
    'premium': { product_id: 'premium', plan_name: 'AI涂色页生成器 高级版', credits: 1000 },
  };

  return productMap[productId] || null;
}

// 获取产品信息
function getProductInfoByOriginalId(originalProductId: string) {
  const productMap: Record<string, { product_id: string, plan_name: string, credits: number }> = {
    'starter': { product_id: 'starter', plan_name: 'AI涂色页生成器 入门版', credits: 100 },
    'standard': { product_id: 'standard', plan_name: 'AI涂色页生成器 标准版', credits: 500 },
    'premium': { product_id: 'premium', plan_name: 'AI涂色页生成器 高级版', credits: 1000 },
  };

  return productMap[originalProductId] || null;
}

// 支持GET请求用于webhook验证
export async function GET() {
  return NextResponse.json({ status: "Creem webhook endpoint active" });
} 