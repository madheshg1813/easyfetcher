import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "EasyFetcher — AI-Powered Marketing Data",
  description: "Connect your marketing data sources and run AI-powered prompts via the Model Context Protocol. GSC, GA4, Meta Ads, and more.",
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
