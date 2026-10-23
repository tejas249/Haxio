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

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
const title = "Haxio — a support agent that actually does things";
const description =
  "Agent + RAG support copilot demo: a tool-calling AI agent that searches real help docs, looks up accounts, opens tickets, and proposes refunds — built on Next.js and the Vercel AI SDK.";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: title,
    template: "%s · Haxio",
  },
  description,
  keywords: [
    "AI agent",
    "RAG",
    "support copilot",
    "Next.js",
    "Vercel AI SDK",
    "tool calling",
  ],
  authors: [{ name: "Tejas" }],
  openGraph: {
    type: "website",
    url: siteUrl,
    siteName: "Haxio",
    title,
    description,
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
