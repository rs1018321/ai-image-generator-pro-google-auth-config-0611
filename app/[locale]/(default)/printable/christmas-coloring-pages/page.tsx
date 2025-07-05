import { Metadata } from "next";
import ChristmasColoringPagesContent from './content';

export const metadata: Metadata = {
  title: 'Free Christmas Coloring Pages – Santa, Trees & Ornaments',
  description:
    'Get holiday-ready with 100 Christmas coloring sheets: Santa, snowmen, ornaments. Instant PDF download.',
};

export default function ChristmasColoringPagesPage() {
  return <ChristmasColoringPagesContent />;
} 