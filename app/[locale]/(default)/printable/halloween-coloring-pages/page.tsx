import { Metadata } from "next";
import HalloweenColoringPagesContent from './content';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const canonicalUrl = locale === 'en'
    ? `${process.env.NEXT_PUBLIC_WEB_URL}/printable/halloween-coloring-pages`
    : `${process.env.NEXT_PUBLIC_WEB_URL}/${locale}/printable/halloween-coloring-pages`;

  return {
    title: 'Halloween Coloring Pages',
    description: 'Spooky and fun Halloween coloring pages for all ages. Printable designs of pumpkins, ghosts, and witches.',
    alternates: {
      canonical: canonicalUrl,
    },
  };
}

export default function HalloweenColoringPagesPage() {
  return <HalloweenColoringPagesContent />;
} 