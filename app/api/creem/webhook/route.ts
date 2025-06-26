import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import { 
  createSubscription, 
  updateSubscriptionStatus, 
  getUserSubscription
} from "@/models/subscription";
import { increaseCredits } from "@/services/credit";
import { findUserByEmail } from "@/models/user";

export async function POST(request: NextRequest) {
  try {
    console.log("=== Creem webhook received at /api/creem/webhook ===");
    
    // 获取请求头
    const headersList = await headers();
    const signature = headersList.get("x-creem-signature") || headersList.get("creem-signature");
    const eventType = headersList.get("x-creem-event-type") || headersList.get("creem-event-type");
    
    console.log("Request headers:");
    console.log("- signature:", signature ? "✓ Present" : "✗ Missing");
    console.log("- event-type:", eventType || "Not provided");
    
    // 获取原始请求体
    const rawBody = await request.arrayBuffer();
    const body = Buffer.from(rawBody).toString();
    
    console.log("Webhook body length:", body.length);
    console.log("Webhook body preview:", body.substring(0, 200) + (body.length > 200 ? "..." : ""));

    // TODO: 实现签名验证
    // 暂时跳过签名验证用于测试
    console.log("Webhook signature verification skipped for testing");

    // 解析JSON数据
    let event;
    try {
      event = JSON.parse(body);
      console.log("Successfully parsed JSON event");
    } catch (error) {
      console.error("Failed to parse webhook JSON:", error);
      return NextResponse.json(
        { error: "Invalid JSON" },
        { status: 400 }
      );
    }

    console.log("Parsed webhook event keys:", Object.keys(event));
    console.log("Event type:", eventType || event.eventType || event.type);

    // 从事件数据中获取事件类型
    const actualEventType = eventType || event.eventType || event.type;
    console.log("Processing event type:", actualEventType);

    // 根据事件类型处理不同的webhook事件
    switch (actualEventType) {
      case "checkout.completed":
      case "checkout.session.completed":
        console.log("Processing checkout completed event");
        await handleCheckoutCompleted(event);
        break;

      case "subscription.active":
        console.log("Processing subscription active event");
        await handleSubscriptionActive(event);
        break;

      case "subscription.paid":
      case "invoice.payment_succeeded":
        console.log("Processing subscription paid event");
        await handleSubscriptionPaid(event);
        break;

      case "subscription.created":
        console.log("Processing subscription created event");
        await handleSubscriptionCreated(event);
        break;

      case "subscription.updated":
        console.log("Processing subscription updated event");
        await handleSubscriptionUpdated(event);
        break;

      case "subscription.cancelled":
        console.log("Processing subscription cancelled event");
        await handleSubscriptionCancelled(event);
        break;

      default:
        console.log("Unhandled webhook event type:", actualEventType);
        break;
    }

    // 重要：必须返回200状态，让Creem停止重试
    return NextResponse.json({ received: true }, { status: 200 });
  } catch (error) {
    console.error("Webhook error:", error);
    // 即使出错也返回200，避免Creem持续重试
    return NextResponse.json(
      { received: true, error: error instanceof Error ? error.message : "Unknown error" },
      { status: 200 }
    );
  }
}

// 处理checkout完成事件
async function handleCheckoutCompleted(event: any) {
  try {
    console.log("=== handleCheckoutCompleted ===");
    
    // 从事件中提取数据
    const checkoutData = event.data?.object || event.object || event;
    
    if (!checkoutData || !checkoutData.id) {
      console.error("No valid checkout data found");
      return;
    }

    // 获取用户邮箱
    const userEmail = checkoutData.customer?.email || 
                     checkoutData.customerEmail || 
                     checkoutData.email;
                     
    if (!userEmail) {
      console.error("No user email found in checkout data");
      return;
    }

    // 获取用户
    const user = await findUserByEmail(userEmail);
    if (!user) {
      console.error("User not found:", userEmail);
      return;
    }

    // 获取产品信息
    const metadata = checkoutData.metadata || {};
    const productId = metadata.product_id || metadata.original_product_id || 'starter';
    const productInfo = getProductInfo(productId);
    
    if (!productInfo) {
      console.error("Unknown product:", productId);
      return;
    }

    console.log(`Processing checkout for user ${user.uuid}, product: ${productId}`);

    // 创建或更新订阅
    const existingSubscription = await getUserSubscription(user.uuid!);
    
    if (!existingSubscription) {
      // 创建新订阅
      const newSubscription = await createSubscription({
        user_uuid: user.uuid!,
        product_id: productInfo.product_id,
        plan_name: productInfo.plan_name,
        status: 'active',
        credits_monthly: productInfo.credits,
        creem_subscription_id: checkoutData.subscription || `sub_${Date.now()}`,
        current_period_start: new Date().toISOString(),
        current_period_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      });
      
      console.log(`Created subscription ${newSubscription?.id} for user ${user.uuid}`);
    }

    // 添加积分
    const orderNo = metadata.order_no || checkoutData.id;
    await increaseCredits({
      user_uuid: user.uuid!,
      trans_type: "subscription_payment",
      credits: productInfo.credits,
      expired_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      order_no: orderNo,
    });
    
    console.log(`Added ${productInfo.credits} credits for user ${user.uuid}`);
  } catch (error) {
    console.error("Error in handleCheckoutCompleted:", error);
  }
}

// 处理subscription.active事件
async function handleSubscriptionActive(event: any) {
  try {
    console.log("=== handleSubscriptionActive ===");
    
    const subscriptionData = event.data?.object || event.object || event;
    const customerEmail = subscriptionData.customer?.email;
    
    if (!customerEmail) {
      console.error("No customer email found");
      return;
    }

    // 获取用户
    const user = await findUserByEmail(customerEmail);
    if (!user) {
      console.error("User not found:", customerEmail);
      return;
    }

    // 获取产品信息
    const productId = subscriptionData.metadata?.product_id || 'starter';
    const productInfo = getProductInfo(productId);
    
    if (!productInfo) {
      console.error("Unknown product:", productId);
      return;
    }

    // 更新或创建订阅
    const existingSubscription = await getUserSubscription(user.uuid!);
    
    if (existingSubscription) {
      // 更新现有订阅
      await updateSubscriptionStatus(existingSubscription.creem_subscription_id || "", {
        status: 'active',
        cancel_at_period_end: false,
      });
      console.log(`Updated subscription for user ${user.uuid}`);
    } else {
      // 创建新订阅
      const newSubscription = await createSubscription({
        user_uuid: user.uuid!,
        product_id: productInfo.product_id,
        plan_name: productInfo.plan_name,
        status: 'active',
        credits_monthly: productInfo.credits,
        creem_subscription_id: subscriptionData.id,
        current_period_start: new Date().toISOString(),
        current_period_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      });
      console.log(`Created subscription ${newSubscription?.id} for user ${user.uuid}`);
    }

    // 添加积分
    await increaseCredits({
      user_uuid: user.uuid!,
      trans_type: "subscription_payment",
      credits: productInfo.credits,
      expired_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      order_no: subscriptionData.id,
    });
    
    console.log(`Added ${productInfo.credits} credits for user ${user.uuid}`);
  } catch (error) {
    console.error("Error in handleSubscriptionActive:", error);
  }
}

// 处理subscription.paid事件
async function handleSubscriptionPaid(event: any) {
  try {
    console.log("=== handleSubscriptionPaid ===");
    // 对于subscription.paid事件，通常意味着月度续费
    // 我们需要添加积分
    
    const subscriptionData = event.data?.object || event.object || event;
    const customerEmail = subscriptionData.customer?.email;
    
    if (!customerEmail) {
      console.error("No customer email found");
      return;
    }

    const user = await findUserByEmail(customerEmail);
    if (!user) {
      console.error("User not found:", customerEmail);
      return;
    }

    const productId = subscriptionData.metadata?.product_id || 'starter';
    const productInfo = getProductInfo(productId);
    
    if (!productInfo) {
      console.error("Unknown product:", productId);
      return;
    }

    // 添加月度积分
    await increaseCredits({
      user_uuid: user.uuid!,
      trans_type: "subscription_payment",
      credits: productInfo.credits,
      expired_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      order_no: `monthly_${subscriptionData.id}_${Date.now()}`,
    });
    
    console.log(`Added monthly ${productInfo.credits} credits for user ${user.uuid}`);
  } catch (error) {
    console.error("Error in handleSubscriptionPaid:", error);
  }
}

// 其他事件处理函数
async function handleSubscriptionCreated(event: any) {
  console.log("Subscription created event received");
}

async function handleSubscriptionUpdated(event: any) {
  console.log("Subscription updated event received");
}

async function handleSubscriptionCancelled(event: any) {
  try {
    const subscriptionData = event.data?.object || event.object || event;
    
    if (subscriptionData.id) {
      await updateSubscriptionStatus(subscriptionData.id, {
        status: 'canceled',
        canceled_at: new Date().toISOString(),
      });
      console.log(`Cancelled subscription ${subscriptionData.id}`);
    }
  } catch (error) {
    console.error("Error in handleSubscriptionCancelled:", error);
  }
}

// 获取产品信息
function getProductInfo(productId: string) {
  const productMap: Record<string, { product_id: string, plan_name: string, credits: number }> = {
    'starter': { product_id: 'starter', plan_name: 'AI涂色页生成器 入门版', credits: 100 },
    'standard': { product_id: 'standard', plan_name: 'AI涂色页生成器 标准版', credits: 500 },
    'premium': { product_id: 'premium', plan_name: 'AI涂色页生成器 高级版', credits: 1000 },
  };

  const creemProductMap: Record<string, { product_id: string, plan_name: string, credits: number }> = {
    'prod_3dRZI1gMk2xNAtxL9nb83U': { product_id: 'starter', plan_name: 'AI涂色页生成器 入门版', credits: 100 },
    'prod_5Uh5Qgi2Kg98F4uUnqlpyP': { product_id: 'standard', plan_name: 'AI涂色页生成器 标准版', credits: 500 },
    'prod_3Rpn1q8sKOwI65Gocrtjr1': { product_id: 'premium', plan_name: 'AI涂色页生成器 高级版', credits: 1000 },
  };

  return productMap[productId] || creemProductMap[productId] || null;
}

// 支持GET请求用于webhook验证
export async function GET() {
  return NextResponse.json({ 
    status: "Creem webhook endpoint active",
    path: "/api/creem/webhook"
  });
} 