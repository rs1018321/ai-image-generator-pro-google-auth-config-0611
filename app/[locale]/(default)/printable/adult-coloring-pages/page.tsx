import { Metadata } from "next";
import AdultColoringPagesContent from './content';

export const metadata: Metadata = {
  title: 'Free Adult Coloring Pages – Mandalas, Floral & Zen Patterns',
  description:
    'Relax with 150+ intricate adult coloring pages. Mandalas, floral patterns, and geometric designs in crisp line art PDFs.',
};

export default function AdultColoringPagesPage() {
  return <AdultColoringPagesContent />;
} 