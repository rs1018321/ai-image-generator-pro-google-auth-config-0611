import { Metadata } from "next";
import AdultColoringPagesContent from './content';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const canonicalUrl = locale === 'en'
    ? `${process.env.NEXT_PUBLIC_WEB_URL}/printable/adult-coloring-pages`
    : `${process.env.NEXT_PUBLIC_WEB_URL}/${locale}/printable/adult-coloring-pages`;

  return {
    title: 'Adult Coloring Pages',
    description: 'Relax and unwind with our collection of intricate adult coloring pages. Printable designs featuring mandalas, nature, and abstract patterns.',
    alternates: {
      canonical: canonicalUrl,
    },
  };
}

export default function AdultColoringPagesPage() {
  return <AdultColoringPagesContent />;
} 