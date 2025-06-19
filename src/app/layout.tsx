
import type { Metadata, Viewport } from 'next';
import './globals.css';
import { Toaster } from "@/components/ui/toaster";
import { AuthProvider } from '@/hooks/useAuth';
import Script from 'next/script'; // Import Script component

// Define your production URL here
const productionUrl = 'https://nongtrai.web.app';
const metadataBase = new URL(productionUrl);

export const metadata: Metadata = {
  metadataBase,
  title: {
    default: 'Happy Farm - Cheerful Farming Game',
    template: '%s | Happy Farm',
  },
  description: 'Plant, grow, harvest, and trade in Happy Farm! A delightful Next.js farming game with AI features, quests, and a vibrant community. Build your dream farm today!',
  keywords: ['happy farm', 'farming game', 'nextjs game', 'simulation game', 'online farming', 'virtual farm', 'genkit ai game'],
  authors: [{ name: 'Firebase Studio' }],
  creator: 'Firebase Studio',
  publisher: 'Firebase Studio',
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
  alternates: {
    canonical: '/',
    languages: {
      'en-US': '/en-US', 
    },
  },
  openGraph: {
    title: 'Happy Farm - Cheerful Farming Game',
    description: 'Build your dream farm in Happy Farm! Plant crops, complete quests, trade in the market, and interact with AI-powered features.',
    url: '/',
    siteName: 'Happy Farm',
    images: [
      {
        url: '/og-image.png', 
        width: 1200,
        height: 630,
        alt: 'Happy Farm Game Cover',
      },
    ],
    locale: 'en_US', 
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Happy Farm - Cheerful Farming Game',
    description: 'Join Happy Farm and build your dream farm! Plant, harvest, trade, and explore AI-powered features.',
    creator: '@FirebaseStudio', 
    images: ['/twitter-image.png'], 
  },
  icons: {
    icon: '/favicon.ico', 
    shortcut: '/favicon-16x16.png', 
    apple: '/apple-touch-icon.png', 
    other: [
      {
        rel: 'icon',
        url: '/favicon-32x32.png',
        sizes: '32x32',
        type: 'image/png',
      },
      {
        rel: 'icon',
        url: '/favicon-16x16.png',
        sizes: '16x16',
        type: 'image/png',
      },
      {
        rel: 'apple-touch-icon',
        url: '/apple-touch-icon-180x180.png', // Example for larger Apple icon
        sizes: '180x180',
      },
    ],
  },
  manifest: '/manifest.json',
  appleWebApp: {
    title: 'Happy Farm',
    statusBarStyle: 'default',
    capable: true,
  },
  formatDetection: {
    telephone: false,
  },
  category: 'games',
};

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#FAF7EB' }, 
    { media: '(prefers-color-scheme: dark)', color: '#0A0A0A' },  
  ],
  colorScheme: 'light dark',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
};


export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID || "G-XXXXXXXXXX"; // Fallback to a placeholder

  return (
    <html lang="vi">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=PT+Sans:ital,wght@0,400;0,700;1,400;1,700&display=swap" rel="stylesheet" />
        
        {/* Google Analytics gtag.js Script */}
        {/* Replace G-XXXXXXXXXX with your Google Analytics Measurement ID if not using environment variable */}
        <Script
          strategy="beforeInteractive"
          src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`}
        />
        <Script
          id="gtag-init"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', '${GA_MEASUREMENT_ID}', {
                page_path: window.location.pathname,
              });
            `,
          }}
        />
      </head>
      <body className="font-body antialiased">
        <AuthProvider>
          {children}
          <Toaster />
        </AuthProvider>
      </body>
    </html>
  );
}
