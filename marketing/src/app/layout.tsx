import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Easy Fetcher – SEO MCP & Superpowers for Claude",
  description: "Connect your SEO tools to Claude and unlock powerful SEO skills. Audit websites, monitor rankings, analyze traffic, and generate reports in seconds.",
  verification: {
    google: "Min0s8qFCj-c7WOXBIulq2pmAZyfn0jKljlW4QbN6uY",
    other: {
      "msvalidate.01": "EEDEACAB57C2C82F689CE9B11E12CE70",
    },
  },
};

const softwareSchema = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: "Easy Fetcher",
  url: "https://www.easyfetcher.com",
  applicationCategory: "BusinessApplication",
  applicationSubCategory: "SEO Software",
  operatingSystem: "Web, Claude Desktop",
  description:
    "Easy Fetcher is the SEO operating system for Claude. Connect Google Search Console, GA4, PageSpeed Insights, and more to generate SEO audits, client reports, rank tracking, and AI visibility analysis directly inside Claude.",
  screenshot: "https://www.easyfetcher.com/og-image.png",
  featureList: [
    "SEO Audits",
    "Technical Site Audits",
    "SEO Client Reports",
    "Keyword Research",
    "Rank Tracking",
    "AI Visibility Analysis",
    "Schema Generation",
    "Performance Analysis",
    "Google Search Console Integration",
    "GA4 Integration",
    "PageSpeed Insights Integration",
  ],
  offers: [
    {
      "@type": "Offer",
      name: "Starter",
      priceCurrency: "USD",
      price: "29",
      priceSpecification: {
        "@type": "UnitPriceSpecification",
        price: "29",
        priceCurrency: "USD",
        unitText: "MONTH",
      },
    },
    {
      "@type": "Offer",
      name: "Pro",
      priceCurrency: "USD",
      price: "79",
      priceSpecification: {
        "@type": "UnitPriceSpecification",
        price: "79",
        priceCurrency: "USD",
        unitText: "MONTH",
      },
    },
    {
      "@type": "Offer",
      name: "Agency",
      priceCurrency: "USD",
      price: "149",
      priceSpecification: {
        "@type": "UnitPriceSpecification",
        price: "149",
        priceCurrency: "USD",
        unitText: "MONTH",
      },
    },
  ],
  aggregateRating: {
    "@type": "AggregateRating",
    ratingValue: "5",
    reviewCount: "3",
    bestRating: "5",
    worstRating: "1",
  },
};

const howToSchema = {
  "@context": "https://schema.org",
  "@type": "HowTo",
  name: "How to Use Easy Fetcher with Claude",
  description:
    "Get SEO audits, client reports, rank tracking, and marketing insights from Claude in 3 simple steps using Easy Fetcher.",
  totalTime: "PT5M",
  step: [
    {
      "@type": "HowToStep",
      position: 1,
      name: "Install Easy Fetcher",
      text: "Create your Easy Fetcher account and add the Easy Fetcher MCP URL to Claude Desktop. Setup takes under 5 minutes.",
      url: "https://www.easyfetcher.com/#how-it-works",
    },
    {
      "@type": "HowToStep",
      position: 2,
      name: "Ask Claude What You Need",
      text: "Ask Claude to run an SEO audit, create a client report, track your rankings, or analyze AI visibility. Connect data sources like Google Search Console and GA4 if required.",
      url: "https://www.easyfetcher.com/#how-it-works",
    },
    {
      "@type": "HowToStep",
      position: 3,
      name: "Receive Ready-to-Use Output",
      text: "Get reports, audits, recommendations, opportunities, and insights delivered directly in Claude — without switching tools.",
      url: "https://www.easyfetcher.com/#how-it-works",
    },
  ],
};

const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "Do I need a Claude subscription to use Easy Fetcher?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "No. You do not need a paid Claude subscription to use Easy Fetcher. You can connect Easy Fetcher to Claude and start using its SEO and marketing skills with your Claude account.",
      },
    },
    {
      "@type": "Question",
      name: "Is Easy Fetcher free?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "No. Easy Fetcher is a paid product. It is built with input from experienced SEO professionals and marketers to deliver reliable insights, reports, and workflows. The focus is on providing high-quality SEO capabilities rather than a limited free experience.",
      },
    },
    {
      "@type": "Question",
      name: "How do I use Easy Fetcher?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Getting started is simple: 1. Create your Easy Fetcher account. 2. Add the Easy Fetcher MCP URL to Claude. 3. Connect your data sources (optional, depending on the skill). 4. Start asking Claude for audits, reports, keyword insights, rankings, AI visibility analysis, and more. Claude will use Easy Fetcher to access the required data and generate actionable results.",
      },
    },
    {
      "@type": "Question",
      name: "Is my data secure?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Yes. Data security is a top priority at Easy Fetcher. We use industry-standard security practices, encrypted connections, and multiple layers of protection to safeguard your data. Your information is handled securely and is only used to provide the features and insights you request.",
      },
    },
    {
      "@type": "Question",
      name: "What can I do with Easy Fetcher?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Easy Fetcher helps you perform SEO and marketing workflows directly inside Claude, including: SEO Audits, Technical Site Audits, SEO Client Reports, Internal SEO Reports, Keyword Research, Rank Tracking, AI Visibility Analysis, Schema Generation, SEO Proposals, and Performance Analysis. New skills and integrations are added regularly.",
      },
    },
    {
      "@type": "Question",
      name: "Who is Easy Fetcher for?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Easy Fetcher is built for SEO professionals, agencies, consultants, growth marketers, founders, and businesses that want to automate SEO analysis and reporting using Claude.",
      },
    },
  ],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="antialiased">
        {children}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareSchema) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(howToSchema) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
        />
      </body>
    </html>
  );
}
