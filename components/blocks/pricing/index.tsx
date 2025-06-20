"use client";

import { Check, Loader } from "lucide-react";
import { PricingItem, Pricing as PricingType } from "@/types/blocks/pricing";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useEffect, useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Icon from "@/components/icon";
import { Label } from "@/components/ui/label";
// import { loadStripe } from "@stripe/stripe-js"; // 注释掉Stripe
import { toast } from "sonner";
import { useAppContext } from "@/contexts/app";
import { useLocale } from "next-intl";
import { useSession } from "next-auth/react";

interface UserSubscription {
  id?: string;
  user_uuid: string;
  product_id: string;
  status: string;
}

export default function Pricing({ pricing }: { pricing: PricingType }) {
  const { user, setShowSignModal } = useAppContext();
  const locale = useLocale();

  const [group, setGroup] = useState(pricing.groups?.[0]?.name);
  const [isLoading, setIsLoading] = useState(false);
  const [productId, setProductId] = useState<string | null>(null);
  const [userSubscription, setUserSubscription] = useState<UserSubscription | null>(null);
  const [subscriptionLoading, setSubscriptionLoading] = useState(false);

  // 获取用户订阅状态
  useEffect(() => {
    async function fetchUserSubscription() {
      if (!user) return;

      setSubscriptionLoading(true);
      try {
        const response = await fetch('/api/get-user-subscription');
        if (response.ok) {
          const data = await response.json();
          setUserSubscription(data.subscription);
        } else {
          console.error('Failed to fetch user subscription');
          setUserSubscription(null);
        }
      } catch (error) {
        console.error('Error fetching subscription:', error);
        setUserSubscription(null);
      } finally {
        setSubscriptionLoading(false);
      }
    }

    fetchUserSubscription();
  }, [user]);

  if (pricing.disabled) {
    return <></>;
  }

  // 检查用户是否已订阅特定产品
  const isUserSubscribed = (productId: string) => {
    return userSubscription?.product_id === productId && userSubscription?.status === 'active';
  };

  // 获取按钮状态
  const getButtonState = (item: PricingItem) => {
    const isSubscribed = isUserSubscribed(item.product_id);
    if (subscriptionLoading) {
      return { text: "检查订阅状态...", disabled: true };
    }
    if (isSubscribed) {
      return { text: "您已是该等级会员", disabled: true };
    }
    return { text: item.button?.text || "选择套餐", disabled: false };
  };

  // 使用Creem支付的处理函数
  const handleCreemCheckout = async (item: PricingItem, cn_pay: boolean = false) => {
    try {
      if (!user) {
        setShowSignModal(true);
        return;
      }

      // 检查是否已经订阅了该产品
      if (isUserSubscribed(item.product_id)) {
        toast.error("您已经是该等级的会员了！");
        return;
      }

      const success_url = `${window.location.origin}/${locale}/my-orders?success=true`;
      const cancel_url = `${window.location.origin}/${locale}/pricing`;

      const params = {
        product_id: item.product_id,
        product_name: item.product_name,
        credits: item.credits,
        interval: item.interval,
        amount: cn_pay ? item.cn_amount : item.amount,
        currency: cn_pay ? "cny" : item.currency,
        valid_months: item.valid_months,
        success_url,
        cancel_url,
      };

      setIsLoading(true);
      setProductId(item.product_id);

      // 调用Creem checkout API
      const response = await fetch("/api/creem-checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(params),
      });

      if (response.status === 401) {
        setIsLoading(false);
        setProductId(null);
        setShowSignModal(true);
        return;
      }

      const { code, message, data } = await response.json();
      if (code !== 0) {
        toast.error(message);
        return;
      }

      const { checkout_url } = data;

      // 直接跳转到Creem的checkout页面
      if (checkout_url) {
        window.location.href = checkout_url;
      } else {
        toast.error("Failed to get checkout URL");
      }
    } catch (e) {
      console.log("Creem checkout failed: ", e);
      toast.error("Checkout failed");
    } finally {
      setIsLoading(false);
      setProductId(null);
    }
  };

  // 原有的Stripe处理函数（保留但注释掉）
  /*
  const handleCheckout = async (item: PricingItem, cn_pay: boolean = false) => {
    try {
      if (!user) {
        setShowSignModal(true);
        return;
      }

      const params = {
        product_id: item.product_id,
        product_name: item.product_name,
        credits: item.credits,
        interval: item.interval,
        amount: cn_pay ? item.cn_amount : item.amount,
        currency: cn_pay ? "cny" : item.currency,
        valid_months: item.valid_months,
      };

      setIsLoading(true);
      setProductId(item.product_id);

      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(params),
      });

      if (response.status === 401) {
        setIsLoading(false);
        setProductId(null);

        setShowSignModal(true);
        return;
      }

      const { code, message, data } = await response.json();
      if (code !== 0) {
        toast.error(message);
        return;
      }

      const { public_key, session_id } = data;

      const stripe = await loadStripe(public_key);
      if (!stripe) {
        toast.error("checkout failed");
        return;
      }

      const result = await stripe.redirectToCheckout({
        sessionId: session_id,
      });

      if (result.error) {
        toast.error(result.error.message);
      }
    } catch (e) {
      console.log("checkout failed: ", e);

      toast.error("checkout failed");
    } finally {
      setIsLoading(false);
      setProductId(null);
    }
  };
  */

  useEffect(() => {
    if (pricing.items) {
      setGroup(pricing.items[0].group);
      setProductId(pricing.items[0].product_id);
      setIsLoading(false);
    }
  }, [pricing.items]);

  return (
    <section className="py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          {pricing.title && (
            <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
              {pricing.title}
            </h2>
          )}
          {pricing.description && (
            <p className="mx-auto mt-6 max-w-2xl text-center text-lg leading-8 text-gray-600">
              {pricing.description}
            </p>
          )}
        </div>
        <div className="mx-auto mt-16 max-w-4xl">
          {pricing.groups && pricing.groups.length > 1 && (
            <div className="mx-auto max-w-md">
              <RadioGroup
                defaultValue={pricing.groups[0].name}
                onValueChange={setGroup}
                className="grid grid-cols-2 gap-x-1 rounded-full bg-white/5 p-1 text-center text-xs font-semibold leading-5 ring-1 ring-inset ring-white/10"
              >
                {pricing.groups.map((item, i) => {
                  return (
                    <div
                      key={i}
                      className='h-full rounded-md transition-all has-[button[data-state="checked"]]:bg-white'
                    >
                      <RadioGroupItem
                        value={item.name || ""}
                        id={item.name}
                        className="peer sr-only"
                      />
                      <Label
                        htmlFor={item.name}
                        className="flex h-full cursor-pointer items-center justify-center px-7 font-semibold text-muted-foreground peer-data-[state=checked]:text-primary"
                      >
                        {item.title}
                        {item.label && (
                          <Badge
                            variant="outline"
                            className="border-primary bg-primary px-1.5 ml-1 text-primary-foreground"
                          >
                            {item.label}
                          </Badge>
                        )}
                      </Label>
                    </div>
                  );
                })}
              </RadioGroup>
            </div>
          )}
          <div className="isolate mx-auto mt-10 grid max-w-md grid-cols-1 gap-8 lg:mx-0 lg:max-w-none lg:grid-cols-3">
            {pricing.items?.map((item, index) => {
              if (item.group && item.group !== group) {
                return null;
              }

              const buttonState = getButtonState(item);
              const isSubscribed = isUserSubscribed(item.product_id);

              return (
                <div
                  key={index}
                  className={`flex flex-col justify-between rounded-3xl bg-white p-8 ring-1 xl:p-10 ${
                    item.is_featured
                      ? "ring-2 ring-primary"
                      : "ring-gray-200"
                  } ${isSubscribed ? "bg-green-50 ring-green-200" : ""}`}
                >
                  <div>
                    <div className="flex items-center justify-between gap-x-4">
                      <h3
                        className={`text-lg font-semibold leading-8 ${
                          item.is_featured
                            ? "text-primary"
                            : "text-gray-900"
                        }`}
                      >
                        {item.title}
                      </h3>
                      <div className="flex gap-2">
                        {item.label && (
                          <Badge
                            variant="outline"
                            className="border-primary bg-primary text-primary-foreground"
                          >
                            {item.label}
                          </Badge>
                        )}
                        {isSubscribed && (
                          <Badge variant="default" className="bg-green-600">
                            当前套餐
                          </Badge>
                        )}
                      </div>
                    </div>

                    <div className="flex items-end gap-2 mb-4">
                      {item.original_price && (
                        <span className="text-xl text-muted-foreground font-semibold line-through">
                          {item.original_price}
                        </span>
                      )}
                      {item.price && (
                        <span className="text-5xl font-semibold">
                          {item.price}
                        </span>
                      )}
                      {item.unit && (
                        <span className="block font-semibold">
                          {item.unit}
                        </span>
                      )}
                    </div>
                    {item.description && (
                      <p className="text-muted-foreground">
                        {item.description}
                      </p>
                    )}
                    {item.features_title && (
                      <p className="mb-3 mt-6 font-semibold">
                        {item.features_title}
                      </p>
                    )}
                    {item.features && (
                      <ul className="flex flex-col gap-3">
                        {item.features.map((feature, fi) => {
                          return (
                            <li className="flex gap-2" key={`feature-${fi}`}>
                              <Check className="mt-1 size-4 shrink-0" />
                              {feature}
                            </li>
                          );
                        })}
                      </ul>
                    )}
                  </div>
                  <div className="flex flex-col gap-2">
                    {item.cn_amount && item.cn_amount > 0 && !isSubscribed ? (
                      <div className="flex items-center gap-x-2 mt-2">
                        <span className="text-sm">人民币支付 👉</span>
                        <div
                          className={`inline-block p-2 rounded-md ${
                            buttonState.disabled 
                              ? "opacity-50 cursor-not-allowed" 
                              : "hover:cursor-pointer hover:bg-base-200"
                          }`}
                          onClick={() => {
                            if (isLoading || buttonState.disabled) {
                              return;
                            }
                            handleCreemCheckout(item, true);
                          }}
                        >
                          <img
                            src="/imgs/cnpay.png"
                            alt="cnpay"
                            className="w-20 h-10 rounded-lg"
                          />
                        </div>
                      </div>
                    ) : null}
                    {item.button && (
                      <Button
                        className="w-full flex items-center justify-center gap-2 font-semibold"
                        disabled={isLoading || buttonState.disabled}
                        onClick={() => {
                          if (isLoading || buttonState.disabled) {
                            return;
                          }
                          handleCreemCheckout(item);
                        }}
                        variant={isSubscribed ? "secondary" : "default"}
                      >
                        {(!isLoading ||
                          (isLoading && productId !== item.product_id)) && (
                          <p>{buttonState.text}</p>
                        )}

                        {isLoading && productId === item.product_id && (
                          <p>{buttonState.text}</p>
                        )}
                        {isLoading && productId === item.product_id && (
                          <Loader className="mr-2 h-4 w-4 animate-spin" />
                        )}
                        {item.button.icon && !isSubscribed && (
                          <Icon name={item.button.icon} className="size-4" />
                        )}
                      </Button>
                    )}
                    {item.tip && (
                      <p className="text-muted-foreground text-sm mt-2">
                        {item.tip}
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
