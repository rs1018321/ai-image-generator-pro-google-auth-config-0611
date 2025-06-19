import {
  CreditsTransType,
  increaseCredits,
  updateCreditForOrder,
} from "./credit";
import { findOrderByOrderNo, updateOrderStatus } from "@/models/order";
import { getIsoTimestr, getOneYearLaterTimestr } from "@/lib/time";
import { updateAffiliateForOrder } from "./affiliate";

// Creem Checkout会话接口 - 匹配Creem SDK的CheckoutEntity
interface CreemCheckoutSession {
  id: string;
  status: string;
  metadata?: Record<string, any>;
  order: {
    id: string;
    orderNo: string;
    amount: number;
    amountPaid?: number;
    currency: string;
    status: string;
  };
  customer?: {
    id?: string;
    email?: string;
  };
}

// 处理Creem订单会话
export async function handleCreemOrderSession(session: any): Promise<boolean> {
  try {
    console.log("Processing Creem order session:", session?.id);

    if (!session || !session.id) {
      console.error("Invalid Creem session");
      return false;
    }

    // 从metadata中获取订单号 - 修复字段名不一致问题
    const orderNo = session.metadata?.order_no || session.metadata?.orderNo || session.order?.orderNo;
    
    if (!orderNo) {
      console.error("Order number not found in Creem session");
      console.error("Available metadata:", JSON.stringify(session.metadata, null, 2));
      return false;
    }

    // 查找订单
    const order = await findOrderByOrderNo(orderNo);
    if (!order) {
      console.error("Order not found:", orderNo);
      return false;
    }

    // 获取当前时间
    const paidAt = getIsoTimestr();
    const paidEmail = session.customer?.email || "";
    const paidDetail = JSON.stringify(session);

    // 更新订单状态为已支付
    await updateOrderStatus(order.order_no, "paid", paidAt, paidEmail, paidDetail);
    console.log("Order status updated to paid:", orderNo);

    // 处理积分增加
    if (order.credits && order.credits > 0) {
      await increaseCredits({
        user_uuid: order.user_uuid,
        trans_type: CreditsTransType.OrderPay,
        credits: order.credits,
        expired_at: order.expired_at,
        order_no: order.order_no,
      });
      console.log("Credits increased:", order.credits);
    }

    // 处理联盟营销更新
    await updateCreditForOrder(order);
    console.log("Credit updated for order:", orderNo);

    console.log("Creem order session processed successfully:", orderNo);
    return true;
  } catch (error) {
    console.error("Error processing Creem order session:", error);
    return false;
  }
}

// 根据checkout_id获取Creem会话信息
export async function getCreemSessionById(checkoutId: string): Promise<any> {
  try {
    const { retrieveCreemCheckout } = await import("@/lib/creem");
    const session = await retrieveCreemCheckout(checkoutId);
    return session;
  } catch (error) {
    console.error("Error retrieving Creem session:", error);
    return null;
  }
} 