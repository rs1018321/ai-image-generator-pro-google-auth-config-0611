import { getCreemSessionById, handleCreemOrderSession } from "@/services/creem-order";
import { redirect } from "next/navigation";

interface CreemSuccessPageProps {
  params: {
    checkout_id: string;
    locale: string;
  };
}

export default async function CreemSuccessPage({ params }: CreemSuccessPageProps) {
  const { checkout_id, locale } = params;

  try {
    console.log("Processing Creem success page for checkout:", checkout_id);
    
    // 获取Creem会话信息
    const session = await getCreemSessionById(checkout_id);
    
    if (!session) {
      console.error("Creem session not found:", checkout_id);
      redirect(`/${locale}/payment-failed`);
    }

    // 处理订单会话
    const success = await handleCreemOrderSession(session);
    
    if (success) {
      console.log("Creem order processed successfully");
      redirect(`/${locale}/payment-success`);
    } else {
      console.error("Failed to process Creem order");
      redirect(`/${locale}/payment-failed`);
    }
  } catch (error) {
    console.error("Error processing Creem success:", error);
    redirect(`/${locale}/payment-failed`);
  }
} 