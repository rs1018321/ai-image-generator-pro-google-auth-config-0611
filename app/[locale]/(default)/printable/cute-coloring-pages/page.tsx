import { Metadata } from "next";
import CuteColoringPagesContent from './content';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const canonicalUrl = locale === 'en'
    ? `${process.env.NEXT_PUBLIC_WEB_URL}/printable/cute-coloring-pages`
    : `${process.env.NEXT_PUBLIC_WEB_URL}/${locale}/printable/cute-coloring-pages`;

  return {
    title: 'Cute Coloring Pages',
    description: 'Discover adorable and cute coloring pages. Perfect for all ages, featuring charming animals, foods, and characters.',
    alternates: {
      canonical: canonicalUrl,
    },
  };
}

export default function CuteColoringPagesPage() {
  return <CuteColoringPagesContent />;
} 