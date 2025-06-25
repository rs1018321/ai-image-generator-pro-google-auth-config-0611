import { getLandingPage } from "@/services/page";
import Pricing from "@/components/blocks/pricing";
import { Metadata } from "next";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  
  const title = locale === 'zh' ? '定价 - AI 填色页生成器' : 'Pricing - AI Coloring Page Generator';
  const description = locale === 'zh' 
    ? '选择适合您的套餐，解锁高级填色页生成功能。包含100-1000积分，支持批量处理和高分辨率输出。'
    : 'Choose the perfect plan for your coloring book creation needs. Includes 100-1000 credits with batch processing and high-resolution output.';

  return {
    title,
    description,
    keywords: locale === 'zh' 
      ? '填色页,定价,AI生成,儿童活动,创意工具'
      : 'coloring pages, pricing, AI generation, kids activities, creative tools',
    openGraph: {
      title,
      description,
      type: 'website',
    },
  };
}

export default async function PricingPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const page = await getLandingPage(locale);

  return (
    <div className="min-h-screen">
      {/* Pricing组件 */}
      {page.pricing && <Pricing pricing={page.pricing} />}
    </div>
  );
} 