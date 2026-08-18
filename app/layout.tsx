import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/providers";
import { Analytics } from "@vercel/analytics/next";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
  weight: ["400", "500", "600", "700"],
});

const baseUrl =
  process.env.NEXT_PUBLIC_APP_URL || "https://scale-pay.vercel.app";

export const metadata: Metadata = {
  metadataBase: new URL(baseUrl),
  title: {
    default: "ScalePay - Personal Finance & Cash Flow Management",
    template: "%s | ScalePay",
  },
  description:
    "Track cash flow, maintain a real-time transaction ledger, set monthly category budgets, and analyze spending patterns with structured financial analytics.",
  keywords: [
    "personal finance",
    "budgeting tool",
    "expense tracking",
    "cash flow ledger",
    "financial analytics",
  ],
  authors: [{ name: "ScalePay Team" }],
  creator: "ScalePay",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: baseUrl,
    title: "ScalePay - Personal Finance & Cash Flow Management",
    description:
      "Track cash flow, maintain a real-time transaction ledger, set monthly category budgets, and analyze spending patterns with structured financial analytics.",
    siteName: "ScalePay",
    images: [
      {
        url: "/opengraph-image.png",
        width: 1200,
        height: 630,
        alt: "ScalePay - Financial Ledger & Budget Tracking",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "ScalePay - Personal Finance & Cash Flow Management",
    description:
      "Track cash flow, maintain a real-time transaction ledger, set monthly category budgets, and analyze spending patterns with structured financial analytics.",
    images: ["/opengraph-image.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning className="h-full">
      <body
        className={`${inter.variable} font-sans h-full antialiased bg-background text-foreground selection:bg-secondary selection:text-foreground`}
      >
        <Providers>{children}</Providers>
        <Analytics />
      </body>
    </html>
  );
}
