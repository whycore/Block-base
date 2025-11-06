import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"),
  title: {
    default: "Block Base MiniApp - Block Puzzle Game",
    template: "%s | Block Base MiniApp",
  },
  description: "Build for everyone. Play the Block Base puzzle game on Base, create combos, and mint an NFT when you score 1000+ points.",
  keywords: ["block blast", "puzzle game", "base miniapp", "nft", "base blockchain", "farcaster"],
  authors: [{ name: "Block Base MiniApp" }],
  openGraph: {
    title: "Block Base MiniApp - Block Puzzle Game",
    description: "Build for everyone. Play the Block Base puzzle game on Base, create combos, and mint an NFT when you score 1000+ points.",
    url: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
    siteName: "Block Base MiniApp",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Block Base MiniApp - Block Puzzle Game",
      },
    ],
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "Block Base MiniApp - Block Puzzle Game",
    description: "Build for everyone. Play the Block Base puzzle game on Base, create combos, and mint an NFT when you score 1000+ points.",
    images: ["/og-image.png"],
    creator: "@blockbase",
  },
  robots: {
    index: false, // Set to true after deployment
    follow: false,
  },
  alternates: {
    canonical: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  
  // JSON-LD Structured Data for SEO
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    "name": "BlockBase MiniApp",
    "url": appUrl,
    "description": "Play Block Blast puzzle game on Base! Match colorful blocks, create combos, and mint an NFT when you score 1000+ points.",
    "applicationCategory": "Game",
    "genre": "Puzzle",
    "operatingSystem": "Web Browser",
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "USD"
    },
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": "4.5",
      "ratingCount": "1"
    }
  };

  return (
    <html lang="en">
      <head>
        {/* JSON-LD Structured Data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(structuredData),
          }}
        />
        {/* Favicon */}
        <link rel="icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
      </head>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
