import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { updateSubscriptionStatus } from "@/models/subscription";

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { userUuid, subscriptionId } = await request.json();

    if (!userUuid || userUuid !== session.user.id) {
      return NextResponse.json(
        { error: "Invalid user" },
        { status: 400 }
      );
    }

    if (!subscriptionId) {
      return NextResponse.json(
        { error: "Subscription ID is required" },
        { status: 400 }
      );
    }

    // 重新激活订阅（取消取消标志）
    const result = await updateSubscriptionStatus(subscriptionId, {
      cancel_at_period_end: false,
    });

    if (!result) {
      return NextResponse.json(
        { error: "Subscription not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Subscription has been reactivated successfully"
    });
  } catch (error) {
    console.error("Error reactivating subscription:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
} 