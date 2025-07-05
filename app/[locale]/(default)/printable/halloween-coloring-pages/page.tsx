import { Metadata } from "next";
import HalloweenColoringPagesContent from './content';

export const metadata: Metadata = {
  title: 'Halloween Coloring Pages – Pumpkins, Ghosts & Spooky Fun',
  description:
    "90 Halloween designs to print: jack-o'-lanterns, witches, haunted houses. Free PDFs for kids parties.",
};

export default function HalloweenColoringPagesPage() {
  return <HalloweenColoringPagesContent />;
} 