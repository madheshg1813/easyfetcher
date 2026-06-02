import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Easy Fetcher – SEO MCP & Superpowers for Claude",
  description: "Connect your SEO tools to Claude and unlock powerful SEO skills. Audit websites, monitor rankings, analyze traffic, and generate reports in seconds.",
  verification: {
    google: "Min0s8qFCj-c7WOXBIulq2pmAZyfn0jKljlW4QbN6uY",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}
