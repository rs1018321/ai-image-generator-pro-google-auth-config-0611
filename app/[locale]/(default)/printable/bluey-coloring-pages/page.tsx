import { Metadata } from "next";
import BlueyColoringPagesContent from './content';

export const metadata: Metadata = {
  title: 'Bluey Coloring Pages – Print Free Adventures of Bluey & Bingo',
  description:
    'Fans of Bluey: enjoy 50 free coloring pages featuring Bluey, Bingo, mum & dad. Printable PDFs for family fun.',
};

export default function BlueyColoringPagesPage() {
  return <BlueyColoringPagesContent />;
} 