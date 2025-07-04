import { Metadata } from "next";
import BlueyColoringPagesContent from './content';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const canonicalUrl = locale === 'en'
    ? `${process.env.NEXT_PUBLIC_WEB_URL}/printable/bluey-coloring-pages`
    : `${process.env.NEXT_PUBLIC_WEB_URL}/${locale}/printable/bluey-coloring-pages`;

  return {
    title: 'Bluey Coloring Pages',
    description: 'Join Bluey and her family with our collection of Bluey coloring pages. Printable fun for all young fans.',
    alternates: {
      canonical: canonicalUrl,
    },
  };
}

export default function BlueyColoringPagesPage() {
  return <BlueyColoringPagesContent />;
} 