"use client";

import { useState } from "react";
import { Check, ArrowRight, Zap, ChevronDown, Shield, RefreshCw, Sparkles } from "lucide-react";
import SiteNav from "@/components/SiteNav";
import SiteFooter from "@/components/SiteFooter";
import { PLANS, getDodoCheckoutUrl, TRY_PLAN, getTryPlanUrl } from "@/lib/dodo";
import { DESTINATIONS } from "@/lib/cloudinary";

const faqs = [
  {
    q: "Can I switch between monthly and yearly billing?",
    a: "Yes, you can switch billing periods at any time from your Dodo Payments customer portal. The change will take effect at the end of your current billing cycle.",
  },
  {
    q: "What counts as a credit?",
    a: "Each time you run an AI-powered feature (rank tracking, citation tracking, SEO audit, etc.) through EasyFetcher, it costs credits. Direct OAuth data fetches from GSC, GA4, and GMB are always free and don't count against your credits.",
  },
  {
    q: "Do you offer a money-back guarantee?",
    a: "Absolutely! We offer a 30-day money-back guarantee on all subscriptions. If you're not satisfied, just email us for a full refund — no questions asked.",
  },
  {
    q: "What is a workspace?",
    a: "A workspace groups your connected accounts and your AI prompt library. Starter gets 1 workspace, Pro gets 3, and Agency gets 15 — perfect for managing multiple clients.",
  },
  {
    q: "Which AI clients does EasyFetcher support?",
    a: "EasyFetcher supports any client that implements the Model Context Protocol (MCP). This includes Claude Desktop, Cursor, Windsurf, and other compatible AI tools.",
  },
  {
    q: "Can I upgrade or downgrade my plan?",
    a: "Yes, you can change your plan at any time via the Dodo Payments customer portal. Upgrades take effect immediately; downgrades apply at the next billing cycle.",
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
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-gray-900 tracking-tight leading-[1.1] mb-4">
            Pick the plan<br />
            <span className="text-amber-500">that fits your scale.</span>
          </h1>
          <p className="text-base sm:text-lg text-gray-500 leading-relaxed">
            Every plan includes all connectors, all AI Skills, and the full prompt library.
            No hidden fees.
          </p>

          {/* Works with — AI assistants */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-x-6 gap-y-3 mt-7">
            <span className="text-xs font-semibold uppercase tracking-wider text-gray-400">Works with</span>
            <div className="flex items-center gap-5 sm:gap-7">
              {DESTINATIONS.map((dest) => (
                <span key={dest.name} className="inline-flex items-center gap-2">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={dest.img} alt={dest.name} className="w-6 h-6 object-contain" />
                  <span className="text-sm font-semibold text-gray-700">{dest.name}</span>
                </span>
              ))}
            </div>
          </div>

          {/* Billing toggle */}
          <div className="flex items-center justify-center gap-4 mt-8">
            <span className={`text-sm font-medium ${!isYearly ? "text-gray-900" : "text-gray-400"}`}>Monthly</span>
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
              <span className={`text-sm font-medium ${isYearly ? "text-gray-900" : "text-gray-400"}`}>Yearly</span>
              <span className="text-[10px] font-bold text-amber-600 bg-amber-100 border border-amber-200 px-2 py-0.5 rounded-full">
                Save ~35%
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Plan Cards */}
      <section className="pb-20 px-4 sm:px-6">
        <div className="max-w-5xl mx-auto">
          {/* Try Plan banner */}
          <div className="mb-10 rounded-2xl border border-amber-200 bg-amber-50/60 p-6 sm:p-7">
            <div className="flex flex-col lg:flex-row lg:items-center gap-5 lg:gap-8">
              <div className="flex-1">
                <div className="flex flex-wrap items-center gap-2 mb-3">
                  <span className="inline-flex items-center gap-1.5 text-amber-600 text-xs font-bold uppercase tracking-wider">
                    <Sparkles className="w-3.5 h-3.5" /> {TRY_PLAN.name}
                  </span>
                  <span className="px-2 py-0.5 rounded-full bg-amber-100 border border-amber-200 text-amber-700 text-[11px] font-bold">
                    One-time
                  </span>
                </div>
                <p className="text-lg font-bold text-gray-900 mb-3">{TRY_PLAN.description}</p>
                <div className="flex flex-wrap gap-x-5 gap-y-2">
                  {TRY_PLAN.features.map((f) => (
                    <span key={f} className="inline-flex items-center gap-1.5 text-sm text-gray-600">
                      <Check className="w-4 h-4 text-amber-500 shrink-0" />
                      {f}
                    </span>
                  ))}
                </div>
              </div>
              <a
                href={getTryPlanUrl()}
                className="w-full lg:w-auto shrink-0 inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl bg-[#0e1b2f] text-white font-bold text-sm hover:bg-[#1c3050] transition-colors"
              >
                Get started for ${TRY_PLAN.price} <ArrowRight className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Subscription divider */}
          <div className="flex items-center gap-4 mb-8">
            <div className="flex-1 h-px bg-gray-200" />
            <span className="text-sm font-medium text-gray-400 whitespace-nowrap">Or subscribe for full access</span>
            <div className="flex-1 h-px bg-gray-200" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {PLANS.map((plan) => {
              const price = isYearly ? plan.yearlyPrice : plan.monthlyPrice;
              const productId = isYearly ? plan.yearlyProductId : plan.monthlyProductId;
              const checkoutUrl = getDodoCheckoutUrl(productId);
              return (
                <div
                  key={plan.id}
                  className={`relative rounded-3xl border bg-white flex flex-col p-8 transition-all hover:shadow-2xl ${
                    plan.highlight
                      ? "border-[#0e1b2f] ring-2 ring-[#0e1b2f]/15 shadow-xl shadow-gray-200"
                      : "border-gray-100 shadow-sm hover:border-[#0e1b2f]/20"
                  }`}
                >
                  {plan.highlight && (
                    <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                      <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#0e1b2f] text-white text-[10px] font-extrabold whitespace-nowrap shadow-md shadow-gray-300">
                        <Zap className="w-3 h-3" /> Most popular
                      </span>
                    </div>
                  )}

                  <div className="mb-6">
                    <h2 className="text-lg font-extrabold text-gray-900 mb-1">{plan.name}</h2>
                    <p className="text-sm text-gray-500 leading-snug mb-5">{plan.description}</p>
                    <div className="flex items-end gap-1.5">
                      <span className="text-5xl font-black tracking-tighter text-gray-900">${price}</span>
                      <span className="text-base text-gray-400 font-semibold mb-1">/mo</span>
                    </div>
                    <p className="text-xs text-gray-400 mt-1.5">
                      {isYearly
                        ? `Billed $${plan.yearlyTotal}/year — save $${(plan.monthlyPrice * 12) - plan.yearlyTotal}/yr`
                        : "Billed month-to-month"}
                    </p>
                  </div>

                  <a
                    href={checkoutUrl}
                    className={`w-full inline-flex items-center justify-center gap-2 px-5 py-3.5 rounded-xl font-bold text-sm transition-all hover:scale-[1.02] mb-7 ${
                      plan.highlight
                        ? "bg-[#0e1b2f] hover:bg-[#1c3050] text-white shadow-lg shadow-gray-300"
                        : "border-2 border-[#0e1b2f]/80 text-[#0e1b2f] hover:bg-[#0e1b2f]/5"
                    }`}
                  >
                    Get {plan.name} <ArrowRight className="w-4 h-4" />
                  </a>

                  <div className="border-t border-gray-100 pt-6">
                    <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-3">What&apos;s included</p>
                    <ul className="space-y-3">
                      {plan.features.map((f) => (
                        <li key={f} className="flex items-start gap-2.5 text-sm">
                          <div className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${
                            plan.highlight ? "bg-amber-50 border border-amber-200" : "bg-gray-50 border border-gray-100"
                          }`}>
                            <Check className={`w-3 h-3 ${plan.highlight ? "text-amber-500" : "text-gray-400"}`} />
                          </div>
                          <span className="text-gray-600">{f}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Trust badges */}
          <div className="mt-10 flex flex-wrap items-center justify-center gap-6 text-sm text-gray-400">
            <span className="flex items-center gap-1.5">
              <Shield className="w-4 h-4 text-amber-500" />
              Secure checkout via Dodo Payments
            </span>
            <span className="flex items-center gap-1.5">
              <RefreshCw className="w-4 h-4 text-amber-500" />
              30-day money-back guarantee
            </span>
            <span className="flex items-center gap-1.5">
              <Check className="w-4 h-4 text-amber-500" />
              Cancel anytime
            </span>
          </div>
        </div>
      </section>

      {/* Feature comparison */}
      <section className="py-16 px-4 sm:px-6 bg-gray-50/50 border-t border-gray-100">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight text-center mb-10">
            Compare plans
          </h2>
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden overflow-x-auto">
            <table className="w-full text-sm min-w-[480px]">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50/50">
                  <th className="text-left px-6 py-4 font-semibold text-gray-700">Feature</th>
                  <th className="px-4 py-4 font-semibold text-gray-700 text-center">Starter</th>
                  <th className="px-4 py-4 font-bold text-amber-600 text-center">Pro</th>
                  <th className="px-4 py-4 font-semibold text-gray-700 text-center">Agency</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {[
                  ["Credits / month", "50", "125", "275"],
                  ["All Connectors", "✓", "✓", "✓"],
                  ["AI Skills", "✓", "✓", "✓"],
                  ["Prompt Library Access", "✓", "✓", "✓"],
                  ["Keywords Tracking", "✓", "✓", "✓"],
                  ["Backlink Tracking", "✓", "✓", "✓"],
                  ["Competitor Research", "✓", "✓", "✓"],
                  ["SEO Audit", "✓", "✓", "✓"],
                  ["Technical Audit", "✓", "✓", "✓"],
                  ["Unlimited Clients", "✓", "✓", "✓"],
                  ["Works with ChatGPT, Claude & Perplexity", "✓", "✓", "✓"],
                  ["Support", "Email", "Priority email", "Dedicated Slack"],
                ].map(([feature, starter, pro, agency]) => (
                  <tr key={feature} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-3.5 font-medium text-gray-700">{feature}</td>
                    <td className="px-4 py-3.5 text-center text-gray-500">{starter}</td>
                    <td className="px-4 py-3.5 text-center font-semibold text-amber-600">{pro}</td>
                    <td className="px-4 py-3.5 text-center text-gray-500">{agency}</td>
                  </tr>
                ))}
              </tbody>
            </table>
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
      <section className="py-16 sm:py-20 px-4 sm:px-6 bg-[#0e1b2f]">
        <div className="max-w-2xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-semibold mb-6">
            <Zap className="w-3.5 h-3.5" />
            Get started in 30 seconds
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight mb-4">
            Your SEO data, answered by AI
          </h2>
          <p className="text-gray-400 text-base sm:text-lg mb-8 leading-relaxed">
            Start with Starter at $9/mo, or go straight to Pro. 30-day money-back guarantee on every plan.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <a
              href={getDodoCheckoutUrl(PLANS[1].yearlyProductId)}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl bg-white text-[#0e1b2f] font-bold text-base hover:bg-gray-100 transition-colors shadow-lg shadow-black/20"
            >
              Start with Pro <ArrowRight className="w-4 h-4" />
            </a>
            <a
              href={getDodoCheckoutUrl(PLANS[0].yearlyProductId)}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl border border-white/10 text-gray-300 font-semibold text-base hover:border-white/20 hover:text-white transition-colors"
            >
              Try Starter
            </a>
          </div>
          <p className="text-gray-500 text-sm mt-5">Cancel anytime · Secure checkout via Dodo Payments</p>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}
