import { Metadata } from "next";
import KidsColoringPagesContent from './content';

export const metadata: Metadata = {
  title: 'Fun Coloring Pages for Kids – Animals, ABC & Seasons (Free PDFs)',
  description: '200+ kid-friendly coloring pages: zoo animals, alphabet letters, weather scenes. Ideal for preschool and kindergarten.',
};

export default function Page() {
  return <KidsColoringPagesContent />;
} 