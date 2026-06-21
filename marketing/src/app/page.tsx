"use client";

import { useState } from "react";
import { Zap, BarChart2, Globe, Shield, ArrowRight, Check, Star, TrendingUp, Users, Clock, ChevronDown, Sparkles } from "lucide-react";
import Link from "next/link";
import SiteNav from "@/components/SiteNav";
import SiteFooter from "@/components/SiteFooter";
import { SIGNUP_URL } from "@/lib/constants";
import { PLANS, getDodoCheckoutUrl, TRY_PLAN, getTryPlanUrl } from "@/lib/dodo";
import { IMAGES, DESTINATIONS } from "@/lib/cloudinary";

const features = [
  {
    icon: Globe,
    title: "10+ Data Sources",
    description: "Connect Google Search Console, GA4, Meta Ads, Instagram, Google My Business, Shopify and more in seconds.",
  },
  {
    icon: Zap,
    title: "AI-Powered Prompts",
    description: "Run pre-built prompt templates powered by Claude AI — get insights from your data without writing a single query.",
  },
  {
    icon: BarChart2,
    title: "MCP Protocol",
    description: "Works natively with Claude Desktop and any AI client that supports the Model Context Protocol.",
  },
  {
    icon: Shield,
    title: "Secure by Default",
    description: "All tokens stored AES-256 encrypted. Your data never leaves your control.",
  },
];

const connectors = [
  { name: "Google Search Console", logo: IMAGES.connectors.gsc },
  { name: "Google Analytics 4", logo: IMAGES.connectors.ga4 },
  { name: "Google My Business", logo: IMAGES.connectors.gmb },
  { name: "PageSpeed Insights", logo: IMAGES.connectors.pagespeed },
];

const stats = [
  { icon: Users, value: "5,000+", label: "Marketers using EasyFetcher" },
  { icon: TrendingUp, value: "10+", label: "Platform integrations" },
  { icon: Clock, value: "30 sec", label: "Average setup time" },
  { icon: Zap, value: "99.9%", label: "Uptime SLA" },
];


const testimonials = [
  {
    quote: "EasyFetcher cut my reporting time in half. I just ask Claude a question and get the answer from my real GA4 data.",
    name: "Sarah K.",
    role: "SEO Consultant",
    stars: 5,
  },
  {
    quote: "Finally a tool that connects all my client data sources to AI without me having to write Python scripts.",
    name: "Marcus R.",
    role: "Digital Marketing Agency Owner",
    stars: 5,
  },
  {
    quote: "The GSC integration alone is worth it. I get keyword insights in seconds that used to take me 30 minutes.",
    name: "Priya M.",
    role: "Growth Marketer",
    stars: 5,
  },
];

const faqs = [
  {
    q: "Do I need a Claude subscription to use Easy Fetcher?",
    a: "No. You do not need a paid Claude subscription to use Easy Fetcher. You can connect Easy Fetcher to Claude and start using its SEO and marketing skills with your Claude account.",
  },
  {
    q: "Is Easy Fetcher free?",
    a: "No. Easy Fetcher is a paid product. Easy Fetcher is built with input from experienced SEO professionals and marketers to deliver reliable insights, reports, and workflows. Our focus is on providing high-quality SEO capabilities rather than a limited free experience.",
  },
  {
    q: "How do I use Easy Fetcher?",
    a: null,
    steps: [
      "Create your Easy Fetcher account.",
      "Add the Easy Fetcher MCP URL to Claude.",
      "Connect your data sources (optional, depending on the skill).",
      "Start asking Claude for audits, reports, keyword insights, rankings, AI visibility analysis, and more.",
    ],
    footer: "Claude will use Easy Fetcher to access the required data and generate actionable results.",
  },
  {
    q: "Is my data secure?",
    a: "Yes. Data security is a top priority at Easy Fetcher. We use industry-standard security practices, encrypted connections, and multiple layers of protection to safeguard your data. Your information is handled securely and is only used to provide the features and insights you request.",
  },
  {
    q: "What can I do with Easy Fetcher?",
    a: "Easy Fetcher helps you perform SEO and marketing workflows directly inside Claude, including:",
    bullets: [
      "SEO Audits", "Technical Site Audits", "SEO Client Reports", "Internal SEO Reports",
      "Keyword Research", "Rank Tracking", "AI Visibility Analysis", "Schema Generation",
      "SEO Proposals", "Performance Analysis",
    ],
    footer: "New skills and integrations are added regularly.",
  },
  {
    q: "Who is Easy Fetcher for?",
    a: "Easy Fetcher is built for SEO professionals, agencies, consultants, growth marketers, founders, and businesses that want to automate SEO analysis and reporting using Claude.",
  },
];

function FaqAccordion() {
  const [open, setOpen] = useState<number | null>(null);
  return (
    <div className="divide-y divide-gray-100 border border-gray-100 rounded-2xl overflow-hidden">
      {faqs.map((faq, i) => (
        <div key={i} className="bg-white">
          <button
            className="w-full flex items-center justify-between px-6 py-5 text-left gap-4 hover:bg-gray-50 transition-colors"
            onClick={() => setOpen(open === i ? null : i)}
            aria-expanded={open === i}
          >
            <span className="text-sm sm:text-base font-semibold text-gray-900">{faq.q}</span>
            <ChevronDown
              className={`w-5 h-5 text-gray-400 shrink-0 transition-transform duration-200 ${open === i ? "rotate-180" : ""}`}
            />
          </button>
          {open === i && (
            <div className="px-6 pb-6 text-sm text-gray-600 leading-relaxed space-y-3">
              {faq.a && <p>{faq.a}</p>}
              {faq.steps && (
                <ol className="space-y-1.5 pl-1">
                  {faq.steps.map((step, j) => (
                    <li key={j} className="flex gap-3">
                      <span className="shrink-0 w-5 h-5 rounded-full bg-amber-100 text-amber-600 text-xs font-bold flex items-center justify-center mt-0.5">{j + 1}</span>
                      <span>{step}</span>
                    </li>
                  ))}
                </ol>
              )}
              {faq.bullets && (
                <div className="flex flex-wrap gap-2 pt-1">
                  {faq.bullets.map((b) => (
                    <span key={b} className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 border border-amber-100 text-amber-700 text-xs font-medium">
                      <Check className="w-3 h-3" />{b}
                    </span>
                  ))}
                </div>
              )}
              {faq.footer && <p className="text-gray-500 italic">{faq.footer}</p>}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

export default function HomePage() {
  const [isYearly, setIsYearly] = useState(true);

  return (
    <div className="min-h-screen bg-white text-gray-900" style={{ fontFamily: "'Inter', system-ui, sans-serif" }}>
      <SiteNav />

      {/* Hero */}
      <section className="pt-14 sm:pt-20 lg:pt-24 pb-20 px-4 sm:px-6" style={{ background: "linear-gradient(180deg, #fffbeb 0%, #ffffff 100%)" }}>
        <div className="max-w-5xl mx-auto text-center">
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold text-gray-900 leading-[1.1] tracking-tight mb-6">
            Make Better SEO Decisions<br />
            with <span style={{ color: "#16a34a" }}>AI</span> <span className="text-gray-900">&amp;</span> <span style={{ color: "#16a34a" }}>Data</span>
          </h1>

          <p className="text-base sm:text-lg md:text-xl lg:text-2xl text-gray-500 max-w-2xl lg:max-w-3xl mx-auto mb-7 lg:mb-9 leading-relaxed font-normal">
            Connect Google Search Console, GA4, and SEO data sources to Claude, ChatGPT, and Perplexity. Generate SEO audits, client reports, technical recommendations, keyword insights, rank tracking, and AI visibility reports from your real data.
          </p>

          {/* Works with — AI assistants */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-x-6 gap-y-3 mb-8 lg:mb-10">
            <span className="text-xs lg:text-sm font-semibold uppercase tracking-wider text-gray-400">Works with</span>
            <div className="flex items-center gap-5 sm:gap-7">
              {DESTINATIONS.map((dest) => (
                <span key={dest.name} className="inline-flex items-center gap-2">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={dest.img} alt={dest.name} className="w-6 h-6 lg:w-7 lg:h-7 object-contain" />
                  <span className="text-sm lg:text-base font-semibold text-gray-700">{dest.name}</span>
                </span>
              ))}
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 mb-8 lg:mb-10">
            <Link
              href={SIGNUP_URL}
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-8 lg:px-10 py-3.5 lg:py-4 rounded-lg bg-[#0e1b2f] text-white font-semibold text-base lg:text-lg hover:bg-[#1c3050] transition-colors shadow-md shadow-[#0e1b2f]/10"
            >
              Get Started <ArrowRight className="w-4 h-4 lg:w-5 lg:h-5" />
            </Link>
            <a
              href="#features"
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-8 lg:px-10 py-3.5 lg:py-4 rounded-lg border border-gray-200 bg-white text-gray-700 font-semibold text-base lg:text-lg hover:border-[#0e1b2f]/30 hover:shadow-sm transition-all"
            >
              Browse SEO Skills
            </a>
          </div>

          {/* Trust bar */}
          <div className="flex flex-wrap items-center justify-center gap-2 mt-2">
            {[
              { label: "Search Console", img: IMAGES.connectors.gsc },
              { label: "GA4", img: IMAGES.connectors.ga4 },
              { label: "PageSpeed Insights", img: IMAGES.connectors.pagespeed },
              { label: "Rank Tracking", img: null },
              { label: "Backlink Data", img: null },
              { label: "AI Visibility", img: null },
            ].map((item, i) => (
              <span
                key={item.label}
                className="inline-flex items-center gap-1.5 px-3 lg:px-4 py-1.5 lg:py-2 rounded-full bg-white border border-gray-200 text-gray-500 text-xs lg:text-sm font-medium shadow-sm"
              >
                {item.img ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={item.img} alt="" className="w-3.5 h-3.5 lg:w-4 lg:h-4 object-contain" />
                ) : (
                  <Zap className="w-3 h-3 lg:w-3.5 lg:h-3.5 text-amber-400" />
                )}
                {item.label}
              </span>
            ))}
          </div>
        </div>

        {/* Hero mockup — Claude SEO audit conversation */}
        <div className="max-w-2xl lg:max-w-3xl mx-auto mt-14 lg:mt-16">
          <div className="rounded-2xl border border-gray-200 bg-white shadow-2xl shadow-gray-100/80 overflow-hidden">
            {/* Window chrome */}
            <div className="flex items-center gap-2 px-4 sm:px-5 py-3 bg-gray-50 border-b border-gray-100">
              <div className="flex gap-1.5">
                <div className="w-3 h-3 rounded-full bg-red-400" />
                <div className="w-3 h-3 rounded-full bg-yellow-400" />
                <div className="w-3 h-3 rounded-full bg-green-400" />
              </div>
              <span className="ml-2 text-xs text-gray-400 font-mono truncate">Claude Desktop — EasyFetcher MCP</span>
            </div>

            <div className="p-4 sm:p-6 space-y-4 bg-white">
              {/* User message */}
              <div className="flex gap-3 items-start">
                <div className="w-7 h-7 rounded-full bg-gray-200 flex items-center justify-center shrink-0 text-xs font-bold text-gray-500">U</div>
                <div className="bg-gray-100 rounded-2xl rounded-tl-none px-4 py-3 text-sm text-gray-700 leading-relaxed">
                  Run a complete SEO audit for easyfetcher.com
                </div>
              </div>

              {/* Claude response */}
              <div className="flex gap-3 items-start flex-row-reverse">
                <div className="w-7 h-7 rounded-full bg-amber-500 flex items-center justify-center shrink-0">
                  <Zap className="w-3.5 h-3.5 text-white" />
                </div>
                <div className="bg-amber-50 border border-amber-100 rounded-2xl rounded-tr-none px-4 py-4 text-sm text-gray-700 w-full max-w-sm sm:max-w-md space-y-3">

                  {/* Connected sources */}
                  <div className="space-y-1">
                    {["Search Console Connected", "GA4 Connected", "PageSpeed Insights Connected"].map((src) => (
                      <div key={src} className="flex items-center gap-2 text-xs text-green-700">
                        <Check className="w-3.5 h-3.5 text-green-500 shrink-0" />
                        {src}
                      </div>
                    ))}
                  </div>

                  <div className="border-t border-amber-200 pt-3">
                    <p className="text-xs font-bold text-gray-800 mb-2 uppercase tracking-wide">SEO Audit Summary</p>
                    <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-xs">
                      <div className="text-gray-500">Traffic Trend</div><div className="font-semibold text-green-600">+24%</div>
                      <div className="text-gray-500">Indexed Pages</div><div className="font-semibold text-gray-800">1,243</div>
                      <div className="text-gray-500">Critical Issues</div><div className="font-semibold text-red-500">7</div>
                      <div className="text-gray-500">Missing Meta Desc.</div><div className="font-semibold text-amber-600">43</div>
                      <div className="text-gray-500">Core Web Vitals Failed</div><div className="font-semibold text-red-500">12</div>
                    </div>
                  </div>

                  <div className="border-t border-amber-200 pt-3">
                    <p className="text-xs font-bold text-gray-800 mb-2 uppercase tracking-wide">Top Opportunities</p>
                    <ol className="space-y-1 text-xs text-gray-600">
                      <li className="flex gap-2"><span className="text-amber-500 font-bold shrink-0">1.</span>Fix slow category pages</li>
                      <li className="flex gap-2"><span className="text-amber-500 font-bold shrink-0">2.</span>Improve CTR on branded keywords</li>
                      <li className="flex gap-2"><span className="text-amber-500 font-bold shrink-0">3.</span>Add schema to product pages</li>
                    </ol>
                  </div>

                  <button className="w-full mt-1 py-2 px-4 rounded-lg bg-[#0e1b2f] text-white text-xs font-semibold hover:bg-[#1c3050] transition-colors flex items-center justify-center gap-1.5">
                    Generate Detailed Report <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-12 px-4 sm:px-6 border-y border-gray-100 bg-white">
        <div className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8">
          {stats.map((s) => {
            const Icon = s.icon;
            return (
              <div key={s.label} className="text-center">
                <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center mx-auto mb-3">
                  <Icon className="w-5 h-5 text-amber-500" />
                </div>
                <p className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-gray-900 tracking-tight">{s.value}</p>
                <p className="text-xs sm:text-sm lg:text-base text-gray-500 mt-1">{s.label}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-16 sm:py-24 px-4 sm:px-6 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <p className="text-sm font-semibold text-amber-500 uppercase tracking-wider mb-3">Features</p>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-gray-900 tracking-tight mb-4">
              Everything you need to query<br className="hidden sm:block" />your marketing data with AI
            </h2>
            <p className="text-base sm:text-lg lg:text-xl text-gray-500 max-w-2xl mx-auto">
              EasyFetcher bridges your marketing platforms and AI tools in minutes, not months.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
            {features.map((f) => {
              const Icon = f.icon;
              return (
                <div key={f.title} className="group flex gap-4 sm:gap-5 p-5 sm:p-7 rounded-2xl border border-gray-100 hover:border-amber-100 hover:shadow-lg hover:shadow-blue-50/50 transition-all bg-white">
                  <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl bg-amber-50 group-hover:bg-amber-100 flex items-center justify-center shrink-0 transition-colors">
                    <Icon className="w-5 h-5 sm:w-6 sm:h-6 text-amber-500" />
                  </div>
                  <div>
                    <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-1.5 tracking-tight">{f.title}</h3>
                    <p className="text-gray-500 leading-relaxed text-sm">{f.description}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-16 sm:py-24 px-4 sm:px-6" style={{ background: "#fffbeb" }}>
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <p className="text-sm font-semibold text-amber-500 uppercase tracking-wider mb-3">How it works</p>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-gray-900 tracking-tight mb-4">From Question to Deliverable in 3 Steps</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
            {/* Step 01 */}
            <div className="relative bg-white rounded-2xl p-6 sm:p-7 border border-gray-100 shadow-sm">
              <div className="hidden md:block absolute top-10 -right-3 w-6 h-px bg-gray-200 z-10" />
              <div className="text-4xl font-black text-amber-100 mb-4 tracking-tighter">01</div>
              <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-2 tracking-tight">Install Easy Fetcher</h3>
              <p className="text-gray-500 text-sm leading-relaxed">Add Easy Fetcher to Claude in minutes.</p>
            </div>

            {/* Step 02 */}
            <div className="relative bg-white rounded-2xl p-6 sm:p-7 border border-gray-100 shadow-sm">
              <div className="hidden md:block absolute top-10 -right-3 w-6 h-px bg-gray-200 z-10" />
              <div className="text-4xl font-black text-amber-100 mb-4 tracking-tighter">02</div>
              <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-3 tracking-tight">Ask Claude What You Need</h3>
              <div className="space-y-2">
                {[
                  "Run an SEO audit",
                  "Create a client report",
                  "Track my rankings",
                  "Analyze AI visibility",
                ].map((prompt) => (
                  <div key={prompt} className="flex items-center gap-2 bg-amber-50 border border-amber-100 rounded-lg px-3 py-2">
                    <span className="text-amber-400 text-xs font-bold">&ldquo;</span>
                    <span className="text-gray-700 text-xs font-medium">{prompt}</span>
                    <span className="text-amber-400 text-xs font-bold">&rdquo;</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Step 03 */}
            <div className="bg-white rounded-2xl p-6 sm:p-7 border border-gray-100 shadow-sm">
              <div className="text-4xl font-black text-amber-100 mb-4 tracking-tighter">03</div>
              <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-2 tracking-tight">Receive Ready-to-Use Output</h3>
              <p className="text-gray-500 text-sm leading-relaxed">Get reports, audits, recommendations, opportunities, and insights without switching tools.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Connectors */}
      <section id="connectors" className="py-16 sm:py-24 px-4 sm:px-6 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <p className="text-sm font-semibold text-amber-500 uppercase tracking-wider mb-3">Integrations</p>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-gray-900 tracking-tight mb-4">
              All your SEO data,<br className="hidden sm:block" />in one AI-powered workspace
            </h2>
            <p className="text-base sm:text-lg lg:text-xl text-gray-500">Connect your Google SEO tools and query them in plain English.</p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6 max-w-3xl mx-auto">
            {connectors.map((c) => (
              <div key={c.name} className="group flex flex-col items-center gap-3 p-5 sm:p-6 rounded-2xl border border-gray-100 hover:border-amber-200 hover:shadow-lg hover:shadow-amber-50/80 transition-all bg-white cursor-default">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={c.logo} alt={c.name} className="w-10 h-10 sm:w-12 sm:h-12 object-contain" />
                <span className="text-xs font-semibold text-center leading-tight text-gray-700">{c.name}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonials" className="py-16 sm:py-24 px-4 sm:px-6" style={{ background: "#fffbeb" }}>
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <p className="text-sm font-semibold text-amber-500 uppercase tracking-wider mb-3">Customers</p>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-gray-900 tracking-tight">Loved by marketers worldwide</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
            {testimonials.map((t) => (
              <div key={t.name} className="bg-white rounded-2xl p-5 sm:p-7 border border-gray-100 shadow-sm flex flex-col gap-4 sm:gap-5">
                <div className="flex gap-1">
                  {Array.from({ length: t.stars }).map((_, i) => (
                    <Star key={i} className="w-4 h-4 text-amber-400 fill-amber-400" />
                  ))}
                </div>
                <p className="text-gray-600 leading-relaxed text-sm flex-1">&ldquo;{t.quote}&rdquo;</p>
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-amber-100 flex items-center justify-center text-sm font-bold text-amber-500">
                    {t.name[0]}
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900 text-sm">{t.name}</p>
                    <p className="text-gray-400 text-xs">{t.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-16 sm:py-24 px-4 sm:px-6 bg-gray-50/50">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-10">
            <p className="text-sm font-semibold text-amber-500 uppercase tracking-wider mb-3">Pricing</p>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-gray-900 tracking-tight mb-4">Simple, transparent pricing</h2>
            <p className="text-base sm:text-lg lg:text-xl text-gray-500 max-w-xl mx-auto">
              All plans include every connector and AI skill. Pick the size that fits your workload.
            </p>

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

          {/* Try Plan banner */}
          <div className="mb-8 rounded-2xl border border-amber-200 bg-amber-50/60 p-5 sm:p-6">
            <div className="flex flex-col lg:flex-row lg:items-center gap-4 lg:gap-8">
              <div className="flex-1">
                <div className="flex flex-wrap items-center gap-2 mb-2.5">
                  <span className="inline-flex items-center gap-1.5 text-amber-600 text-xs font-bold uppercase tracking-wider">
                    <Sparkles className="w-3.5 h-3.5" /> {TRY_PLAN.name}
                  </span>
                  <span className="px-2 py-0.5 rounded-full bg-amber-100 border border-amber-200 text-amber-700 text-[11px] font-bold">
                    One-time
                  </span>
                </div>
                <p className="text-base sm:text-lg font-bold text-gray-900 mb-2.5">{TRY_PLAN.description}</p>
                <div className="flex flex-wrap gap-x-5 gap-y-1.5">
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

          {/* 3-plan grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {PLANS.map((plan) => {
              const price = isYearly ? plan.yearlyPrice : plan.monthlyPrice;
              const productId = isYearly ? plan.yearlyProductId : plan.monthlyProductId;
              const checkoutUrl = getDodoCheckoutUrl(productId);
              return (
                <div
                  key={plan.id}
                  className={`relative rounded-2xl border bg-white flex flex-col p-7 transition-all hover:shadow-xl ${
                    plan.highlight
                      ? "border-[#0e1b2f] ring-2 ring-[#0e1b2f]/15 shadow-lg shadow-gray-200"
                      : "border-gray-100 hover:border-[#0e1b2f]/20"
                  }`}
                >
                  {plan.highlight && (
                    <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                      <span className="flex items-center gap-1 px-3 py-1 rounded-full bg-[#0e1b2f] text-white text-[10px] font-extrabold whitespace-nowrap shadow-sm">
                        <Zap className="w-2.5 h-2.5" /> Most popular
                      </span>
                    </div>
                  )}

                  <div className="mb-5">
                    <h3 className="text-base font-bold text-gray-900 mb-1">{plan.name}</h3>
                    <p className="text-xs text-gray-500 leading-snug mb-4">{plan.description}</p>
                    <div className="flex items-end gap-1">
                      <span className="text-4xl font-black tracking-tighter text-gray-900">${price}</span>
                      <span className="text-sm text-gray-400 font-semibold mb-1">/mo</span>
                    </div>
                    <p className="text-xs text-gray-400 mt-1">
                      {isYearly ? `Billed $${plan.yearlyTotal}/year` : "Billed monthly"}
                    </p>
                  </div>

                  <ul className="space-y-2.5 flex-1 mb-6">
                    {plan.features.map((f) => (
                      <li key={f} className="flex items-start gap-2.5 text-sm">
                        <div className="w-4 h-4 rounded-full flex items-center justify-center shrink-0 mt-0.5 bg-amber-50 border border-amber-100">
                          <Check className="w-2.5 h-2.5 text-amber-500" />
                        </div>
                        <span className="text-gray-600">{f}</span>
                      </li>
                    ))}
                  </ul>

                  <a
                    href={checkoutUrl}
                    className={`w-full inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl font-bold text-sm transition-all hover:scale-[1.02] ${
                      plan.highlight
                        ? "bg-[#0e1b2f] hover:bg-[#1c3050] text-white shadow-md shadow-gray-300"
                        : "border-2 border-[#0e1b2f]/80 text-[#0e1b2f] hover:bg-[#0e1b2f]/5"
                    }`}
                  >
                    Get {plan.name} <ArrowRight className="w-4 h-4" />
                  </a>
                </div>
              );
            })}
          </div>

          <p className="text-center text-xs text-gray-400 mt-6">Secure checkout via Dodo Payments · Cancel anytime</p>
        </div>
      </section>


      {/* FAQ */}
      <section className="py-16 sm:py-24 px-4 sm:px-6 bg-white">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-12">
            <p className="text-sm font-semibold text-amber-500 uppercase tracking-wider mb-3">FAQ</p>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-gray-900 tracking-tight">Frequently asked questions</h2>
          </div>

          <FaqAccordion />
        </div>
      </section>

      {/* CTA Banner */}
      <section className="py-16 sm:py-24 px-4 sm:px-6 bg-[#0e1b2f]">
        <div className="max-w-3xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-semibold mb-6 sm:mb-8">
            <Zap className="w-3.5 h-3.5" />
            Get started in 30 seconds
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-white tracking-tight mb-4 sm:mb-5">
            Start querying your data<br />with AI today
          </h2>
          <p className="text-gray-400 text-base sm:text-lg mb-8 sm:mb-10 leading-relaxed">
            Get instant insights from Google Search Console, GA4, GMB and PageSpeed.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <a
              href={getDodoCheckoutUrl(PLANS.find((p) => p.highlight)?.yearlyProductId ?? PLANS[1].yearlyProductId)}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 sm:px-10 py-3.5 sm:py-4 rounded-xl bg-white text-[#0e1b2f] font-bold text-base hover:bg-gray-100 transition-colors shadow-lg shadow-black/20"
            >
              Start Pro Plan <ArrowRight className="w-4 h-4" />
            </a>
            <Link
              href="/pricing"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl border border-white/10 text-gray-300 font-semibold text-base hover:border-white/20 hover:text-white transition-colors"
            >
              View all plans
            </Link>
          </div>
          <p className="text-gray-500 text-sm mt-5">Cancel anytime · Secure checkout via Dodo Payments</p>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}
