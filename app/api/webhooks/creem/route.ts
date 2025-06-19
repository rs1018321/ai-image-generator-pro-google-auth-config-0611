import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import { handleCreemOrderSession } from "@/services/creem-order";

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

    // 根据事件类型处理不同的webhook事件
    switch (eventType) {
      case "checkout.completed":
      case "payment.succeeded":
        console.log("Processing payment success event");
        
        // 处理支付成功事件
        if (event.data && event.data.object) {
          await handleCreemOrderSession(event.data.object);
        } else {
          console.error("Invalid event data structure");
          return NextResponse.json(
            { error: "Invalid event data" },
            { status: 400 }
          );
        }
        break;

      case "checkout.failed":
      case "payment.failed":
        console.log("Processing payment failure event");
        // 处理支付失败事件
        break;

      case "subscription.created":
        console.log("Processing subscription created event");
        // 处理订阅创建事件
        break;

      case "subscription.updated":
        console.log("Processing subscription updated event");
        // 处理订阅更新事件
        break;

      case "subscription.cancelled":
        console.log("Processing subscription cancelled event");
        // 处理订阅取消事件
        break;

      default:
        console.log("Unhandled webhook event type:", eventType);
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

// 支持GET请求用于webhook验证
export async function GET() {
  return NextResponse.json({ status: "Creem webhook endpoint active" });
} 