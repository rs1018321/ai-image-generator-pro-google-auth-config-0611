"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogPortal,
} from "@/components/ui/dialog";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerPortal,
} from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { useAppContext } from "@/contexts/app";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import { useTranslations } from "next-intl";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import { Drawer as DrawerPrimitive } from "vaul";
import { cn } from "@/lib/utils";

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

// 自定义磨砂玻璃效果的 Drawer Overlay 组件
const GlassDrawerOverlay = React.forwardRef<
  React.ElementRef<typeof DrawerPrimitive.Overlay>,
  React.ComponentPropsWithoutRef<typeof DrawerPrimitive.Overlay>
>(({ className, ...props }, ref) => (
  <DrawerPrimitive.Overlay
    ref={ref}
    className={cn("fixed inset-0 z-50 backdrop-blur-sm bg-white/20", className)}
    {...props}
  />
));
GlassDrawerOverlay.displayName = "GlassDrawerOverlay";

// 自定义带磨砂玻璃背景的 DialogContent
const GlassDialogContent = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content>
>(({ className, children, ...props }, ref) => (
  <DialogPortal>
    <GlassOverlay />
    <DialogPrimitive.Content
      ref={ref}
      className={cn(
        "fixed left-[50%] top-[50%] z-50 grid w-full max-w-lg translate-x-[-50%] translate-y-[-50%] gap-4 border bg-background/95 backdrop-blur-md p-6 shadow-2xl duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%] sm:rounded-lg",
        className
      )}
      {...props}
    >
      {children}
      <DialogPrimitive.Close className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground">
        <X className="h-4 w-4" />
        <span className="sr-only">Close</span>
      </DialogPrimitive.Close>
    </DialogPrimitive.Content>
  </DialogPortal>
));
GlassDialogContent.displayName = "GlassDialogContent";

// 自定义带磨砂玻璃背景的 DrawerContent
const GlassDrawerContent = React.forwardRef<
  React.ElementRef<typeof DrawerPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof DrawerPrimitive.Content>
>(({ className, children, ...props }, ref) => (
  <DrawerPortal>
    <GlassDrawerOverlay />
    <DrawerPrimitive.Content
      ref={ref}
      className={cn(
        "fixed inset-x-0 bottom-0 z-50 mt-24 flex h-auto flex-col rounded-t-[10px] border bg-background/95 backdrop-blur-md",
        className
      )}
      {...props}
    >
      <div className="mx-auto mt-4 h-2 w-[100px] rounded-full bg-muted" />
      {children}
    </DrawerPrimitive.Content>
  </DrawerPortal>
));
GlassDrawerContent.displayName = "GlassDrawerContent";

export default function SubscriptionModal() {
  const t = useTranslations();
  const router = useRouter();
  const { showSubscriptionModal, setShowSubscriptionModal } = useAppContext();
  const isDesktop = useMediaQuery("(min-width: 768px)");

  const handleViewPlans = () => {
    setShowSubscriptionModal(false);
    router.push('/pricing');
  };

  if (isDesktop) {
    return (
      <Dialog open={showSubscriptionModal} onOpenChange={setShowSubscriptionModal}>
        <GlassDialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Subscribe to Unlock</DialogTitle>
            <DialogDescription>
            Any plan will remove the watermark and give you access to extra creative tools.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <Button onClick={handleViewPlans} className="w-full">
            View Plans
            </Button>
            <Button 
              variant="outline" 
              onClick={() => setShowSubscriptionModal(false)}
              className="w-full"
            >
              Maybe Later
            </Button>
          </div>
        </GlassDialogContent>
      </Dialog>
    );
  }

  return (
    <Drawer open={showSubscriptionModal} onOpenChange={setShowSubscriptionModal}>
      <GlassDrawerContent>
        <DrawerHeader className="text-left">
          <DrawerTitle>Subscribe to Unlock</DrawerTitle>
          <DrawerDescription>
          Any plan will remove the watermark and give you access to extra creative tools.
          </DrawerDescription>
        </DrawerHeader>
        <div className="px-4 pb-4">
          <Button onClick={handleViewPlans} className="w-full mb-2">
          View Plans
          </Button>
        </div>
        <DrawerFooter className="pt-2">
          <DrawerClose asChild>
            <Button variant="outline">Maybe Later</Button>
          </DrawerClose>
        </DrawerFooter>
      </GlassDrawerContent>
    </Drawer>
  );
} 