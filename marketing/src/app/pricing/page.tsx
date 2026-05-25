"use client";

import { useState } from "react";
import { Check, X, ArrowRight, Zap, ChevronDown } from "lucide-react";
import Link from "next/link";
import SiteNav from "@/components/SiteNav";
import SiteFooter from "@/components/SiteFooter";
import { SIGNUP_URL } from "@/lib/constants";

const plans = [
  {
    name: "Free",
    price: "$0",
    note: "Forever free",
    description: "Start querying your search data with AI — no credit card needed.",
    cta: "Get started free",
    ctaHref: SIGNUP_URL,
    highlight: false,
    badge: null,
    destinations: [
      { name: "Claude", logo: "/connectors/claude.svg" },
    ],
    connectors: [
      { name: "Google Search Console", logo: "/connectors/gsc.svg", active: true },
    ],
    comingSoonConnectors: [],
  },
  {
    name: "Pro",
    price: "$7",
    note: "/month",
    description: "Unlock GA4 and Shopify alongside Search Console — all in one AI workspace.",
    cta: "Start Pro for $7/mo",
    ctaHref: SIGNUP_URL,
    highlight: true,
    badge: "MOST POPULAR",
    destinations: [
      { name: "Claude", logo: "/connectors/claude.svg" },
    ],
    connectors: [
      { name: "Google Search Console", logo: "/connectors/gsc.svg", active: true },
      { name: "Google Analytics 4", logo: "/connectors/google-analytics.svg", active: true },
      { name: "Shopify", logo: "/connectors/shopify.svg", active: true },
    ],
    comingSoonConnectors: [
      { name: "Google Ads", logo: "/connectors/icons8-google-ads.svg" },
      { name: "Facebook", logo: "/connectors/facebook.svg" },
      { name: "Instagram", logo: "/connectors/instagram.svg" },
      { name: "LinkedIn", logo: "/connectors/linkedin.svg" },
      { name: "TikTok", logo: "/connectors/tiktok.svg" },
      { name: "Google My Business", logo: "/connectors/google-my-business.svg" },
    ],
  },
];

const comparisonRows = [
  {
    category: "Data Sources",
    rows: [
      {
        label: "Google Search Console",
        logo: "/connectors/gsc.svg",
        free: true,
        pro: true,
      },
      {
        label: "Google Analytics 4",
        logo: "/connectors/google-analytics.svg",
        free: false,
        pro: true,
      },
      {
        label: "Shopify",
        logo: "/connectors/shopify.svg",
        free: false,
        pro: true,
      },
      {
        label: "Google Ads",
        logo: "/connectors/icons8-google-ads.svg",
        free: false,
        pro: "Soon",
      },
      {
        label: "Facebook Ads",
        logo: "/connectors/facebook.svg",
        free: false,
        pro: "Soon",
      },
      {
        label: "Instagram Insights",
        logo: "/connectors/instagram.svg",
        free: false,
        pro: "Soon",
      },
      {
        label: "LinkedIn Ads",
        logo: "/connectors/linkedin.svg",
        free: false,
        pro: "Soon",
      },
      {
        label: "TikTok Ads",
        logo: "/connectors/tiktok.svg",
        free: false,
        pro: "Soon",
      },
    ],
  },
  {
    category: "AI Destinations",
    rows: [
      {
        label: "Claude (Anthropic)",
        logo: "/connectors/claude.svg",
        free: true,
        pro: true,
      },
    ],
  },
  {
    category: "Usage",
    rows: [
      { label: "MCP calls / month", logo: null, free: "1,000", pro: "10,000" },
      { label: "Workspaces", logo: null, free: "1", pro: "1" },
      { label: "Sites / domains", logo: null, free: "1", pro: "Up to 5" },
    ],
  },
  {
    category: "Prompts & AI",
    rows: [
      { label: "Prompt templates", logo: null, free: "3 templates", pro: "Full library" },
      { label: "MCP Protocol support", logo: null, free: true, pro: true },
    ],
  },
  {
    category: "Support",
    rows: [
      { label: "Community support", logo: null, free: true, pro: true },
      { label: "Email support", logo: null, free: false, pro: true },
    ],
  },
];

const faqs = [
  {
    q: "Can I switch plans at any time?",
    a: "Yes. You can upgrade from Free to Pro anytime. If you downgrade, your Pro features remain active until the end of your billing period.",
  },
  {
    q: "What counts as an MCP call?",
    a: "Each time Claude queries one of your connected data sources through EasyFetcher (e.g. pulling GSC data, GA4 metrics, or Shopify revenue) counts as one MCP call.",
  },
  {
    q: "Do I need a credit card for the Free plan?",
    a: "No. The Free plan is completely free with no card required. You only need a card when upgrading to Pro.",
  },
  {
    q: "What is a workspace?",
    a: "A workspace groups your connected data sources and prompt library. The current plans include 1 workspace — ideal for managing one brand or project.",
  },
  {
    q: "Which AI clients does EasyFetcher work with?",
    a: "EasyFetcher works with any client that supports the Model Context Protocol — including Claude Desktop, Cursor, and other MCP-compatible tools.",
  },
  {
    q: "When will more connectors be available?",
    a: "We're actively building Google Ads, Meta (Facebook & Instagram), LinkedIn Ads, TikTok Ads, and Google My Business. Pro subscribers get early access when they launch.",
  },
];

function FAQItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b border-gray-100 last:border-0">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between gap-4 py-5 text-left group"
      >
        <span className="text-sm sm:text-base font-semibold text-gray-800 group-hover:text-amber-600 transition-colors">{q}</span>
        <ChevronDown className={`w-5 h-5 text-gray-400 shrink-0 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>
      {open && (
        <p className="text-sm text-gray-500 leading-relaxed pb-5">{a}</p>
      )}
    </div>
  );
}

function CellValue({ value }: { value: boolean | string }) {
  if (value === true) return <Check className="w-5 h-5 text-amber-500 mx-auto" />;
  if (value === false) return <X className="w-4 h-4 text-gray-200 mx-auto" />;
  if (value === "Soon") return (
    <span className="text-[10px] font-semibold text-amber-500 bg-amber-50 border border-amber-100 px-2 py-0.5 rounded-full whitespace-nowrap">Soon</span>
  );
  return <span className="text-sm text-gray-600 font-medium">{value}</span>;
}

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-white text-gray-900" style={{ fontFamily: "'Inter', system-ui, sans-serif" }}>
      <SiteNav />

      {/* Hero */}
      <section className="pt-14 pb-16 px-4 sm:px-6 text-center" style={{ background: "linear-gradient(180deg, #fffbeb 0%, #ffffff 100%)" }}>
        <div className="max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-amber-200 bg-amber-50 text-amber-600 text-xs font-semibold mb-6">
            <Zap className="w-3.5 h-3.5" />
            Simple, honest pricing
          </div>
          <h1 className="text-4xl sm:text-5xl font-extrabold text-gray-900 tracking-tight leading-[1.1] mb-4">
            Start free.<br />
            <span className="text-amber-500">Upgrade when you&apos;re ready.</span>
          </h1>
          <p className="text-base sm:text-lg text-gray-500 leading-relaxed">
            No hidden fees. No complex tiers. Just two straightforward plans — one free, one at $7/month.
          </p>
        </div>
      </section>

      {/* Plan cards */}
      <section className="pb-16 px-4 sm:px-6">
        <div className="max-w-3xl mx-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 sm:gap-6">
            {plans.map((plan) => (
              <div
                key={plan.name}
                className={`relative rounded-2xl p-7 sm:p-8 flex flex-col gap-5 ${
                  plan.highlight
                    ? "border-2 border-amber-400 bg-white shadow-xl shadow-amber-100"
                    : "border border-gray-200 bg-white"
                }`}
              >
                {plan.badge && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-amber-500 text-white text-[11px] font-bold whitespace-nowrap tracking-wide">
                    {plan.badge}
                  </div>
                )}

                {/* Price */}
                <div>
                  <p className="text-xs font-bold uppercase tracking-widest mb-3 text-amber-500">{plan.name}</p>
                  <div className="flex items-end gap-1 mb-2">
                    <span className="text-4xl font-black tracking-tighter text-gray-900">{plan.price}</span>
                    <span className="text-sm mb-1.5 text-gray-400">{plan.note}</span>
                  </div>
                  <p className="text-sm text-gray-500 leading-relaxed">{plan.description}</p>
                </div>

                {/* AI Destinations */}
                <div>
                  <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-2.5">Works with</p>
                  <div className="flex items-center gap-2 flex-wrap">
                    {plan.destinations.map((d) => (
                      <div key={d.name} className="flex items-center gap-1.5 bg-gray-50 border border-gray-100 rounded-lg px-2.5 py-1.5">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={d.logo} alt={d.name} className="w-5 h-5 object-contain rounded" />
                        <span className="text-xs font-semibold text-gray-700">{d.name}</span>
                      </div>
                    ))}
                    <span className="text-xs text-gray-400">+ more coming</span>
                  </div>
                </div>

                {/* Connectors included */}
                <div>
                  <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-2.5">Connectors included</p>
                  <div className="flex items-center gap-2 flex-wrap">
                    {plan.connectors.map((c) => (
                      <div key={c.name} title={c.name} className="w-9 h-9 rounded-xl border border-gray-100 bg-white shadow-sm flex items-center justify-center">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={c.logo} alt={c.name} className="w-6 h-6 object-contain" />
                      </div>
                    ))}
                  </div>
                </div>

                {/* Coming soon connectors (Pro only) */}
                {plan.comingSoonConnectors.length > 0 && (
                  <div>
                    <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-2.5">Coming soon for Pro</p>
                    <div className="flex items-center gap-2 flex-wrap">
                      {plan.comingSoonConnectors.map((c) => (
                        <div key={c.name} title={c.name} className="w-9 h-9 rounded-xl border border-dashed border-gray-200 bg-gray-50 flex items-center justify-center">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={c.logo} alt={c.name} className="w-6 h-6 object-contain opacity-40 grayscale" />
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <Link
                  href={plan.ctaHref}
                  className={`w-full py-3 rounded-xl text-sm font-bold text-center transition-all flex items-center justify-center gap-2 mt-auto ${
                    plan.highlight
                      ? "bg-amber-500 text-white hover:bg-amber-600 shadow-md shadow-amber-200"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  {plan.cta} {plan.highlight && <ArrowRight className="w-4 h-4" />}
                </Link>

                <p className="text-xs text-gray-400 text-center -mt-3">No credit card required</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Comparison table */}
      <section className="py-16 px-4 sm:px-6 bg-gray-50">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight text-center mb-10">
            Full plan comparison
          </h2>

          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            {/* Table header */}
            <div className="grid grid-cols-3 bg-gray-50 border-b border-gray-100">
              <div className="p-4 sm:p-5" />
              <div className="p-4 sm:p-5 text-center border-l border-gray-100">
                <p className="text-xs font-bold uppercase tracking-widest text-gray-500">Free</p>
                <p className="text-xl font-black text-gray-900 mt-1">$0</p>
              </div>
              <div className="p-4 sm:p-5 text-center border-l border-amber-200 bg-amber-50/50">
                <p className="text-xs font-bold uppercase tracking-widest text-amber-500">Pro</p>
                <p className="text-xl font-black text-gray-900 mt-1">$7<span className="text-sm font-normal text-gray-400">/mo</span></p>
              </div>
            </div>

            {/* Table body */}
            {comparisonRows.map((section) => (
              <div key={section.category}>
                <div className="px-4 sm:px-5 py-3 bg-gray-50/70 border-y border-gray-100">
                  <p className="text-xs font-bold uppercase tracking-widest text-gray-400">{section.category}</p>
                </div>
                {section.rows.map((row) => (
                  <div key={row.label} className="grid grid-cols-3 border-b border-gray-50 last:border-0 hover:bg-gray-50/50 transition-colors">
                    <div className="px-4 sm:px-5 py-3.5 flex items-center gap-2.5">
                      {row.logo && (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={row.logo} alt={row.label} className="w-5 h-5 object-contain shrink-0" />
                      )}
                      <span className="text-sm text-gray-600">{row.label}</span>
                    </div>
                    <div className="px-4 sm:px-5 py-3.5 flex items-center justify-center border-l border-gray-100">
                      <CellValue value={row.free} />
                    </div>
                    <div className="px-4 sm:px-5 py-3.5 flex items-center justify-center border-l border-amber-100 bg-amber-50/20">
                      <CellValue value={row.pro} />
                    </div>
                  </div>
                ))}
              </div>
            ))}

            {/* Table footer CTAs */}
            <div className="grid grid-cols-3 border-t border-gray-100 bg-gray-50">
              <div className="p-4 sm:p-5" />
              <div className="p-4 sm:p-5 border-l border-gray-100">
                <Link href={SIGNUP_URL} className="block w-full py-2.5 rounded-xl text-xs font-bold text-center bg-gray-200 text-gray-700 hover:bg-gray-300 transition-colors">
                  Get started
                </Link>
              </div>
              <div className="p-4 sm:p-5 border-l border-amber-200 bg-amber-50/50">
                <Link href={SIGNUP_URL} className="block w-full py-2.5 rounded-xl text-xs font-bold text-center bg-amber-500 text-white hover:bg-amber-600 transition-colors shadow-sm">
                  Start Pro
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-16 px-4 sm:px-6 bg-white">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-10">
            <p className="text-sm font-semibold text-amber-500 uppercase tracking-wider mb-3">FAQ</p>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">Common questions</h2>
          </div>
          <div className="divide-y divide-gray-100 rounded-2xl border border-gray-100 bg-white px-6 sm:px-8">
            {faqs.map((faq) => (
              <FAQItem key={faq.q} q={faq.q} a={faq.a} />
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 sm:py-20 px-4 sm:px-6 bg-gray-950">
        <div className="max-w-2xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-semibold mb-6">
            <Zap className="w-3.5 h-3.5" />
            Get started in 30 seconds
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight mb-4">
            Your marketing data,<br />answered by AI
          </h2>
          <p className="text-gray-400 text-base sm:text-lg mb-8 leading-relaxed">
            Free forever on Google Search Console. Upgrade to Pro for just $7/month.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              href={SIGNUP_URL}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl bg-amber-500 text-gray-900 font-bold text-base hover:bg-amber-400 transition-colors shadow-lg shadow-amber-500/20"
            >
              Get started free <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href={SIGNUP_URL}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl border border-gray-700 text-gray-300 font-semibold text-base hover:border-gray-500 hover:text-white transition-all"
            >
              Start Pro for $7/mo
            </Link>
          </div>
          <p className="text-gray-600 text-sm mt-5">No credit card · Cancel anytime</p>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}
