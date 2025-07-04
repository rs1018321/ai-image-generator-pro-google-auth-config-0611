import { Metadata } from "next";
import ColoringPagesForKidsContent from './content';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const canonicalUrl = locale === 'en'
    ? `${process.env.NEXT_PUBLIC_WEB_URL}/printable/coloring-pages-for-kids`
    : `${process.env.NEXT_PUBLIC_WEB_URL}/${locale}/printable/coloring-pages-for-kids`;

  return {
    title: 'Coloring Pages for Kids',
    description: 'Fun and engaging coloring pages for kids. Printable sheets featuring animals, cartoons, and more.',
    alternates: {
      canonical: canonicalUrl,
    },
  };
}

export default function ColoringPagesForKidsPage() {
  return <ColoringPagesForKidsContent />;
} 