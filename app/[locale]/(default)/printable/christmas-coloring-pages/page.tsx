import { Metadata } from "next";
import ChristmasColoringPagesContent from './content';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const canonicalUrl = locale === 'en'
    ? `${process.env.NEXT_PUBLIC_WEB_URL}/printable/christmas-coloring-pages`
    : `${process.env.NEXT_PUBLIC_WEB_URL}/${locale}/printable/christmas-coloring-pages`;

  return {
    title: 'Christmas Coloring Pages',
    description: 'Get into the holiday spirit with our festive Christmas coloring pages. Printable sheets of Santa, reindeer, and more.',
    alternates: {
      canonical: canonicalUrl,
    },
  };
}

export default function ChristmasColoringPagesPage() {
  return <ChristmasColoringPagesContent />;
} 