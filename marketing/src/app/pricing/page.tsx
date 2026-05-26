"use client";

import { useState } from "react";
import { Check, X, ArrowRight, Zap, ChevronDown } from "lucide-react";
import Link from "next/link";
import SiteNav from "@/components/SiteNav";
import SiteFooter from "@/components/SiteFooter";
import { SIGNUP_URL } from "@/lib/constants";

const faqs = [
  {
    q: "Can I switch between monthly and yearly billing?",
    a: "Yes, you can upgrade from monthly to yearly billing at any time from your billing settings. The change will take effect immediately, and your billing will be prorated.",
  },
  {
    q: "What counts as an MCP call?",
    a: "Each time Claude or another AI client queries one of your connected data sources through EasyFetcher (e.g. fetching GSC keyword data or GA4 traffic metrics) counts as one MCP call.",
  },
  {
    q: "Do you offer a money-back guarantee?",
    a: "Absolutely! We want you to love EasyFetcher. We offer a 30-day money-back guarantee on all subscriptions. If you're not satisfied, just email us for a full refund.",
  },
  {
    q: "What is a workspace?",
    a: "A workspace groups your connected Google SEO accounts and your AI prompt library. The Pro plan includes 1 workspace with up to 5 different sites or domains.",
  },
  {
    q: "Which AI clients does EasyFetcher support?",
    a: "EasyFetcher supports any client that implements the Model Context Protocol (MCP). This includes Claude Desktop, Cursor, and other compatible developer tools.",
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

export default function PricingPage() {
  const [isYearly, setIsYearly] = useState(true);

  return (
    <div className="min-h-screen bg-white text-gray-900" style={{ fontFamily: "'Inter', system-ui, sans-serif" }}>
      <SiteNav />

      {/* Hero */}
      <section className="pt-14 pb-16 px-4 sm:px-6 text-center" style={{ background: "linear-gradient(180deg, #fffbeb 0%, #ffffff 100%)" }}>
        <div className="max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-amber-200 bg-amber-50 text-amber-600 text-xs font-semibold mb-6">
            <Zap className="w-3.5 h-3.5" />
            Simple, transparent pricing
          </div>
          <h1 className="text-4xl sm:text-5xl font-extrabold text-gray-900 tracking-tight leading-[1.1] mb-4">
            One plan.<br />
            <span className="text-amber-500">Choose how you pay.</span>
          </h1>
          <p className="text-base sm:text-lg text-gray-500 leading-relaxed">
            Get complete access to all SEO connectors, MCP skills, and prompt library. No setup fees.
          </p>

          {/* Billing toggle */}
          <div className="flex items-center justify-center gap-4 mt-8">
            <span className={`text-sm font-medium ${!isYearly ? "text-gray-900" : "text-gray-400"}`}>Billed Monthly</span>
            <button
              onClick={() => setIsYearly(!isYearly)}
              className="w-12 h-6 rounded-full bg-amber-100 border border-amber-200 p-0.5 transition-colors relative focus:outline-none"
              aria-label="Toggle billing period"
            >
              <div
                className={`w-5 h-5 rounded-full bg-amber-500 shadow-sm transition-transform absolute top-0.5 left-0.5 ${
                  isYearly ? "translate-x-6" : ""
                }`}
              />
            </button>
            <div className="flex items-center gap-2">
              <span className={`text-sm font-medium ${isYearly ? "text-gray-900" : "text-gray-400"}`}>Billed Yearly</span>
              <span className="text-[10px] font-bold text-amber-600 bg-amber-100 border border-amber-200 px-2 py-0.5 rounded-full">
                Save 35%
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Plan Card */}
      <section className="pb-16 px-4 sm:px-6">
        <div className="max-w-4xl mx-auto bg-white rounded-3xl border border-gray-100 shadow-xl overflow-hidden hover:border-amber-400/50 transition-all flex flex-col md:flex-row">
          {/* Price section */}
          <div className="p-8 sm:p-10 bg-amber-50/20 border-b md:border-b-0 md:border-r border-gray-100 flex flex-col justify-center items-center text-center md:w-2/5">
            <span className="px-3 py-1 rounded-full bg-amber-100 border border-amber-200 text-amber-600 text-[10px] font-extrabold uppercase tracking-wider mb-4">
              Pro Access
            </span>
            <div className="flex items-baseline justify-center gap-1.5 mb-2">
              <span className="text-6xl font-black tracking-tighter text-gray-900">
                {isYearly ? "$9" : "$14"}
              </span>
              <span className="text-sm text-gray-400 font-semibold">/month</span>
            </div>
            <p className="text-xs text-gray-500 font-medium mb-8">
              {isYearly ? "Billed annually ($108/year)" : "Billed month-to-month"}
            </p>
            
            <Link
              href={SIGNUP_URL}
              className="w-full inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-gray-900 font-bold text-sm shadow-md shadow-amber-200 transition-all hover:scale-[1.02]"
            >
              Get EasyFetcher Pro <ArrowRight className="w-4 h-4" />
            </Link>
            
            <p className="text-[11px] text-gray-400 mt-4">
              Secure checkout via Dodo Payments
            </p>
          </div>

          {/* Features section */}
          <div className="p-8 sm:p-10 flex-1 flex flex-col justify-between">
            <div>
              <h3 className="text-lg font-bold text-gray-900 mb-6">Everything you need to query your data with AI</h3>
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[
                  "Google Search Console",
                  "Google Analytics 4",
                  "Google My Business",
                  "PageSpeed Insights",
                  "Up to 5 sites / domains",
                  "1 Workspace included",
                  "10,000 MCP calls / month",
                  "Full pre-built AI prompt library",
                  "Premium Email support",
                  "Works with Claude Desktop & Cursor"
                ].map((feature) => (
                  <li key={feature} className="flex items-start gap-2.5 text-sm">
                    <div className="w-5 h-5 rounded-full flex items-center justify-center shrink-0 mt-0.5 bg-amber-50 border border-amber-100">
                      <Check className="w-3 h-3 text-amber-500" />
                    </div>
                    <span className="text-gray-600 font-medium">{feature}</span>
                  </li>
                ))}
              </ul>
            </div>
            
            <div className="mt-8 pt-6 border-t border-gray-50 text-xs text-gray-400 flex items-center justify-between">
              <span>Cancel anytime. No lock-in contract.</span>
              <span className="font-semibold text-amber-600">30-day guarantee</span>
            </div>
          </div>
        </div>
      </section>

      {/* Detailed Features */}
      <section className="py-16 px-4 sm:px-6 bg-gray-50/50 border-t border-gray-100">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight text-center mb-12">
            What you get with EasyFetcher Pro
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
              <span className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-100 flex items-center justify-center mb-4">
                <Zap className="w-5 h-5 text-amber-500" />
              </span>
              <h3 className="text-base font-bold text-gray-900 mb-2">4 SEO Integrations</h3>
              <p className="text-sm text-gray-500 leading-relaxed mb-4">
                Connect your Google SEO platforms in seconds and query them via MCP.
              </p>
              <div className="flex items-center gap-1.5 flex-wrap">
                {["/connectors/gsc.svg", "/connectors/google-analytics.svg", "/connectors/google-my-business.svg", "/connectors/pagespeed.svg"].map((logo, idx) => (
                  // eslint-disable-next-line @next/next/no-img-element
                  <div key={idx} className="w-8 h-8 rounded-lg border border-gray-100 flex items-center justify-center p-1.5 bg-white shadow-xs">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={logo} alt="Connector logo" className="w-full h-full object-contain" />
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
              <span className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-100 flex items-center justify-center mb-4 flex-col">
                <Check className="w-5 h-5 text-amber-500" />
              </span>
              <h3 className="text-base font-bold text-gray-900 mb-2">AI Prompts & Skills</h3>
              <p className="text-sm text-gray-500 leading-relaxed">
                Unlock our full pre-built AI prompt library and custom Claude Desktop skills to analyze keywords, traffic, and site speed.
              </p>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
              <span className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-100 flex items-center justify-center mb-4">
                <Check className="w-5 h-5 text-amber-500" />
              </span>
              <h3 className="text-base font-bold text-gray-900 mb-2">Limits built for growth</h3>
              <p className="text-sm text-gray-500 leading-relaxed">
                Connect up to 5 sites or domains per workspace, and run up to 10,000 AI calls/month. Premium email support included.
              </p>
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
            Your SEO data, answered by AI
          </h2>
          <p className="text-gray-400 text-base sm:text-lg mb-8 leading-relaxed">
            Get instant insights from GSC, GA4, GMB and PageSpeed. Start for just $9/month.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              href={SIGNUP_URL}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl bg-amber-500 text-gray-900 font-bold text-base hover:bg-amber-400 transition-colors shadow-lg shadow-amber-500/20"
            >
              Get started now <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          <p className="text-gray-600 text-sm mt-5">Cancel anytime · Secure checkout</p>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}
