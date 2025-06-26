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
import { Loader2, RotateCcw } from "lucide-react";
import { useTranslations } from "next-intl";

interface ReactivateSubscriptionButtonProps {
  subscriptionId?: string;
  userUuid: string;
}

export default function ReactivateSubscriptionButton({ 
  subscriptionId, 
  userUuid 
}: ReactivateSubscriptionButtonProps) {
  const t = useTranslations();
  const [isLoading, setIsLoading] = useState(false);
  const [open, setOpen] = useState(false);

  const handleReactivateSubscription = async () => {
    try {
      setIsLoading(true);
      
      const response = await fetch("/api/reactivate-subscription", {
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
        toast.success(t("my_orders.membership.reactivate_success"));
        setOpen(false);
        // 刷新页面以更新状态
        window.location.reload();
      } else {
        toast.error(data.error || t("my_orders.membership.reactivate_error"));
      }
    } catch (error) {
      console.error("Reactivate subscription error:", error);
      toast.error(t("my_orders.membership.reactivate_error"));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="default" size="sm" className="text-white bg-green-600 hover:bg-green-700">
          <RotateCcw className="h-4 w-4 mr-1" />
          {t("my_orders.membership.reactivate_subscription")}
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t("my_orders.membership.reactivate_confirm_title")}</DialogTitle>
          <DialogDescription>
            {t("my_orders.membership.reactivate_confirm_description")}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="gap-2">
          <Button
            variant="outline"
            onClick={() => setOpen(false)}
            disabled={isLoading}
          >
            {t("my_orders.membership.reactivate_no")}
          </Button>
          <Button
            onClick={handleReactivateSubscription}
            disabled={isLoading}
            className="bg-green-600 hover:bg-green-700"
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                {t("my_orders.membership.reactivating")}
              </>
            ) : (
              t("my_orders.membership.reactivate_yes")
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
} 