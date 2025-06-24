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
        toast.success("Subscription has been set to cancel at the end of the current period");
        setOpen(false);
        // 刷新页面以更新状态
        window.location.reload();
      } else {
        toast.error(data.error || "Failed to cancel subscription");
      }
    } catch (error) {
      console.error("Cancel subscription error:", error);
      toast.error("Failed to cancel subscription, please try again later");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700">
          <X className="h-4 w-4 mr-1" />
          Cancel Subscription
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Confirm Subscription Cancellation</DialogTitle>
          <DialogDescription>
            Are you sure you want to cancel your subscription? Your subscription will be cancelled at the end of the current billing period, and you can still use the service until the period ends.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="gap-2">
          <Button
            variant="outline"
            onClick={() => setOpen(false)}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button
            onClick={handleCancelSubscription}
            disabled={isLoading}
            className="bg-red-600 hover:bg-red-700"
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Processing...
              </>
            ) : (
              "Confirm Cancellation"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
} 