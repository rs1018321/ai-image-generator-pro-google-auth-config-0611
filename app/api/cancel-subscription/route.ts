import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { cancelSubscription } from "@/models/subscription";

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { userUuid } = await request.json();

    if (!userUuid || userUuid !== session.user.id) {
      return NextResponse.json(
        { error: "Invalid user" },
        { status: 400 }
      );
    }

    // 取消订阅（设置在当前周期结束时取消）
    const result = await cancelSubscription(userUuid);

    if (!result) {
      return NextResponse.json(
        { error: "No active subscription found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Subscription will be cancelled at the end of current period"
    });
  } catch (error) {
    console.error("Error cancelling subscription:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
} 