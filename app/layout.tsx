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
  title: "Free Digital Clicks",
  description: "Grow Your Audience with Simple Forms",
  openGraph: {
    title: "Free Digital Clicks",
    description: "Grow Your Audience with Simple Forms",
    url: "https://freedigital.click",
    siteName: "Free Digital Clicks",
    images: [
      {
        url: "https://opengraph.b-cdn.net/production/images/4d342259-0596-4160-b5ee-2d724495a28b.png?token=Hf-nI7gVZWBtxrbrmjHUjojDHuSpeN3AGdUvWc8begc&height=630&width=1200&expires=33264825705",
        width: 1200,
        height: 630,
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Free Digital Clicks",
    description: "Grow Your Audience with Simple Forms",
    images: ["https://opengraph.b-cdn.net/production/images/4d342259-0596-4160-b5ee-2d724495a28b.png?token=Hf-nI7gVZWBtxrbrmjHUjojDHuSpeN3AGdUvWc8begc&height=630&width=1200&expires=33264825705"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable}`}>
      <body>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
