import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { AuthProvider } from '@/context/AuthContext';

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata: Metadata = {
  metadataBase: new URL('https://www.freedigital.click'),
  title: "Free Digital Clicks",
  description: "Grow Your Audience with Simple Forms",
  openGraph: {
    title: "Send Forms > Get Leads",
    description: "Grow Your Audience with Simple Forms",
    url: "https://www.freedigital.click",
    siteName: "Free Digital Clicks",
    images: [
      {
        url: "https://www.freedigital.click/og-image.png",
        width: 1200,
        height: 630,
        alt: "Send Forms > Get Leads - Grow Your Audience with Simple Forms",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Send Forms > Get Leads",
    description: "Grow Your Audience with Simple Forms",
    site: "@eneffti",
    images: ["https://www.freedigital.click/og-image.png"],
  },
  alternates: {
    canonical: "https://www.freedigital.click",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable}`}>
      <head>
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:site" content="@eneffti" />
        <meta name="twitter:title" content="Free Digital Clicks" />
        <meta name="twitter:description" content="Grow Your Audience with Simple Forms" />
        <meta name="twitter:image" content="https://www.freedigital.click/og-image.png" />
      </head>
      <body>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
