"use client";

import React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogPortal,
} from "@/components/ui/dialog";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { useTranslations } from "next-intl";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { X } from "lucide-react";
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

export default function InviteModal({
  open,
  setOpen,
  username,
  initInviteCode,
  updateInviteCode,
  loading,
}: {
  open: boolean;
  setOpen: (open: boolean) => void;
  username: string;
  initInviteCode: string;
  updateInviteCode: (invite_code: string) => void;
  loading: boolean;
}) {
  const t = useTranslations();
  const [inviteCode, setInviteCode] = useState(initInviteCode);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <GlassDialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{t("my_invites.update_invite_code")}</DialogTitle>
          <DialogDescription>
            {t("my_invites.update_invite_code_tip")}
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-1 items-center gap-4">
            <Input
              placeholder={`${username}`}
              value={inviteCode}
              onChange={(e) => setInviteCode(e.target.value)}
              className="w-full"
            />
          </div>
        </div>
        <DialogFooter>
          <Button
            onClick={() => updateInviteCode(inviteCode)}
            disabled={loading}
          >
            {t("my_invites.update_invite_button")}
          </Button>
        </DialogFooter>
      </GlassDialogContent>
    </Dialog>
  );
}
