
import type { Metadata, Viewport } from 'next';
import './globals.css';
import { Toaster } from "@/components/ui/toaster";
import { AuthProvider } from '@/hooks/useAuth';

// Define your production URL here
const productionUrl = 'https://nongtrai.web.app'; // UPDATED
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
      'en-US': '/en-US', // Example, if you add i18n later
    },
  },
  openGraph: {
    title: 'Happy Farm - Cheerful Farming Game',
    description: 'Build your dream farm in Happy Farm! Plant crops, complete quests, trade in the market, and interact with AI-powered features.',
    url: '/',
    siteName: 'Happy Farm',
    images: [
      {
        url: '/og-image.png', // IMPORTANT: Create and place this image (1200x630px recommended) in /public
        width: 1200,
        height: 630,
        alt: 'Happy Farm Game Cover',
      },
    ],
    locale: 'en_US', // Change if your primary language is different
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Happy Farm - Cheerful Farming Game',
    description: 'Join Happy Farm and build your dream farm! Plant, harvest, trade, and explore AI-powered features.',
    // siteId: 'yourTwitterSiteId', // Optional: Your Twitter numeric ID
    creator: '@yourTwitterHandle', // Optional: Your Twitter handle
    // creatorId: 'yourTwitterCreatorId', // Optional: Your Twitter numeric ID for the creator
    images: ['/twitter-image.png'], // IMPORTANT: Create and place this image (e.g., 1200x600px) in /public
  },
  icons: {
    icon: '/favicon.ico', // Standard favicon
    shortcut: '/favicon-16x16.png', // For older browsers
    apple: '/apple-touch-icon.png', // For Apple devices
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
    ],
  },
  manifest: '/manifest.json', // Already existed, keeping it
  appleWebApp: {
    title: 'Happy Farm',
    statusBarStyle: 'default',
    capable: true,
  },
  formatDetection: {
    telephone: false,
  },
  // verification: { // Add these once you have the verification codes
  //   google: 'your-google-site-verification-code',
  //   yandex: 'your-yandex-verification-code',
  //   other: {
  //     me: ['my-email@example.com', 'my-link'],
  //   },
  // },
  category: 'games',
};

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#FAF7EB' }, // Corresponds to your light theme background
    { media: '(prefers-color-scheme: dark)', color: '#0A0A0A' },  // Corresponds to your dark theme background (approx)
  ],
  colorScheme: 'light dark',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1, // Optional: to prevent zooming on mobile for app-like feel
  // userScalable: false, // Optional
};


export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=PT+Sans:ital,wght@0,400;0,700;1,400;1,700&display=swap" rel="stylesheet" />
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
