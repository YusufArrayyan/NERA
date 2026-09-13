import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/contexts/AuthContext";
import { ServiceWorkerProvider } from "@/components/ServiceWorkerProvider";

const font = Plus_Jakarta_Sans({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "NERA - Neuro-Adaptive Cloud Learning",
  description: "Platform pembelajaran berbasis EEG untuk meningkatkan fokus dan performa belajar",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "NERA Learning",
  },
  formatDetection: {
    telephone: false,
  },
  icons: {
    icon: [
      { url: '/nera-logo.svg', type: 'image/svg+xml' },
      { url: '/nera-logo.svg', sizes: '32x32' },
    ],
    apple: '/nera-logo.svg',
  },
  openGraph: {
    title: 'NERA - Neuro-Adaptive Cloud Learning',
    description: 'Platform pembelajaran berbasis EEG untuk meningkatkan fokus dan performa belajar',
    url: 'https://nera-learning.vercel.app',
    siteName: 'NERA',
    images: [
      {
        url: 'https://nera-learning.vercel.app/nera-logo.svg',
        width: 1200,
        height: 630,
        alt: 'NERA - Neuro-Adaptive Cloud Learning',
      },
    ],
    locale: 'id_ID',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'NERA - Neuro-Adaptive Cloud Learning',
    description: 'Platform pembelajaran berbasis EEG untuk meningkatkan fokus dan performa belajar',
    images: ['https://nera-learning.vercel.app/nera-logo.svg'],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <meta name="theme-color" content="#5B7B5A" />
        <meta name="mobile-web-app-capable" content="yes" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Material+Icons&display=swap" rel="stylesheet" />
      </head>
      <body className={`${font.className} min-h-screen bg-background antialiased selection:bg-primary selection:text-white`}>
        <ServiceWorkerProvider>
          <AuthProvider>
            {children}
          </AuthProvider>
        </ServiceWorkerProvider>
      </body>
    </html>
  );
}
