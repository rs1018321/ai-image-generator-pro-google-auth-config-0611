"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { Loader2, X } from "lucide-react";

interface CancelSubscriptionButtonProps {
  subscriptionId?: string;
  userUuid: string;
}

export default function CancelSubscriptionButton({ 
  subscriptionId, 
  userUuid 
}: CancelSubscriptionButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [open, setOpen] = useState(false);

  const handleCancelSubscription = async () => {
    try {
      setIsLoading(true);
      
      const response = await fetch("/api/cancel-subscription", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          subscriptionId,
          userUuid,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success("订阅已设置为在当前周期结束时取消");
        setOpen(false);
        // 刷新页面以更新状态
        window.location.reload();
      } else {
        toast.error(data.error || "取消订阅失败");
      }
    } catch (error) {
      console.error("Cancel subscription error:", error);
      toast.error("取消订阅失败，请稍后重试");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700">
          <X className="h-4 w-4 mr-1" />
          取消订阅
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>确认取消订阅</DialogTitle>
          <DialogDescription>
            您确定要取消订阅吗？订阅将在当前计费周期结束时取消，您仍可以使用服务直到周期结束。
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="gap-2">
          <Button
            variant="outline"
            onClick={() => setOpen(false)}
            disabled={isLoading}
          >
            取消
          </Button>
          <Button
            onClick={handleCancelSubscription}
            disabled={isLoading}
            className="bg-red-600 hover:bg-red-700"
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                处理中...
              </>
            ) : (
              "确认取消"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
} 