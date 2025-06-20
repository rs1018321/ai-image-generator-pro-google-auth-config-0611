import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { getActiveSubscriptionByUserId } from "@/models/subscription";

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const subscription = await getActiveSubscriptionByUserId(session.user.id);
    
    return NextResponse.json({
      subscription: subscription
    });
  } catch (error) {
    console.error("Error fetching user subscription:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
} 