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
  metadataBase: new URL('https://freedigital.click'),
  title: "Free Digital Clicks",
  description: "Grow Your Audience with Simple Forms",
  openGraph: {
    title: "Free Digital Clicks",
    description: "Grow Your Audience with Simple Forms",
    url: "https://freedigital.click",
    siteName: "Free Digital Clicks",
    images: [
      {
        url: "/og-image.png",  // Assuming you've added this image to your public folder
        width: 1200,
        height: 630,
        alt: "Free Digital Clicks - Grow Your Audience with Simple Forms",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Free Digital Clicks",
    description: "Grow Your Audience with Simple Forms",
    site: "@eneffti",  // Replace with your Twitter handle
    images: ["/og-image.png"],  // Same image as OpenGraph
  },
  alternates: {
    canonical: "https://freedigital.click",
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
        {/* You can add additional meta tags here if needed */}
      </head>
      <body>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
