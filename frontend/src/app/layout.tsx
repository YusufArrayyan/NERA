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
    icon: '/favicon.ico',
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
