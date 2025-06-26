"use client";

import React, { useState, useEffect } from "react";
import { Dialog, DialogPortal } from "@/components/ui/dialog";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { cn } from "@/lib/utils";
import { X } from "lucide-react";

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

interface LegalModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  type: "privacy-policy" | "terms-of-service";
  title: string;
}

export default function LegalModal({
  open,
  onOpenChange,
  type,
  title,
}: LegalModalProps) {
  const [content, setContent] = useState<string>("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open) {
      setLoading(true);
      setContent(""); // 清空之前的内容
      // 获取MDX文件内容
      fetch(`/api/legal-content/${type}`)
        .then((response) => response.json())
        .then((data) => {
          setContent(data.content);
        })
        .catch((error) => {
          console.error("Error loading legal content:", error);
          setContent("内容加载失败，请稍后重试。");
        })
        .finally(() => {
          setLoading(false);
        });
    } else {
      // 当模态框关闭时清空内容
      setContent("");
    }
  }, [open, type]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogPortal>
        <GlassOverlay />
        <DialogPrimitive.Content
          className={cn(
            "fixed left-[50%] top-[50%] z-50 grid w-full max-w-4xl translate-x-[-50%] translate-y-[-50%] gap-4 border bg-background/95 backdrop-blur-md p-8 shadow-2xl duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%] sm:rounded-lg w-11/12 sm:w-5/6 md:w-11/12 lg:w-4/5 max-h-[85vh] overflow-y-auto"
          )}
        >
          {/* 关闭按钮 */}
          <DialogPrimitive.Close asChild>
            <button className="absolute right-4 top-4 rounded-full p-1 hover:bg-muted z-10">
              <X className="h-6 w-6" />
              <span className="sr-only">Close</span>
            </button>
          </DialogPrimitive.Close>

          {/* 标题 */}
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-center">{title}</h1>
          </div>

          {/* 内容 */}
          <div className="prose prose-slate dark:prose-invert prose-headings:font-semibold prose-a:text-primary hover:prose-a:text-primary/80 prose-strong:text-base-content prose-code:text-base-content prose-code:bg-muted prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded-md max-w-none">
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                <span className="ml-2">Loading...</span>
              </div>
            ) : (
              <div
                dangerouslySetInnerHTML={{
                  __html: content.replace(/\n/g, "<br/>"),
                }}
              />
            )}
          </div>
        </DialogPrimitive.Content>
      </DialogPortal>
    </Dialog>
  );
} 