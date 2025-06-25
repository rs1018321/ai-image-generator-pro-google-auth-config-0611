import {
  CreditsTransType,
  increaseCredits,
  updateCreditForOrder,
} from "./credit";
import { findOrderByOrderNo, updateOrderStatus } from "@/models/order";
import { getIsoTimestr } from "@/lib/time";
import { updateAffiliateForOrder } from "./affiliate";
import {
  createSubscription,
  getUserSubscription,
  updateSubscriptionStatus,
} from "@/models/subscription";
import { findUserByEmail } from "@/models/user";

// Creem Checkout 会话接口（简化版，根据实际需要扩展字段）
interface CreemCheckoutSession {
  id: string;
  metadata?: Record<string, any>;
  order?: {
    orderNo: string;
    [key: string]: any;
  };
  customer?: {
    email?: string;
  };
  subscription?: string;
}

/**
 * 成功页面调用：根据 checkoutSession 处理订单、订阅与积分。
 * 关键幂等逻辑：
 *   - 统一使用 order.order_no（若无则 checkoutSession.id）作为 order_no 存储到 credits 表
 *   - increaseCredits 在插入前会先按 order_no 查询，数据库侧保证唯一
 */
export async function handleCreemOrderSession(
  session: any
): Promise<boolean> {
  try {
    console.log("=== handleCreemOrderSession start ===");
    console.log(JSON.stringify(session, null, 2));

    if (!session?.id) {
      console.error("Invalid session: missing id");
      return false;
    }

    // 解析订单号
    const orderNoFromMeta = session.metadata?.order_no || session.metadata?.orderNo;
    const orderNo = orderNoFromMeta || session.order?.orderNo;
    if (!orderNo) {
      console.error("No orderNo in session metadata");
      return false;
    }

    const order = await findOrderByOrderNo(orderNo);
    if (!order) {
      console.error("Order not found:", orderNo);
      return false;
    }

    // 更新订单状态为已支付
    const paidAt = getIsoTimestr();
    const paidEmail = session.customer?.email || order.user_email || "";
    await updateOrderStatus(
      order.order_no,
      "paid",
      paidAt,
      paidEmail,
      JSON.stringify(session)
    );
    console.log("Order marked paid", orderNo);

    // === 判断订阅或一次性购买 ===
    const isSubscription = order.interval === "month" || order.interval === "year";

    if (isSubscription) {
      await processSubscriptionFlow({ session, order, paidEmail });
    } else {
      await processOneTimeOrder(order);
    }

    console.log("=== handleCreemOrderSession end ===");
    return true;
  } catch (err) {
    console.error("handleCreemOrderSession error", err);
    return false;
  }
}

/** 处理订阅支付逻辑 */
async function processSubscriptionFlow({
  session,
  order,
  paidEmail,
}: {
  session: any;
  order: any;
  paidEmail: string;
}) {
  console.log("-- processSubscriptionFlow start --");

  // 获取用户
  const user = await findUserByEmail(paidEmail);
  if (!user?.uuid) {
    throw new Error(`User not found: ${paidEmail}`);
  }

  // 获取产品信息
  if (!order.product_id) throw new Error("order.product_id missing");
  const product = getProductInfo(order.product_id);
  if (!product) throw new Error(`Unknown product_id ${order.product_id}`);

  // 检查现有订阅
  const existing = await getUserSubscription(user.uuid);
  let needCreate = false;
  if (!existing) needCreate = true;
  else {
    const isUpgrade = existing.product_id !== order.product_id;
    const pendingCancel = existing.cancel_at_period_end;
    if (isUpgrade || pendingCancel) {
      try {
        await updateSubscriptionStatus(existing.creem_subscription_id || "", {
          status: "canceled",
          canceled_at: new Date().toISOString(),
        });
        console.log("Canceled old subscription", existing.id);
      } catch (e) {
        console.error("Cancel subscription failed", e);
      }
      needCreate = true;
    }
  }

  if (needCreate) {
    const sub = await createSubscription({
      user_uuid: user.uuid,
      product_id: order.product_id,
      plan_name: product.plan_name,
      status: "active",
      credits_monthly: product.credits,
      creem_subscription_id: session.subscription || `sub_${Date.now()}`,
      current_period_start: new Date().toISOString(),
      current_period_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    });
    console.log("Created subscription", sub?.id);
  }

  // === 添加订阅积分 ===
  const orderNoForCredit = order.order_no || session.id;
  await increaseCredits({
    user_uuid: user.uuid,
    trans_type: CreditsTransType.SubscriptionPayment,
    credits: product.credits,
    expired_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    order_no: orderNoForCredit,
  });
  console.log("Credits added for subscription, order_no", orderNoForCredit);

  console.log("-- processSubscriptionFlow end --");
}

/** 处理一次性订单 */
async function processOneTimeOrder(order: any) {
  console.log("-- processOneTimeOrder start --");
  await updateCreditForOrder(order); // 内部包含重复校验
  await updateAffiliateForOrder(order);
  console.log("-- processOneTimeOrder end --");
}

/** 产品信息映射。若产品较多，可移入独立模块 */
function getProductInfo(productId: string) {
  const map: Record<string, { plan_name: string; credits: number }> = {
    starter: { plan_name: "AI涂色页生成器 入门版", credits: 100 },
    standard: { plan_name: "AI涂色页生成器 标准版", credits: 500 },
    premium: { plan_name: "AI涂色页生成器 高级版", credits: 1000 },
  };
  return map[productId] || null;
}

/** 根据 checkoutId 查询 Creem Session（供其他流程调用） */
export async function getCreemSessionById(checkoutId: string) {
  try {
    const { retrieveCreemCheckout } = await import("@/lib/creem");
    return await retrieveCreemCheckout(checkoutId);
  } catch (e) {
    console.error("retrieveCreemCheckout error", e);
    return null;
  }
} 