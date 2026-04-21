import { Zap, BarChart2, Globe, Shield, ArrowRight, Check, Star } from "lucide-react";
import Link from "next/link";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://app.easyfetcher.com";

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
  { name: "Google Search Console", logo: "/connectors/gsc.svg", plan: "Free" },
  { name: "Google Analytics 4", logo: "/connectors/google-analytics.svg", plan: "Starter" },
  { name: "Google My Business", logo: "/connectors/google-my-business.svg", plan: "Starter" },
  { name: "Google Ads", logo: "/connectors/icons8-google-ads.svg", plan: "Pro" },
  { name: "Facebook Ads", logo: "/connectors/facebook.svg", plan: "Pro" },
  { name: "Instagram Insights", logo: "/connectors/instagram.svg", plan: "Pro" },
  { name: "Shopify", logo: "/connectors/shopify.svg", plan: "Pro" },
  { name: "LinkedIn Ads", logo: "/connectors/linkedin.svg", plan: "Pro" },
  { name: "TikTok Ads", logo: "/connectors/tiktok.svg", plan: "Pro" },
];

const plans = [
  {
    name: "Free",
    price: "$0",
    note: "Forever free",
    description: "Try EasyFetcher with Google Search Console.",
    features: ["Google Search Console", "1 workspace", "1 site", "1,000 MCP calls/month", "3 prompt templates"],
    cta: "Get started free",
    highlight: false,
  },
  {
    name: "Starter",
    price: "$7",
    note: "/month",
    description: "For solo marketers managing one brand.",
    features: ["GSC + GA4 + Google My Business", "1 workspace", "Up to 5 sites", "10,000 MCP calls/month", "Full prompt library"],
    cta: "Start for $7/mo",
    highlight: false,
  },
  {
    name: "Pro",
    price: "$27",
    note: "/month",
    description: "For freelancers managing a few clients.",
    features: ["All 10+ connectors", "3 workspaces", "Unlimited sites", "50,000 MCP calls/month", "Priority support"],
    cta: "Start Pro",
    highlight: true,
  },
  {
    name: "Agency",
    price: "$67",
    note: "/month",
    description: "For agencies managing 15+ clients.",
    features: ["All 10+ connectors", "15 workspaces", "Unlimited sites", "200,000 MCP calls/month", "Dedicated Slack support"],
    cta: "Start Agency",
    highlight: false,
  },
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
  return (
    <div className="min-h-screen bg-white text-gray-900">
      {/* Nav */}
      <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-amber-500" />
            <span className="font-bold text-lg text-gray-900">EasyFetcher</span>
          </div>
          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-gray-600">
            <a href="#features" className="hover:text-gray-900 transition-colors">Features</a>
            <a href="#connectors" className="hover:text-gray-900 transition-colors">Connectors</a>
            <a href="#pricing" className="hover:text-gray-900 transition-colors">Pricing</a>
          </div>
          <div className="flex items-center gap-3">
            <Link href={`${APP_URL}/login`} className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors">
              Sign in
            </Link>
            <Link
              href={`${APP_URL}/signup`}
              className="px-4 py-2 rounded-lg bg-amber-500 text-white text-sm font-semibold hover:bg-amber-600 transition-colors"
            >
              Get started free
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="pt-24 pb-20 px-6 text-center bg-gradient-to-b from-amber-50/60 to-white">
        <div className="max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-100 text-amber-700 text-xs font-semibold mb-6">
            <Zap className="w-3 h-3" />
            Powered by Claude AI + Model Context Protocol
          </div>
          <h1 className="text-5xl md:text-6xl font-extrabold text-gray-900 leading-tight mb-6">
            Your marketing data,<br />
            <span className="text-amber-500">answered by AI</span>
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-10 leading-relaxed">
            Connect Google Search Console, GA4, Meta Ads, Shopify and 10+ more platforms to Claude AI.
            Ask questions. Get instant insights. No code required.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href={`${APP_URL}/signup`}
              className="flex items-center gap-2 px-8 py-4 rounded-xl bg-amber-500 text-white font-bold text-base hover:bg-amber-600 transition-colors shadow-lg shadow-amber-200"
            >
              Start for free <ArrowRight className="w-4 h-4" />
            </Link>
            <a
              href="#features"
              className="flex items-center gap-2 px-8 py-4 rounded-xl border border-gray-200 text-gray-700 font-semibold text-base hover:bg-gray-50 transition-colors"
            >
              See how it works
            </a>
          </div>
          <p className="text-sm text-gray-400 mt-4">Free plan available · No credit card required</p>
        </div>

        {/* Hero visual */}
        <div className="max-w-3xl mx-auto mt-16">
          <div className="rounded-2xl border border-gray-200 bg-white shadow-2xl shadow-gray-100 overflow-hidden">
            <div className="flex items-center gap-1.5 px-4 py-3 bg-gray-50 border-b border-gray-100">
              <div className="w-3 h-3 rounded-full bg-red-400" />
              <div className="w-3 h-3 rounded-full bg-yellow-400" />
              <div className="w-3 h-3 rounded-full bg-green-400" />
              <span className="ml-2 text-xs text-gray-400 font-mono">Claude Desktop — EasyFetcher MCP</span>
            </div>
            <div className="p-6 text-left space-y-4">
              <div className="flex gap-3">
                <div className="w-7 h-7 rounded-full bg-gray-100 flex items-center justify-center shrink-0 text-xs font-bold text-gray-500">U</div>
                <div className="bg-gray-100 rounded-xl rounded-tl-none px-4 py-3 text-sm text-gray-700 max-w-sm">
                  What are my top 10 landing pages by clicks in the last 30 days?
                </div>
              </div>
              <div className="flex gap-3 flex-row-reverse">
                <div className="w-7 h-7 rounded-full bg-amber-500 flex items-center justify-center shrink-0">
                  <Zap className="w-3.5 h-3.5 text-white" />
                </div>
                <div className="bg-amber-50 border border-amber-100 rounded-xl rounded-tr-none px-4 py-3 text-sm text-gray-700 max-w-sm">
                  <p className="font-medium text-amber-700 mb-2">Fetching from Google Search Console…</p>
                  <p className="text-gray-600">Here are your top 10 landing pages by clicks (last 30 days):</p>
                  <ol className="mt-2 space-y-1 text-xs text-gray-600">
                    <li>1. /blog/seo-tips — 4,821 clicks</li>
                    <li>2. / (homepage) — 3,204 clicks</li>
                    <li>3. /pricing — 1,893 clicks</li>
                    <li className="text-gray-400">…and 7 more</li>
                  </ol>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-24 px-6 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Everything you need to query your data with AI</h2>
            <p className="text-lg text-gray-500 max-w-2xl mx-auto">
              EasyFetcher bridges your marketing platforms and AI tools in minutes, not months.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {features.map((f) => {
              const Icon = f.icon;
              return (
                <div key={f.title} className="flex gap-5 p-6 rounded-2xl border border-gray-100 hover:border-amber-200 hover:shadow-md transition-all">
                  <div className="w-12 h-12 rounded-xl bg-amber-50 flex items-center justify-center shrink-0">
                    <Icon className="w-6 h-6 text-amber-500" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-900 mb-2">{f.title}</h3>
                    <p className="text-gray-500 leading-relaxed">{f.description}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-24 px-6 bg-gray-50">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">Up and running in 3 steps</h2>
          <p className="text-lg text-gray-500 mb-16">No technical setup. No API keys to manage. No code.</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { step: "1", title: "Connect your data", desc: "Click Connect on any platform — Google, Meta, Shopify. OAuth handles everything." },
              { step: "2", title: "Add to Claude", desc: "Copy one config snippet into Claude Desktop. Takes 30 seconds." },
              { step: "3", title: "Ask anything", desc: "Ask Claude about your campaigns, rankings, revenue — get real answers from live data." },
            ].map((s) => (
              <div key={s.step} className="relative">
                <div className="w-12 h-12 rounded-full bg-amber-500 text-white font-bold text-xl flex items-center justify-center mx-auto mb-4">
                  {s.step}
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">{s.title}</h3>
                <p className="text-gray-500">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Connectors */}
      <section id="connectors" className="py-24 px-6 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Connect your entire marketing stack</h2>
            <p className="text-lg text-gray-500">More connectors added every month.</p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {connectors.map((c) => (
              <div key={c.name} className="flex flex-col items-center gap-3 p-5 rounded-2xl border border-gray-100 hover:border-amber-200 hover:shadow-sm transition-all">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={c.logo} alt={c.name} className="w-10 h-10 object-contain" />
                <span className="text-xs font-medium text-gray-700 text-center leading-tight">{c.name}</span>
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${
                  c.plan === "Free" ? "bg-green-100 text-green-700"
                  : c.plan === "Starter" ? "bg-blue-100 text-blue-700"
                  : "bg-amber-100 text-amber-700"
                }`}>
                  {c.plan}
                </span>
              </div>
            ))}
            <div className="flex flex-col items-center justify-center gap-2 p-5 rounded-2xl border border-dashed border-gray-200 text-gray-400">
              <span className="text-2xl font-bold">+</span>
              <span className="text-xs text-center">More coming soon</span>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-24 px-6 bg-amber-50">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-bold text-gray-900 text-center mb-16">Loved by marketers</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((t) => (
              <div key={t.name} className="bg-white rounded-2xl p-6 shadow-sm border border-amber-100">
                <div className="flex gap-0.5 mb-4">
                  {Array.from({ length: t.stars }).map((_, i) => (
                    <Star key={i} className="w-4 h-4 text-amber-400 fill-amber-400" />
                  ))}
                </div>
                <p className="text-gray-700 mb-5 leading-relaxed">&ldquo;{t.quote}&rdquo;</p>
                <div>
                  <p className="font-semibold text-gray-900 text-sm">{t.name}</p>
                  <p className="text-gray-500 text-xs">{t.role}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-24 px-6 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Simple, transparent pricing</h2>
            <p className="text-lg text-gray-500">Start free. Upgrade when you need more.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {plans.map((plan) => (
              <div
                key={plan.name}
                className={`relative rounded-2xl p-6 flex flex-col gap-5 ${
                  plan.highlight
                    ? "bg-amber-500 text-white shadow-xl shadow-amber-200 scale-105"
                    : "border border-gray-200 bg-white"
                }`}
              >
                {plan.highlight && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-gray-900 text-white text-[10px] font-bold whitespace-nowrap">
                    Most popular
                  </div>
                )}
                <div>
                  <h3 className={`font-bold text-lg mb-1 ${plan.highlight ? "text-white" : "text-gray-900"}`}>{plan.name}</h3>
                  <div className="flex items-end gap-1 mb-1">
                    <span className={`text-3xl font-extrabold ${plan.highlight ? "text-white" : "text-gray-900"}`}>{plan.price}</span>
                    <span className={`text-sm mb-1 ${plan.highlight ? "text-amber-100" : "text-gray-400"}`}>{plan.note}</span>
                  </div>
                  <p className={`text-sm ${plan.highlight ? "text-amber-100" : "text-gray-500"}`}>{plan.description}</p>
                </div>
                <ul className="space-y-2 flex-1">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-start gap-2 text-sm">
                      <Check className={`w-4 h-4 shrink-0 mt-0.5 ${plan.highlight ? "text-amber-100" : "text-amber-500"}`} />
                      <span className={plan.highlight ? "text-amber-50" : "text-gray-600"}>{f}</span>
                    </li>
                  ))}
                </ul>
                <Link
                  href={`${APP_URL}/signup`}
                  className={`w-full py-3 rounded-xl text-sm font-bold text-center transition-colors ${
                    plan.highlight
                      ? "bg-white text-amber-600 hover:bg-amber-50"
                      : "bg-amber-500 text-white hover:bg-amber-600"
                  }`}
                >
                  {plan.cta}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-6 bg-gray-900 text-white text-center">
        <div className="max-w-3xl mx-auto">
          <Zap className="w-10 h-10 text-amber-400 mx-auto mb-6" />
          <h2 className="text-4xl font-bold mb-4">Start querying your data with AI today</h2>
          <p className="text-gray-400 text-lg mb-10">
            Free forever on Google Search Console. No credit card required.
          </p>
          <Link
            href={`${APP_URL}/signup`}
            className="inline-flex items-center gap-2 px-10 py-4 rounded-xl bg-amber-500 text-white font-bold text-lg hover:bg-amber-600 transition-colors"
          >
            Get started free <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-10 px-6 bg-gray-950 text-gray-500 text-sm">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-amber-400" />
            <span className="text-gray-300 font-semibold">EasyFetcher</span>
          </div>
          <p>© {new Date().getFullYear()} EasyFetcher. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <a href="#" className="hover:text-gray-300 transition-colors">Privacy</a>
            <a href="#" className="hover:text-gray-300 transition-colors">Terms</a>
            <Link href={`${APP_URL}/login`} className="hover:text-gray-300 transition-colors">Sign in</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
