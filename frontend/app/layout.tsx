import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Bot Detection System | QubitRules",
  description: "Advanced AI-powered system for detecting social media bots using XGBoost, BERT embeddings and neural networks.",
  keywords: "bot detection, machine learning, AI, social media, XGBoost, BERT",
  authors: [{ name: "QubitRules Team" }],
  creator: "QubitRules",
  publisher: "QubitRules Technologies",
  openGraph: {
    title: "Bot Detection System | QubitRules",
    description: "Advanced AI-powered bot detection using XGBoost and BERT",
    url: "https://bot.qubitrules.com",
    siteName: "Bot Detection System",
    images: [
      {
        url: "https://empiresphere.vercel.app/api/files/67ac4f9be8351fb862fa9854/view?apiKey=emp_cbb0f91b-ae83-4fdc-a4e9-e1deb39ed9cc",
        width: 1200,
        height: 630,
        alt: "Bot Detection System Preview",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Bot Detection System | QubitRules",
    description: "Advanced AI-powered bot detection using XGBoost and BERT",
    creator: "@QubitRules",
    images: ["https://empiresphere.vercel.app/api/files/67ac4f9be8351fb862fa9854/view?apiKey=emp_cbb0f91b-ae83-4fdc-a4e9-e1deb39ed9cc"],
  },
  viewport: {
    width: "device-width",
    initialScale: 1,
    maximumScale: 1,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link
          rel="icon"
          href="/favicon.svg"
          type="image/svg+xml"
        />
        <link
          rel="apple-touch-icon"
          href="/apple-touch-icon.png"
        />
        <link
          rel="manifest"
          href="/site.webmanifest"
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900`}
      >
        {children}
      </body>
    </html>
  );
}
