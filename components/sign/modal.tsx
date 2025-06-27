"use client";

import * as React from "react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogOverlay,
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
  DrawerTrigger,
  DrawerPortal,
  DrawerOverlay,
} from "@/components/ui/drawer";
import { SiGithub, SiGmail, SiGoogle } from "react-icons/si";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { signIn } from "next-auth/react";
import { useAppContext } from "@/contexts/app";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import { useTranslations } from "next-intl";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import { Drawer as DrawerPrimitive } from "vaul";

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

export default function SignModal() {
  const t = useTranslations();
  const { showSignModal, setShowSignModal } = useAppContext();

  const [open, setOpen] = React.useState(false);
  const isDesktop = useMediaQuery("(min-width: 768px)");

  if (isDesktop) {
    return (
      <Dialog open={showSignModal} onOpenChange={setShowSignModal}>
        <GlassDialogContent className="sm:max-w-[425px] min-h-[500px]">
          <DialogHeader>
            <DialogTitle>{t("sign_modal.sign_in_title")}</DialogTitle>
            <div className="text-sm text-muted-foreground space-y-2" style={{ 
              fontFamily: "'Comic Sans MS', 'Marker Felt', cursive"
            }}>
              <div style={{ fontSize: '16px', color: '#333' }}>
                Every image costs just 1 credit
              </div>
              <div style={{ fontSize: '16px', color: '#333' }}>
                Try our top-tier AI generator today!
              </div>
              <div style={{ fontSize: '12px', color: '#999', fontStyle: 'italic' }}>
                *Free credits are granted on your first sign-in only
              </div>
            </div>
          </DialogHeader>
          <ProfileForm />
        </GlassDialogContent>
      </Dialog>
    );
  }

  return (
    <Drawer open={showSignModal} onOpenChange={setShowSignModal}>
      <GlassDrawerContent className="min-h-[400px]">
        <DrawerHeader className="text-left">
          <DrawerTitle>{t("sign_modal.sign_in_title")}</DrawerTitle>
          <div className="text-sm text-muted-foreground space-y-2" style={{ 
            fontFamily: "'Comic Sans MS', 'Marker Felt', cursive"
          }}>
            <div style={{ fontSize: '16px', color: '#333' }}>
              Every image costs just 1 credit
            </div>
            <div style={{ fontSize: '16px', color: '#333' }}>
              Try our top-tier AI generator today!
            </div>
            <div style={{ fontSize: '12px', color: '#999', fontStyle: 'italic' }}>
              *Free credits are granted on your first sign-in only
            </div>
          </div>
        </DrawerHeader>
        <ProfileForm className="px-4" />
        <DrawerFooter className="pt-4">
          <DrawerClose asChild>
            <Button variant="outline">{t("sign_modal.cancel_title")}</Button>
          </DrawerClose>
        </DrawerFooter>
      </GlassDrawerContent>
    </Drawer>
  );
}

function ProfileForm({ className }: React.ComponentProps<"form">) {
  const t = useTranslations();
  const { pendingRedirect } = useAppContext();

  return (
    <div className={cn("grid items-start gap-4", className)}>
      {/* <div className="grid gap-2">
        <Label htmlFor="email">{t("sign_modal.email_title")}</Label>
        <Input type="email" id="email" placeholder="xxx@xxx.com" />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="password">{t("sign_modal.password_title")}</Label>
        <Input id="password" type="password" />
      </div>
      <Button type="submit" className="w-full flex items-center gap-2">
        <SiGmail className="w-4 h-4" />
        {t("sign_modal.email_sign_in")}
      </Button> */}

      {process.env.NEXT_PUBLIC_AUTH_GOOGLE_ENABLED === "true" && (
        <Button
          variant="outline"
          className="w-full flex items-center gap-2"
          onClick={() => {
            signIn("google", { 
              callbackUrl: pendingRedirect || window.location.href 
            });
          }}
        >
          <SiGoogle className="w-4 h-4" />
          {t("sign_modal.google_sign_in")}
        </Button>
      )}

      {process.env.NEXT_PUBLIC_AUTH_GITHUB_ENABLED === "true" && (
        <Button
          variant="outline"
          className="w-full flex items-center gap-2"
          onClick={() => {
            signIn("github", { 
              callbackUrl: pendingRedirect || window.location.href 
            });
          }}
        >
          <SiGithub className="w-4 h-4" />
          {t("sign_modal.github_sign_in")}
        </Button>
      )}
    </div>
  );
}
