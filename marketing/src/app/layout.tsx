import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "EasyFetcher — AI-Powered Marketing Data",
  description: "Connect your marketing data sources and run AI-powered prompts via the Model Context Protocol. GSC, GA4, Meta Ads, and more.",
  verification: {
    google: "grscMWyaSD91J6kvLO14kuxAUjeIzJpQfKA9GzP2oEk",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}
