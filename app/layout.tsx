import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/providers";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://scalepay.vercel.app";

export const metadata: Metadata = {
  metadataBase: new URL(baseUrl),
  title: {
    default: "ScalePay - Modern Personal Expense Tracker",
    template: "%s | ScalePay",
  },
  description: "Track your personal expenses, manage budgets, and analyze spending habits with interactive fintech charts. Built with Next.js, Supabase, and Tailwind CSS.",
  keywords: ["expense tracker", "personal finance", "budget manager", "fintech dashboard", "Next.js", "Supabase", "Tailwind CSS"],
  authors: [{ name: "ScalePay Team" }],
  creator: "ScalePay",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: baseUrl,
    title: "ScalePay - Modern Personal Expense Tracker",
    description: "Track your personal expenses, manage budgets, and analyze spending habits with interactive fintech charts. Built with Next.js, Supabase, and Tailwind CSS.",
    siteName: "ScalePay",
  },
  twitter: {
    card: "summary_large_image",
    title: "ScalePay - Modern Personal Expense Tracker",
    description: "Track your personal expenses, manage budgets, and analyze spending habits with interactive fintech charts. Built with Next.js, Supabase, and Tailwind CSS.",
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
      <body className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
