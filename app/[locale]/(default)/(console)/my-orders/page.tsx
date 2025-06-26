import { getOrdersByPaidEmail, getOrdersByUserUuid } from "@/models/order";
import { getUserEmail, getUserUuid } from "@/services/user";
import { getUserSubscription, getUserMembershipLevel, isSubscriptionActive } from "@/models/subscription";

import { TableColumn } from "@/types/blocks/table";
import TableSlot from "@/components/console/slots/table";
import { Table as TableSlotType } from "@/types/slots/table";
import { getTranslations } from "next-intl/server";
import moment from "moment";
import { redirect } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CalendarDays, Crown, Shield, Star, AlertCircle, CheckCircle } from "lucide-react";
import CancelSubscriptionButton from "@/components/subscription/cancel-subscription-button";

interface PageProps {
  searchParams: Promise<{ success?: string }>;
}

export default async function MyOrdersPage({ searchParams }: PageProps) {
  const t = await getTranslations();
  const { success } = await searchParams;

  const user_uuid = await getUserUuid();
  const user_email = await getUserEmail();

  const callbackUrl = `${process.env.NEXT_PUBLIC_WEB_URL}/my-orders`;
  if (!user_uuid) {
    redirect(`/auth/signin?callbackUrl=${encodeURIComponent(callbackUrl)}`);
  }

  // 强制刷新：获取用户订阅信息
  const subscription = await getUserSubscription(user_uuid);
  const membershipLevel = getUserMembershipLevel(subscription);
  const isActive = isSubscriptionActive(subscription);

  let orders = await getOrdersByUserUuid(user_uuid);
  if (!orders || orders.length === 0) {
    orders = await getOrdersByPaidEmail(user_email);
  }

  // 获取会员等级图标和颜色
  const getMembershipIcon = (level: string) => {
    switch (level) {
      case 'starter':
        return <Star className="h-4 w-4" />;
      case 'standard':
        return <Shield className="h-4 w-4" />;
      case 'premium':
        return <Crown className="h-4 w-4" />;
      default:
        return <AlertCircle className="h-4 w-4" />;
    }
  };

  const getMembershipBadge = (level: string) => {
    switch (level) {
      case 'starter':
        return <Badge variant="secondary" className="gap-1">
          {getMembershipIcon(level)}
          {t("my_orders.membership.starter")}
        </Badge>;
      case 'standard':
        return <Badge variant="default" className="gap-1">
          {getMembershipIcon(level)}
          {t("my_orders.membership.standard")}
        </Badge>;
      case 'premium':
        return <Badge variant="destructive" className="gap-1">
          {getMembershipIcon(level)}
          {t("my_orders.membership.premium")}
        </Badge>;
      default:
        return <Badge variant="outline" className="gap-1">
          {getMembershipIcon(level)}
          {t("my_orders.membership.non_member")}
        </Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* 支付成功提示 */}
      {success === 'true' && (
        <Card className="border-green-200 bg-green-50">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 text-green-800">
              <CheckCircle className="h-5 w-5" />
              <p className="font-medium">{t("my_orders.membership.subscription_success")}</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* 会员状态卡片 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {t("my_orders.membership.title")}
            {getMembershipBadge(membershipLevel)}
          </CardTitle>
          <CardDescription>
            {t("my_orders.membership.description")}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {subscription && isActive ? (
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <CalendarDays className="h-4 w-4" />
                {subscription.cancel_at_period_end ? (
                  t("my_orders.membership.expires_at", {
                    date: moment(subscription.current_period_end).format("YYYY-MM-DD HH:mm:ss")
                  })
                ) : (
                  `Renews on ${moment(subscription.current_period_end).format("YYYY-MM-DD HH:mm:ss")}`
                )}
              </div>
              
              <div className="text-sm">
                {t("my_orders.membership.monthly_credits", {
                  credits: subscription.credits_monthly
                })}
              </div>

              {subscription.cancel_at_period_end ? (
                <div className="p-3 rounded-lg bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800">
                  <p className="text-sm text-yellow-800 dark:text-yellow-200">
                    {t("my_orders.membership.will_expire")}
                  </p>
                </div>
              ) : (
                <div className="flex gap-2">
                  <CancelSubscriptionButton 
                    subscriptionId={subscription.creem_subscription_id}
                    userUuid={user_uuid}
                  />
                  <Button variant="outline" asChild>
                    <a href="/pricing" target="_blank">
                      {t("my_orders.membership.upgrade")}
                    </a>
                  </Button>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground">
                {t("my_orders.membership.no_subscription")}
              </p>
              <Button asChild>
                <a href="/pricing" target="_blank">
                  {t("my_orders.membership.subscribe_now")}
                </a>
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
