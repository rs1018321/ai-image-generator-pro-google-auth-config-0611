import { getUserEmail, getUserUuid } from "@/services/user";
import { insertOrder, updateOrderSession } from "@/models/order";
import { respData, respErr } from "@/lib/resp";
import { createCreemCheckout } from "@/lib/creem";
import { getCreemProductId } from "@/lib/creem-products";
import { Order } from "@/types/order";
import { findUserByUuid } from "@/models/user";
import { getSnowId } from "@/lib/hash";

export async function POST(req: Request) {
  try {
    let {
      credits,
      currency,
      amount,
      interval,
      product_id,
      product_name,
      valid_months,
      cancel_url,
      success_url,
    } = await req.json();

    console.log("Creem checkout request received:", {
      product_id,
      product_name,
      amount,
      currency,
      interval,
    });

    // 设置默认URL
    if (!cancel_url) {
      cancel_url = `${
        process.env.NEXT_PUBLIC_PAY_CANCEL_URL ||
        process.env.NEXT_PUBLIC_WEB_URL
      }`;
    }

    if (!success_url) {
      success_url = `${process.env.NEXT_PUBLIC_WEB_URL}/creem-success`;
    }

    // 验证必需参数
    if (!amount || !interval || !currency || !product_id) {
      return respErr("invalid params");
    }

    if (!["year", "month", "one-time"].includes(interval)) {
      return respErr("invalid interval");
    }

    const is_subscription = interval === "month" || interval === "year";

    if (interval === "year" && valid_months !== 12) {
      return respErr("invalid valid_months");
    }

    if (interval === "month" && valid_months !== 1) {
      return respErr("invalid valid_months");
    }

    // 获取用户信息
    const user_uuid = await getUserUuid();
    if (!user_uuid) {
      return respErr("no auth, please sign-in");
    }

    let user_email = await getUserEmail();
    if (!user_email) {
      const user = await findUserByUuid(user_uuid);
      if (user) {
        user_email = user.email;
      }
    }
    if (!user_email) {
      return respErr("invalid user");
    }

    console.log("User info:", { user_uuid, user_email });

    // 生成订单号
    const order_no = getSnowId();
    const currentDate = new Date();
    const created_at = currentDate.toISOString();

    // 计算过期时间
    let expired_at = "";
    const timePeriod = new Date(currentDate);
    timePeriod.setMonth(currentDate.getMonth() + valid_months);
    const timePeriodMillis = timePeriod.getTime();
    let delayTimeMillis = 0;

    // 订阅延迟24小时过期
    if (is_subscription) {
      delayTimeMillis = 24 * 60 * 60 * 1000;
    }

    const newTimeMillis = timePeriodMillis + delayTimeMillis;
    const newDate = new Date(newTimeMillis);
    expired_at = newDate.toISOString();

    // 创建订单记录
    const order: Order = {
      order_no: order_no,
      created_at: created_at,
      user_uuid: user_uuid,
      user_email: user_email,
      amount: amount,
      interval: interval,
      expired_at: expired_at,
      status: "created",
      credits: credits,
      currency: currency,
      product_id: product_id,
      product_name: product_name,
      valid_months: valid_months,
    };
    await insertOrder(order);

    console.log("Order created:", order_no);

    // 获取Creem产品ID
    const creem_product_id = getCreemProductId(product_id);
    console.log("Product ID mapping:", { 
      original: product_id, 
      creem: creem_product_id 
    });

    // 创建Creem Checkout会话
    const checkoutResult = await createCreemCheckout({
      productId: creem_product_id,
      units: 1,
      customerEmail: user_email,
      metadata: {
        order_no: order_no.toString(),
        user_uuid: user_uuid,
        user_email: user_email,
        credits: credits,
        product_name: product_name,
        project: process.env.NEXT_PUBLIC_PROJECT_NAME || "",
        interval: interval,
        amount: amount,
        currency: currency,
        original_product_id: product_id,
      },
      /*successUrl: `${success_url}/{CHECKOUT_ID}`,*/
      successUrl: success_url,
      cancelUrl: cancel_url,
    });

    if (!checkoutResult) {
      throw new Error("Failed to create Creem checkout");
    }

    // 更新订单的checkout信息
    const checkout_id = checkoutResult.id;
    const order_detail = JSON.stringify(checkoutResult);
    
    // 更新订单记录（使用checkout_id替代stripe_session_id）
    await updateOrderSession(order_no, checkout_id, order_detail);

    console.log("Checkout created successfully:", checkout_id);

    return respData({
      order_no: order_no,
      checkout_id: checkout_id,
      checkout_url: checkoutResult.checkoutUrl,
    });
  } catch (e: any) {
    console.log("creem checkout failed: ", e);
    return respErr("checkout failed: " + e.message);
  }
} 