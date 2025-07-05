import { Metadata } from "next";
import CuteColoringPagesContent from './content';

export const metadata: Metadata = {
  title: 'Cute Coloring Pages – Kawaii Animals & Sweet Treats (PDF)',
  description:
    'Kawaii cats, baby unicorns, cupcakes! 120 cute coloring pages you can print for free.',
};

export default function CuteColoringPagesPage() {
  return <CuteColoringPagesContent />;
} 