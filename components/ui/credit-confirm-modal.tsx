"use client";

import * as React from "react";

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

interface CreditConfirmModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  credits: number;
  leftCredits: number;
}

export default function CreditConfirmModal({
  open,
  onOpenChange,
  onConfirm,
  credits,
  leftCredits,
}: CreditConfirmModalProps) {
  const t = useTranslations();
  const isDesktop = useMediaQuery("(min-width: 768px)");

  const handleConfirm = () => {
    onConfirm();
    onOpenChange(false);
  };

  const handleCancel = () => {
    onOpenChange(false);
  };

  if (isDesktop) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <GlassDialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle style={{ 
              fontFamily: "'Comic Sans MS', 'Marker Felt', cursive",
              color: '#679fb5',
              fontSize: '24px'
            }}>
              Confirm Image Generation
            </DialogTitle>
            <DialogDescription style={{ 
              fontFamily: "'Comic Sans MS', 'Marker Felt', cursive",
              fontSize: '16px',
              color: '#666'
            }}>
              Generating image will consume {credits} credit
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4" style={{ 
            fontFamily: "'Comic Sans MS', 'Marker Felt', cursive"
          }}>
            <div className="flex justify-between items-center mb-4">
              <span style={{ fontSize: '16px', color: '#333' }}>Current credit balance:</span>
              <span style={{ 
                fontSize: '18px', 
                fontWeight: 'bold', 
                color: leftCredits >= credits ? '#4CAF50' : '#f44336' 
              }}>
                {leftCredits} credits
              </span>
            </div>
            
            <div className="flex justify-between items-center mb-4">
              <span style={{ fontSize: '16px', color: '#333' }}>This generation:</span>
              <span style={{ 
                fontSize: '18px', 
                fontWeight: 'bold', 
                color: '#ff9800' 
              }}>
                -{credits} credit{credits > 1 ? 's' : ''}
              </span>
            </div>
            
            <div className="flex justify-between items-center border-t pt-2">
              <span style={{ fontSize: '16px', color: '#333' }}>Balance after generation:</span>
              <span style={{ 
                fontSize: '18px', 
                fontWeight: 'bold', 
                color: leftCredits >= credits ? '#4CAF50' : '#f44336' 
              }}>
                {Math.max(0, leftCredits - credits)} credits
              </span>
            </div>
          </div>

          <div className="flex gap-3">
            <Button 
              variant="outline" 
              onClick={handleCancel}
              className="flex-1"
              style={{
                fontFamily: "'Comic Sans MS', 'Marker Felt', cursive",
                fontSize: '16px'
              }}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleConfirm}
              className="flex-1"
              disabled={leftCredits < credits}
              style={{
                fontFamily: "'Comic Sans MS', 'Marker Felt', cursive",
                fontSize: '16px',
                backgroundColor: leftCredits >= credits ? '#679fb5' : '#ccc',
                borderColor: leftCredits >= credits ? '#679fb5' : '#ccc'
              }}
            >
              {leftCredits >= credits ? 'Confirm Generation' : 'Insufficient Credits'}
            </Button>
          </div>
        </GlassDialogContent>
      </Dialog>
    );
  }

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <GlassDrawerContent>
        <DrawerHeader className="text-left">
          <DrawerTitle style={{ 
            fontFamily: "'Comic Sans MS', 'Marker Felt', cursive",
            color: '#679fb5',
            fontSize: '24px'
          }}>
            Confirm Image Generation
          </DrawerTitle>
          <DrawerDescription style={{ 
            fontFamily: "'Comic Sans MS', 'Marker Felt', cursive",
            fontSize: '16px',
            color: '#666'
          }}>
            Generating image will consume {credits} credit
          </DrawerDescription>
        </DrawerHeader>
        
        <div className="px-4 py-4" style={{ 
          fontFamily: "'Comic Sans MS', 'Marker Felt', cursive"
        }}>
          <div className="flex justify-between items-center mb-4">
            <span style={{ fontSize: '16px', color: '#333' }}>Current credit balance:</span>
            <span style={{ 
              fontSize: '18px', 
              fontWeight: 'bold', 
              color: leftCredits >= credits ? '#4CAF50' : '#f44336' 
            }}>
              {leftCredits} credits
            </span>
          </div>
          
          <div className="flex justify-between items-center mb-4">
            <span style={{ fontSize: '16px', color: '#333' }}>This generation:</span>
            <span style={{ 
              fontSize: '18px', 
              fontWeight: 'bold', 
              color: '#ff9800' 
            }}>
              -{credits} credit{credits > 1 ? 's' : ''}
            </span>
          </div>
          
          <div className="flex justify-between items-center border-t pt-2">
            <span style={{ fontSize: '16px', color: '#333' }}>Balance after generation:</span>
            <span style={{ 
              fontSize: '18px', 
              fontWeight: 'bold', 
              color: leftCredits >= credits ? '#4CAF50' : '#f44336' 
            }}>
              {Math.max(0, leftCredits - credits)} credits
            </span>
          </div>
        </div>

        <DrawerFooter className="pt-2">
          <Button 
            onClick={handleConfirm}
            disabled={leftCredits < credits}
            style={{
              fontFamily: "'Comic Sans MS', 'Marker Felt', cursive",
              fontSize: '16px',
              backgroundColor: leftCredits >= credits ? '#679fb5' : '#ccc',
              borderColor: leftCredits >= credits ? '#679fb5' : '#ccc'
            }}
          >
            {leftCredits >= credits ? 'Confirm Generation' : 'Insufficient Credits'}
          </Button>
          <DrawerClose asChild>
            <Button 
              variant="outline"
              style={{
                fontFamily: "'Comic Sans MS', 'Marker Felt', cursive",
                fontSize: '16px'
              }}
            >
              Cancel
            </Button>
          </DrawerClose>
        </DrawerFooter>
      </GlassDrawerContent>
    </Drawer>
  );
} 