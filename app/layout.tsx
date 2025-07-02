import type { Metadata } from 'next'
import './globals.css'
import en from '@/i18n/messages/en.json'

export const metadata: Metadata = {
  title: en.metadata.title,
  description: en.metadata.description,
  keywords: en.metadata.keywords,
  alternates: { 
    canonical: 'https://www.coloring-pages.app/' 
  },
  openGraph: {
    url: 'https://www.coloring-pages.app',
    title: en.metadata.title,
    description: en.metadata.description,
    images: [{ 
      url: '/og-cover.png', 
      width: 1200, 
      height: 630 
    }],
    type: 'website',
    siteName: 'Coloring-Pages.app',
  },
  twitter: {
    card: 'summary_large_image',
    title: en.metadata.title,
    description: en.metadata.description,
    images: ['/og-cover.png'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  icons: {
    icon: '/favicon.ico',
    apple: '/apple-touch-icon.png',
  },
  viewport: 'width=device-width, initial-scale=1',
  themeColor: '#f8e71c',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
} 