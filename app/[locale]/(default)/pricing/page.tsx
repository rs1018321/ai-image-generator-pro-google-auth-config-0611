import { getLandingPage } from "@/services/page";
import Pricing from "@/components/blocks/pricing";
import { Metadata } from "next";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  
  const title = 'Pricing - Coloring-Pages.app';
  const description = 'Choose from our flexible pricing plans for AI-generated coloring pages. Free tier available with premium options for unlimited access.';

  let canonicalUrl = `${process.env.NEXT_PUBLIC_WEB_URL}/pricing`;

  if (locale !== "en") {
    canonicalUrl = `${process.env.NEXT_PUBLIC_WEB_URL}/${locale}/pricing`;
  }

  return {
    title,
    description,
    keywords: 'coloring pages pricing, subscription plans, AI coloring generator cost, premium coloring pages',
    alternates: {
      canonical: canonicalUrl,
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