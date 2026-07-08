import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Easy Fetcher Pricing | Start Your 7 Day Free Trial Today",
  description:
    "Start your 7-day free trial of Easy Fetcher. Simple, transparent pricing — every plan includes all connectors, Claude Skills, and the full AI prompt library. Cancel anytime.",
  alternates: {
    canonical: "https://www.easyfetcher.com/pricing",
  },
  openGraph: {
    title: "Easy Fetcher Pricing | Start Your 7 Day Free Trial Today",
    description:
      "Start your 7-day free trial. All connectors, Claude Skills, and the full AI prompt library in every plan. Cancel anytime.",
    url: "https://www.easyfetcher.com/pricing",
  },
};

const pricingBreadcrumb = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    {
      "@type": "ListItem",
      position: 1,
      name: "Home",
      item: "https://www.easyfetcher.com",
    },
    {
      "@type": "ListItem",
      position: 2,
      name: "Pricing",
      item: "https://www.easyfetcher.com/pricing",
    },
  ],
};

export default function PricingLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      {children}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(pricingBreadcrumb) }}
      />
    </>
  );
}
