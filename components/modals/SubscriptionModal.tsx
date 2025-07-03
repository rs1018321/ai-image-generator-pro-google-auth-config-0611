"use client";

import { Dialog, DialogHeader, DialogTitle, DialogClose, DialogPortal, DialogOverlay } from "@/components/ui/dialog";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { cn } from "@/lib/utils";
import Pricing from "@/components/blocks/pricing";
import { useEffect, useState } from "react";
import { getLandingPage } from "@/services/page";
import { Pricing as PricingType } from "@/types/blocks/pricing";
import { useLocale } from "next-intl";
import { X } from "lucide-react";
import React from "react";

// 自定义磨砂玻璃效果的 Overlay 组件
const GlassOverlay = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Overlay>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Overlay>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Overlay
    ref={ref}
    className={cn(
      "fixed inset-0 z-50 backdrop-blur-sm bg-white/20 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
      className
    )}
    {...props}
  />
));
GlassOverlay.displayName = "GlassOverlay";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function SubscriptionModal({ open, onOpenChange }: Props) {
  const locale = useLocale();
  const [pricing, setPricing] = useState<PricingType | null>(null);

  useEffect(() => {
    async function loadPricing() {
      const page = await getLandingPage(locale);
      setPricing(page.pricing as PricingType);
    }
    if (open && !pricing) {
      loadPricing();
    }
  }, [open, locale, pricing]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogPortal>
        <GlassOverlay />
        <DialogPrimitive.Content
          className={cn(
            "fixed left-[50%] top-[50%] z-50 grid w-full max-w-7xl translate-x-[-50%] translate-y-[-50%] gap-4 border bg-background/95 backdrop-blur-md p-8 shadow-2xl duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%] sm:rounded-lg w-11/12 sm:w-5/6 md:w-11/12 lg:w-5/6 max-h-[90vh] overflow-y-auto"
          )}
        >
          {/* 手动放大关闭按钮，确保可见 */}
          <DialogClose asChild>
            <button className="absolute right-4 top-4 rounded-full p-1 hover:bg-muted">
              <X className="h-6 w-6" />
              <span className="sr-only">Close</span>
            </button>
          </DialogClose>
          <DialogHeader>
            <DialogTitle className="text-3xl font-bold text-center">
              Choose Your Perfect Plan
            </DialogTitle>
            <p className="text-center text-muted-foreground mt-2">
              Flexible monthly subscription plans, cancel anytime
            </p>
          </DialogHeader>

          {/* 仅展示套餐卡片；使用 minimal 模式去除额外内容 */}
          {pricing && <Pricing pricing={pricing} variant="minimal" />}
        </DialogPrimitive.Content>
      </DialogPortal>
    </Dialog>
  );
} 