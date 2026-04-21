import { Zap, BarChart2, Globe, Shield, ArrowRight, Check, Star, TrendingUp, Users, Clock } from "lucide-react";
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

const stats = [
  { icon: Users, value: "5,000+", label: "Marketers using EasyFetcher" },
  { icon: TrendingUp, value: "10+", label: "Platform integrations" },
  { icon: Clock, value: "30 sec", label: "Average setup time" },
  { icon: Zap, value: "99.9%", label: "Uptime SLA" },
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
    <div className="min-h-screen bg-white text-gray-900" style={{ fontFamily: "'Inter', system-ui, sans-serif" }}>

      {/* Nav */}
      <nav className="sticky top-0 z-50 bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-500 flex items-center justify-center">
              <Zap className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-lg text-gray-900 tracking-tight">EasyFetcher</span>
          </div>

          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-gray-600">
            <a href="#features" className="hover:text-amber-500 transition-colors">Features</a>
            <a href="#connectors" className="hover:text-amber-500 transition-colors">Integrations</a>
            <a href="#pricing" className="hover:text-amber-500 transition-colors">Pricing</a>
            <a href="#testimonials" className="hover:text-amber-500 transition-colors">Customers</a>
          </div>

          <div className="flex items-center gap-3">
            <Link href={`${APP_URL}/login`} className="text-sm font-medium text-gray-700 hover:text-amber-500 transition-colors px-4 py-2">
              Sign in
            </Link>
            <Link
              href={`${APP_URL}/signup`}
              className="px-5 py-2.5 rounded-lg bg-amber-500 text-gray-900 text-sm font-semibold hover:bg-amber-600 transition-colors shadow-sm"
            >
              Get started free
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="pt-20 pb-24 px-6" style={{ background: "linear-gradient(180deg, #fffbeb 0%, #ffffff 100%)" }}>
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-amber-200 bg-amber-50 text-amber-600 text-xs font-semibold mb-8">
            <Zap className="w-3.5 h-3.5" />
            Powered by Claude AI · Model Context Protocol
          </div>

          <h1 className="text-5xl md:text-6xl font-extrabold text-gray-900 leading-[1.1] tracking-tight mb-6">
            Your marketing data,<br />
            <span className="text-amber-500">answered instantly by AI</span>
          </h1>

          <p className="text-xl text-gray-500 max-w-2xl mx-auto mb-10 leading-relaxed font-normal">
            Connect Google Search Console, GA4, Meta Ads, Shopify and 10+ platforms to Claude AI.
            Ask questions in plain English. Get real answers from your live data.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-6">
            <Link
              href={`${APP_URL}/signup`}
              className="flex items-center gap-2 px-8 py-3.5 rounded-lg bg-amber-500 text-gray-900 font-semibold text-base hover:bg-amber-600 transition-colors shadow-md shadow-amber-100"
            >
              Start for free <ArrowRight className="w-4 h-4" />
            </Link>
            <a
              href="#features"
              className="flex items-center gap-2 px-8 py-3.5 rounded-lg border border-gray-200 bg-white text-gray-700 font-semibold text-base hover:border-gray-300 hover:shadow-sm transition-all"
            >
              See how it works
            </a>
          </div>
          <p className="text-sm text-gray-400">No credit card required · Free plan available</p>
        </div>

        {/* Hero mockup */}
        <div className="max-w-3xl mx-auto mt-16">
          <div className="rounded-2xl border border-gray-200 bg-white shadow-2xl shadow-gray-100/80 overflow-hidden">
            <div className="flex items-center gap-2 px-5 py-3.5 bg-gray-50 border-b border-gray-100">
              <div className="flex gap-1.5">
                <div className="w-3 h-3 rounded-full bg-red-400" />
                <div className="w-3 h-3 rounded-full bg-yellow-400" />
                <div className="w-3 h-3 rounded-full bg-green-400" />
              </div>
              <span className="ml-2 text-xs text-gray-400 font-mono">Claude Desktop — EasyFetcher MCP</span>
            </div>
            <div className="p-6 space-y-5 bg-white">
              <div className="flex gap-3 items-start">
                <div className="w-7 h-7 rounded-full bg-gray-200 flex items-center justify-center shrink-0 text-xs font-bold text-gray-500">U</div>
                <div className="bg-gray-100 rounded-2xl rounded-tl-none px-4 py-3 text-sm text-gray-700 max-w-sm leading-relaxed">
                  What are my top 10 landing pages by clicks in the last 30 days?
                </div>
              </div>
              <div className="flex gap-3 items-start flex-row-reverse">
                <div className="w-7 h-7 rounded-full bg-amber-500 flex items-center justify-center shrink-0">
                  <Zap className="w-3.5 h-3.5 text-white" />
                </div>
                <div className="bg-amber-50 border border-amber-100 rounded-2xl rounded-tr-none px-4 py-3 text-sm text-gray-700 max-w-sm">
                  <p className="font-semibold text-amber-600 mb-2 text-xs uppercase tracking-wide">Fetching from Google Search Console</p>
                  <p className="text-gray-600 mb-2">Here are your top 10 landing pages by clicks (last 30 days):</p>
                  <ol className="space-y-1 text-xs text-gray-600 font-mono">
                    <li className="flex justify-between"><span>1. /blog/seo-tips</span><span className="font-semibold text-gray-800">4,821</span></li>
                    <li className="flex justify-between"><span>2. / (homepage)</span><span className="font-semibold text-gray-800">3,204</span></li>
                    <li className="flex justify-between"><span>3. /pricing</span><span className="font-semibold text-gray-800">1,893</span></li>
                    <li className="text-gray-400">… and 7 more results</li>
                  </ol>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-16 px-6 border-y border-gray-100 bg-white">
        <div className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((s) => {
            const Icon = s.icon;
            return (
              <div key={s.label} className="text-center">
                <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center mx-auto mb-3">
                  <Icon className="w-5 h-5 text-amber-500" />
                </div>
                <p className="text-3xl font-extrabold text-gray-900 tracking-tight">{s.value}</p>
                <p className="text-sm text-gray-500 mt-1">{s.label}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-24 px-6 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-sm font-semibold text-amber-500 uppercase tracking-wider mb-3">Features</p>
            <h2 className="text-4xl font-extrabold text-gray-900 tracking-tight mb-4">
              Everything you need to query<br />your marketing data with AI
            </h2>
            <p className="text-lg text-gray-500 max-w-2xl mx-auto">
              EasyFetcher bridges your marketing platforms and AI tools in minutes, not months.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {features.map((f) => {
              const Icon = f.icon;
              return (
                <div key={f.title} className="group flex gap-5 p-7 rounded-2xl border border-gray-100 hover:border-amber-100 hover:shadow-lg hover:shadow-blue-50/50 transition-all bg-white">
                  <div className="w-12 h-12 rounded-xl bg-amber-50 group-hover:bg-amber-100 flex items-center justify-center shrink-0 transition-colors">
                    <Icon className="w-6 h-6 text-amber-500" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-900 mb-2 tracking-tight">{f.title}</h3>
                    <p className="text-gray-500 leading-relaxed text-sm">{f.description}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-24 px-6" style={{ background: "#fffbeb" }}>
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-sm font-semibold text-amber-500 uppercase tracking-wider mb-3">How it works</p>
            <h2 className="text-4xl font-extrabold text-gray-900 tracking-tight mb-4">Up and running in 3 steps</h2>
            <p className="text-lg text-gray-500">No technical setup. No API keys to manage. No code.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
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
              <div key={s.step} className="relative bg-white rounded-2xl p-7 border border-gray-100 shadow-sm">
                {i < 2 && (
                  <div className="hidden md:block absolute top-10 -right-4 w-8 h-px bg-gray-200 z-10" />
                )}
                <div className="text-4xl font-black text-amber-100 mb-4 tracking-tighter">{s.step}</div>
                <h3 className="text-lg font-bold text-gray-900 mb-2 tracking-tight">{s.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Connectors */}
      <section id="connectors" className="py-24 px-6 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-sm font-semibold text-amber-500 uppercase tracking-wider mb-3">Integrations</p>
            <h2 className="text-4xl font-extrabold text-gray-900 tracking-tight mb-4">
              Connect your entire marketing stack
            </h2>
            <p className="text-lg text-gray-500">More connectors added every month.</p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {connectors.map((c) => (
              <div key={c.name} className="group flex flex-col items-center gap-3 p-5 rounded-2xl border border-gray-100 hover:border-amber-200 hover:shadow-md hover:shadow-blue-50/50 transition-all bg-white cursor-default">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={c.logo} alt={c.name} className="w-10 h-10 object-contain" />
                <span className="text-xs font-semibold text-gray-700 text-center leading-tight">{c.name}</span>
                <span className={`text-[10px] px-2.5 py-1 rounded-full font-semibold tracking-wide ${
                  c.plan === "Free"
                    ? "bg-green-50 text-green-700 border border-green-100"
                    : c.plan === "Starter"
                    ? "bg-amber-50 text-amber-600 border border-amber-100"
                    : "bg-violet-50 text-violet-700 border border-violet-100"
                }`}>
                  {c.plan}
                </span>
              </div>
            ))}
            <div className="flex flex-col items-center justify-center gap-2 p-5 rounded-2xl border border-dashed border-gray-200 text-gray-300">
              <span className="text-3xl font-bold">+</span>
              <span className="text-xs text-center font-medium">More soon</span>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonials" className="py-24 px-6" style={{ background: "#fffbeb" }}>
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-sm font-semibold text-amber-500 uppercase tracking-wider mb-3">Customers</p>
            <h2 className="text-4xl font-extrabold text-gray-900 tracking-tight">Loved by marketers worldwide</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {testimonials.map((t) => (
              <div key={t.name} className="bg-white rounded-2xl p-7 border border-gray-100 shadow-sm flex flex-col gap-5">
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
      <section id="pricing" className="py-24 px-6 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-sm font-semibold text-amber-500 uppercase tracking-wider mb-3">Pricing</p>
            <h2 className="text-4xl font-extrabold text-gray-900 tracking-tight mb-4">Simple, transparent pricing</h2>
            <p className="text-lg text-gray-500">Start free. Upgrade when you need more. No surprises.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 items-start">
            {plans.map((plan) => (
              <div
                key={plan.name}
                className={`relative rounded-2xl p-7 flex flex-col gap-6 ${
                  plan.highlight
                    ? "bg-amber-500 text-gray-900 shadow-2xl shadow-amber-200 ring-2 ring-amber-500 scale-[1.03]"
                    : "border border-gray-200 bg-white hover:shadow-md transition-shadow"
                }`}
              >
                {plan.highlight && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-amber-400 text-gray-900 text-[11px] font-bold whitespace-nowrap tracking-wide">
                    MOST POPULAR
                  </div>
                )}

                <div>
                  <p className={`text-xs font-bold uppercase tracking-widest mb-3 ${plan.highlight ? "text-amber-200" : "text-amber-500"}`}>
                    {plan.name}
                  </p>
                  <div className="flex items-end gap-1 mb-2">
                    <span className={`text-4xl font-black tracking-tighter ${plan.highlight ? "text-white" : "text-gray-900"}`}>
                      {plan.price}
                    </span>
                    <span className={`text-sm mb-1.5 ${plan.highlight ? "text-amber-200" : "text-gray-400"}`}>{plan.note}</span>
                  </div>
                  <p className={`text-sm leading-relaxed ${plan.highlight ? "text-amber-100" : "text-gray-500"}`}>
                    {plan.description}
                  </p>
                </div>

                <ul className="space-y-2.5 flex-1">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-start gap-2.5 text-sm">
                      <div className={`w-4 h-4 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${plan.highlight ? "bg-amber-400" : "bg-amber-50"}`}>
                        <Check className={`w-2.5 h-2.5 ${plan.highlight ? "text-white" : "text-amber-500"}`} />
                      </div>
                      <span className={plan.highlight ? "text-amber-50" : "text-gray-600"}>{f}</span>
                    </li>
                  ))}
                </ul>

                <Link
                  href={`${APP_URL}/signup`}
                  className={`w-full py-3 rounded-xl text-sm font-bold text-center transition-all ${
                    plan.highlight
                      ? "bg-white text-amber-600 hover:bg-amber-50"
                      : "bg-amber-500 text-gray-900 hover:bg-amber-600"
                  }`}
                >
                  {plan.cta}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Banner */}
      <section className="py-24 px-6 bg-gray-950">
        <div className="max-w-3xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-semibold mb-8">
            <Zap className="w-3.5 h-3.5" />
            Get started in 30 seconds
          </div>
          <h2 className="text-4xl md:text-5xl font-extrabold text-white tracking-tight mb-5">
            Start querying your data<br />with AI today
          </h2>
          <p className="text-gray-400 text-lg mb-10 leading-relaxed">
            Free forever on Google Search Console. No credit card required.
          </p>
          <Link
            href={`${APP_URL}/signup`}
            className="inline-flex items-center gap-2 px-10 py-4 rounded-xl bg-amber-500 text-gray-900 font-bold text-base hover:bg-amber-400 transition-colors shadow-lg shadow-amber-500/20"
          >
            Get started free <ArrowRight className="w-4 h-4" />
          </Link>
          <p className="text-gray-600 text-sm mt-5">No credit card · Cancel anytime</p>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-6 bg-gray-900">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row items-start justify-between gap-8 mb-10">
            <div>
              <div className="flex items-center gap-2.5 mb-3">
                <div className="w-7 h-7 rounded-lg bg-amber-500 flex items-center justify-center">
                  <Zap className="w-3.5 h-3.5 text-white" />
                </div>
                <span className="font-bold text-white tracking-tight">EasyFetcher</span>
              </div>
              <p className="text-gray-400 text-sm max-w-xs leading-relaxed">
                Connect your marketing data to Claude AI via the Model Context Protocol.
              </p>
            </div>

            <div className="flex gap-16">
              <div>
                <p className="text-white font-semibold text-sm mb-4">Product</p>
                <ul className="space-y-2.5 text-sm text-gray-400">
                  <li><a href="#features" className="hover:text-white transition-colors">Features</a></li>
                  <li><a href="#connectors" className="hover:text-white transition-colors">Integrations</a></li>
                  <li><a href="#pricing" className="hover:text-white transition-colors">Pricing</a></li>
                </ul>
              </div>
              <div>
                <p className="text-white font-semibold text-sm mb-4">Company</p>
                <ul className="space-y-2.5 text-sm text-gray-400">
                  <li><a href="#" className="hover:text-white transition-colors">Privacy Policy</a></li>
                  <li><a href="#" className="hover:text-white transition-colors">Terms of Service</a></li>
                  <li><Link href={`${APP_URL}/login`} className="hover:text-white transition-colors">Sign in</Link></li>
                </ul>
              </div>
            </div>
          </div>

          <div className="pt-8 border-t border-gray-800 flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-gray-500 text-sm">© {new Date().getFullYear()} EasyFetcher. All rights reserved.</p>
            <Link
              href={`${APP_URL}/signup`}
              className="px-5 py-2.5 rounded-lg bg-amber-500 text-gray-900 text-sm font-semibold hover:bg-amber-600 transition-colors"
            >
              Get started free →
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
