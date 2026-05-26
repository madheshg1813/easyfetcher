"use client";

import { useState } from "react";
import { Zap, BarChart2, Globe, Shield, ArrowRight, Check, Star, TrendingUp, Users, Clock } from "lucide-react";
import Link from "next/link";
import SiteNav from "@/components/SiteNav";
import SiteFooter from "@/components/SiteFooter";
import { SIGNUP_URL } from "@/lib/constants";

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
  { name: "Google Search Console", logo: "/connectors/gsc.svg" },
  { name: "Google Analytics 4", logo: "/connectors/google-analytics.svg" },
  { name: "Google My Business", logo: "/connectors/google-my-business.svg" },
  { name: "PageSpeed Insights", logo: "/connectors/pagespeed.svg" },
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

export default function HomePage() {
  const [isYearly, setIsYearly] = useState(true);

  return (
    <div className="min-h-screen bg-white text-gray-900" style={{ fontFamily: "'Inter', system-ui, sans-serif" }}>
      <SiteNav />

      {/* Hero */}
      <section className="pt-14 pb-20 px-4 sm:px-6" style={{ background: "linear-gradient(180deg, #fffbeb 0%, #ffffff 100%)" }}>
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-amber-200 bg-amber-50 text-amber-600 text-xs font-semibold mb-6">
            <Zap className="w-3.5 h-3.5" />
            Powered by Claude AI · Model Context Protocol
          </div>

          <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-gray-900 leading-[1.1] tracking-tight mb-5">
            Your marketing data,<br />
            <span className="text-amber-500">answered instantly by AI</span>
          </h1>

          <p className="text-base sm:text-xl text-gray-500 max-w-2xl mx-auto mb-8 leading-relaxed font-normal">
            Connect Google Search Console, GA4, Shopify and more to Claude AI.
            Ask questions in plain English. Get real answers from your live data.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-5">
            <Link
              href={SIGNUP_URL}
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-3.5 rounded-lg bg-amber-500 text-gray-900 font-semibold text-base hover:bg-amber-600 transition-colors shadow-md shadow-amber-100"
            >
              Get started now <ArrowRight className="w-4 h-4" />
            </Link>
            <a
              href="#pricing"
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-3.5 rounded-lg border border-gray-200 bg-white text-gray-700 font-semibold text-base hover:border-gray-300 hover:shadow-sm transition-all"
            >
              View pricing
            </a>
          </div>
          <p className="text-sm text-gray-400">Cancel anytime · Simple transparent pricing</p>
        </div>

        {/* Hero mockup */}
        <div className="max-w-3xl mx-auto mt-12 px-0 sm:px-0">
          <div className="rounded-2xl border border-gray-200 bg-white shadow-2xl shadow-gray-100/80 overflow-hidden">
            <div className="flex items-center gap-2 px-4 sm:px-5 py-3 bg-gray-50 border-b border-gray-100">
              <div className="flex gap-1.5">
                <div className="w-3 h-3 rounded-full bg-red-400" />
                <div className="w-3 h-3 rounded-full bg-yellow-400" />
                <div className="w-3 h-3 rounded-full bg-green-400" />
              </div>
              <span className="ml-2 text-xs text-gray-400 font-mono truncate">Claude Desktop — EasyFetcher MCP</span>
            </div>
            <div className="p-4 sm:p-6 space-y-4 bg-white">
              <div className="flex gap-3 items-start">
                <div className="w-7 h-7 rounded-full bg-gray-200 flex items-center justify-center shrink-0 text-xs font-bold text-gray-500">U</div>
                <div className="bg-gray-100 rounded-2xl rounded-tl-none px-4 py-3 text-sm text-gray-700 max-w-xs sm:max-w-sm leading-relaxed">
                  What are my top 10 landing pages by clicks in the last 30 days?
                </div>
              </div>
              <div className="flex gap-3 items-start flex-row-reverse">
                <div className="w-7 h-7 rounded-full bg-amber-500 flex items-center justify-center shrink-0">
                  <Zap className="w-3.5 h-3.5 text-white" />
                </div>
                <div className="bg-amber-50 border border-amber-100 rounded-2xl rounded-tr-none px-4 py-3 text-sm text-gray-700 max-w-xs sm:max-w-sm">
                  <p className="font-semibold text-amber-600 mb-2 text-xs uppercase tracking-wide">Fetching from Google Search Console</p>
                  <p className="text-gray-600 mb-2 text-xs sm:text-sm">Here are your top 10 landing pages by clicks (last 30 days):</p>
                  <ol className="space-y-1 text-xs text-gray-600 font-mono">
                    <li className="flex justify-between gap-4"><span className="truncate">1. /blog/seo-tips</span><span className="font-semibold text-gray-800 shrink-0">4,821</span></li>
                    <li className="flex justify-between gap-4"><span className="truncate">2. / (homepage)</span><span className="font-semibold text-gray-800 shrink-0">3,204</span></li>
                    <li className="flex justify-between gap-4"><span className="truncate">3. /pricing</span><span className="font-semibold text-gray-800 shrink-0">1,893</span></li>
                    <li className="text-gray-400">… and 7 more results</li>
                  </ol>
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
                <p className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">{s.value}</p>
                <p className="text-xs sm:text-sm text-gray-500 mt-1">{s.label}</p>
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
            <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 tracking-tight mb-4">
              Everything you need to query<br className="hidden sm:block" />your marketing data with AI
            </h2>
            <p className="text-base sm:text-lg text-gray-500 max-w-2xl mx-auto">
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
            <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 tracking-tight mb-4">Up and running in 3 steps</h2>
            <p className="text-base sm:text-lg text-gray-500">No technical setup. No API keys to manage. No code.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-8">
            {[
              {
                step: "01",
                title: "Connect your data",
                desc: "Click Connect on any platform — Google, Meta, Shopify. OAuth handles the authentication automatically.",
              },
              {
                step: "02",
                title: "Add to Claude",
                desc: "Copy one config snippet into Claude Desktop. The setup takes under 30 seconds.",
              },
              {
                step: "03",
                title: "Ask anything",
                desc: "Ask Claude about your campaigns, rankings, or revenue — and get real answers from your live data.",
              },
            ].map((s, i) => (
              <div key={s.step} className="relative bg-white rounded-2xl p-6 sm:p-7 border border-gray-100 shadow-sm">
                {i < 2 && (
                  <div className="hidden md:block absolute top-10 -right-4 w-8 h-px bg-gray-200 z-10" />
                )}
                <div className="text-4xl font-black text-amber-100 mb-4 tracking-tighter">{s.step}</div>
                <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-2 tracking-tight">{s.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Connectors */}
      <section id="connectors" className="py-16 sm:py-24 px-4 sm:px-6 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <p className="text-sm font-semibold text-amber-500 uppercase tracking-wider mb-3">Integrations</p>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 tracking-tight mb-4">
              All your SEO data,<br className="hidden sm:block" />in one AI-powered workspace
            </h2>
            <p className="text-base sm:text-lg text-gray-500">Connect your Google SEO tools and query them in plain English.</p>
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
            <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 tracking-tight">Loved by marketers worldwide</h2>
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
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-10">
            <p className="text-sm font-semibold text-amber-500 uppercase tracking-wider mb-3">Pricing</p>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 tracking-tight mb-4">One plan. Everything included.</h2>
            <p className="text-base sm:text-lg text-gray-500 max-w-xl mx-auto">
              Get all Google SEO integrations and AI features. Choose the billing period that suits you.
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

          {/* Pricing Card */}
          <div className="max-w-3xl mx-auto bg-white rounded-3xl border border-gray-100 shadow-xl overflow-hidden hover:border-amber-400/50 transition-all flex flex-col md:flex-row">
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
        </div>
      </section>

      {/* CTA Banner */}
      <section className="py-16 sm:py-24 px-4 sm:px-6 bg-gray-950">
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
          <Link
            href={SIGNUP_URL}
            className="inline-flex items-center gap-2 px-8 sm:px-10 py-3.5 sm:py-4 rounded-xl bg-amber-500 text-gray-900 font-bold text-base hover:bg-amber-400 transition-colors shadow-lg shadow-amber-500/20"
          >
            Start Pro Plan <ArrowRight className="w-4 h-4" />
          </Link>
          <p className="text-gray-600 text-sm mt-5">Cancel anytime · Secure checkout</p>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}
