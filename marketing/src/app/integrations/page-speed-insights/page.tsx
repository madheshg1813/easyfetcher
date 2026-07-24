import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  ShieldCheck,
  Zap,
  Gauge,
  MessageSquareText,
  Boxes,
  Code2,
  Check,
  X,
} from "lucide-react";
import SiteNav from "@/components/SiteNav";
import SiteFooter from "@/components/SiteFooter";
import Faq, { type Qa } from "@/components/claude-seo/Faq";
import PlatformsRow from "@/components/mcp/PlatformsRow";
import McpSkillCards, { type McpSkill } from "@/components/mcp/McpSkillCards";
import McpUrlBox from "@/components/mcp/McpUrlBox";
import { SIGNUP_URL } from "@/lib/constants";
import { IMAGES } from "@/lib/cloudinary";

const SITE = "https://www.easyfetcher.com";
const URL = `${SITE}/integrations/page-speed-insights`;

export const metadata: Metadata = {
  title: "Connect PageSpeed Insights to AI with MCP | Easy Fetcher",
  description:
    "Connect PageSpeed Insights to any MCP-compatible AI — Claude, ChatGPT, Perplexity, Cursor and more. Analyze Core Web Vitals and performance in plain language.",
  alternates: { canonical: URL },
  openGraph: {
    title: "Connect PageSpeed Insights to AI with MCP Server",
    description:
      "Give any MCP-compatible AI secure access to your PageSpeed Insights data and diagnose Core Web Vitals with natural language.",
    url: URL,
    type: "website",
  },
};

const SKILLS: McpSkill[] = [
  { id: "technical-seo-audit", name: "Technical SEO Audit", body: "Render-blocking resources, redirect chains and Core Web Vitals — the problems crawlers hit but people miss.", href: "/skills/technical-seo-audit" },
  { id: "seo-audit", name: "SEO Audit", body: "A prioritised crawl-and-score pass that folds PageSpeed into an impact-ranked fix list.", href: "/skills/seo-audit" },
];

const PROMPTS = [
  "What's hurting my LCP on the homepage?",
  "Show me my Core Web Vitals for mobile",
  "Which render-blocking resources should I fix first?",
  "What are my biggest performance opportunities?",
  "Compare mobile vs desktop performance",
  "Why is my CLS failing on the pricing page?",
];

const FEATURES = [
  { icon: ShieldCheck, title: "No account needed", body: "PageSpeed runs on any public URL — no login or verification required to start." },
  { icon: Zap, title: "Real-time data", body: "Every answer is pulled live from the PageSpeed Insights API when you ask — fresh field and lab data." },
  { icon: Gauge, title: "Core Web Vitals", body: "LCP, INP and CLS, performance score, opportunities and diagnostics — field (CrUX) and lab data." },
  { icon: MessageSquareText, title: "Custom prompts", body: "Ask in plain language, or use Easy Fetcher's ready-made SEO prompt templates." },
  { icon: Boxes, title: "Any MCP client", body: "One connection works across Claude, ChatGPT, Perplexity, Cursor, Gemini CLI and more." },
  { icon: Code2, title: "No coding", body: "No API keys, no scripts, no developer. Sign in and paste one URL." },
];

const COMPARISON: [string, boolean, boolean][] = [
  ["Ready-made SEO prompts", true, false],
  ["Purpose-built SEO skills", true, false],
  ["Multiple Google tools in one", true, false],
  ["Live SERP crawling & keyword ranks", true, false],
  ["Competitor rank tracking", true, false],
  ["Backlink analysis", true, false],
  ["SEO audit reports", true, false],
  ["AI-written reporting", true, false],
  ["Works with any MCP client", true, false],
];

const FAQS: Qa[] = [
  { q: "What is a PageSpeed Insights MCP?", a: "A PageSpeed Insights MCP is a connector built on the Model Context Protocol (MCP) that lets an AI assistant pull real Core Web Vitals and performance data for any URL. Tools like Claude, ChatGPT and Cursor can then read your LCP, INP, CLS and Lighthouse results and explain exactly what to fix. Easy Fetcher hosts the MCP server for you — there's nothing to install or maintain." },
  { q: "How do I connect PageSpeed Insights to AI with an MCP server?", a: "Create a free Easy Fetcher account, copy your PageSpeed MCP URL, and paste it into your AI tool's connector settings. Then just ask the AI to analyze any URL. Because PageSpeed works on public pages, there's no Google property to verify — setup takes under two minutes." },
  { q: "Which AI platforms support the PageSpeed Insights MCP?", a: "Any MCP-compatible client. That includes Claude, Claude Code, ChatGPT, Codex, Perplexity, Cursor and Gemini CLI, plus other tools that support the Model Context Protocol. You connect once with Easy Fetcher and use the same server across all of them." },
  { q: "What performance data can the AI access?", a: "The MCP returns Core Web Vitals — LCP, INP and CLS — plus the overall performance score, Lighthouse opportunities and diagnostics, for both mobile and desktop. It combines field data (real users, from CrUX) with lab data so the AI can explain what's slow and why." },
  { q: "Can the AI tell me exactly what to fix?", a: "Yes. Instead of a wall of Lighthouse metrics, the AI reads the opportunities and diagnostics and hands you a prioritised, plain-English fix list — for example “defer this render-blocking script” or “properly size the hero image driving your 4.2s LCP.”" },
  { q: "Do I need to verify my site to use the PageSpeed MCP?", a: "No. PageSpeed Insights works on any public URL, so unlike Search Console or GA4 there's no property to verify. You can analyze your own pages or a competitor's the moment you connect." },
  { q: "Do I need to write code or an API key to use it?", a: "No. There are no API keys to generate and nothing to deploy. You create an Easy Fetcher account and paste one connector URL into your AI tool — no developer setup required." },
  { q: "Is the PageSpeed Insights MCP free to use?", a: "Creating an Easy Fetcher account is free. Running the MCP uses an Easy Fetcher plan, which sets your monthly usage limit — so you can start small and scale up as you run more performance checks." },
];

export default function PageSpeedMcpPage() {
  const faqSchema = { "@context": "https://schema.org", "@type": "FAQPage", mainEntity: FAQS.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })) };
  const breadcrumbSchema = { "@context": "https://schema.org", "@type": "BreadcrumbList", itemListElement: [
    { "@type": "ListItem", position: 1, name: "Easy Fetcher", item: SITE },
    { "@type": "ListItem", position: 2, name: "Integrations", item: `${SITE}/#connectors` },
    { "@type": "ListItem", position: 3, name: "PageSpeed Insights MCP", item: URL },
  ] };

  return (
    <>
      <SiteNav />

      {/* HERO */}
      <section
        className="relative overflow-hidden pt-14 sm:pt-20 lg:pt-24 pb-14 px-4 sm:px-6"
        style={{ background: "radial-gradient(900px 420px at 15% -5%, rgba(245,158,11,0.16), transparent 60%), radial-gradient(820px 420px at 88% 8%, rgba(242,140,30,0.13), transparent 60%), linear-gradient(180deg, #fffdf5 0%, #fffbeb 45%, #ffffff 100%)" }}
      >
        <div aria-hidden className="pointer-events-none absolute left-1/2 -top-24 -translate-x-1/2 w-[680px] h-[680px] rounded-full blur-3xl" style={{ background: "radial-gradient(circle, rgba(251,191,36,0.18), transparent 62%)" }} />
        <div className="relative max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white border border-gray-200 mb-5">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={IMAGES.connectors.pagespeed} alt="" width={16} height={16} decoding="async" className="w-4 h-4 object-contain" />
            <span className="text-xs font-semibold text-gray-600">PageSpeed Insights</span>
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-[54px] font-extrabold text-gray-900 leading-[1.08] tracking-[-0.02em] mb-5">
            Connect PageSpeed Insights to AI with MCP Server
          </h1>
          <p className="text-base sm:text-lg lg:text-xl text-gray-500 leading-relaxed max-w-2xl mx-auto mb-8">
            Give any MCP-compatible AI real Core Web Vitals and performance data for any URL. Ask what&apos;s
            slowing your pages down in plain language — and get a prioritised fix list, not a wall of
            Lighthouse metrics.
          </p>
          <div className="flex justify-center">
            <Link href={SIGNUP_URL} className="inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl bg-[#171717] text-white font-bold text-base hover:bg-[#2b2b2b] transition-all shadow-lg shadow-[#171717]/20 hover:-translate-y-px">
              Connect in 60 Seconds <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      <PlatformsRow />

      {/* PROMPTS */}
      <section className="py-14 sm:py-16 px-4 sm:px-6" style={{ background: "linear-gradient(180deg, #fffdf5 0%, #ffffff 100%)" }}>
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <p className="text-sm font-semibold text-amber-500 uppercase tracking-wider mb-3">After you connect</p>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 tracking-tight mb-4 leading-tight">What you can ask your AI</h2>
            <p className="text-base sm:text-lg text-gray-500 max-w-2xl mx-auto">Just type it in plain language — the MCP does the rest.</p>
          </div>
          <div className="grid sm:grid-cols-2 gap-3">
            {PROMPTS.map((p) => (
              <div key={p} className="flex items-center gap-3 rounded-xl border border-gray-100/80 bg-white px-5 py-4 shadow-sm">
                <MessageSquareText className="w-4 h-4 text-amber-500 shrink-0" />
                <span className="text-[15px] text-gray-700 font-medium">&ldquo;{p}&rdquo;</span>
              </div>
            ))}
          </div>
          <div className="mt-10 flex justify-center">
            <Link href={SIGNUP_URL} className="inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl bg-[#171717] text-white font-bold text-base hover:bg-[#2b2b2b] transition-all shadow-lg shadow-[#171717]/20 hover:-translate-y-px">
              Connect in 60 Seconds <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section className="py-14 sm:py-16 px-4 sm:px-6 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <p className="text-sm font-semibold text-amber-500 uppercase tracking-wider mb-3">Features</p>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 tracking-tight leading-tight">Everything the MCP gives you</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {FEATURES.map((f) => {
              const Icon = f.icon;
              return (
                <div key={f.title} className="rounded-2xl border border-gray-100/80 bg-white p-6 shadow-sm">
                  <span className="inline-flex w-11 h-11 rounded-xl bg-amber-50 text-amber-600 items-center justify-center mb-4"><Icon className="w-5 h-5" /></span>
                  <h3 className="text-base font-bold text-gray-900 mb-1.5">{f.title}</h3>
                  <p className="text-sm text-gray-500 leading-relaxed">{f.body}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="py-14 sm:py-16 px-4 sm:px-6" style={{ background: "linear-gradient(180deg, #fffdf5 0%, #fffbeb 100%)" }}>
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <p className="text-sm font-semibold text-amber-500 uppercase tracking-wider mb-3">How it works</p>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 tracking-tight leading-tight">Connected in three steps</h2>
          </div>
          <div className="grid sm:grid-cols-3 gap-5">
            {[
              ["Install the MCP", "Add the Easy Fetcher connector to your AI tool — paste the URL below, no keys."],
              ["Point it at a URL", "No property to verify — PageSpeed works on any public page, yours or a competitor's."],
              ["Start chatting", "Ask what's slowing a page down and get a ranked, plain-English fix list."],
            ].map(([t, b], i) => (
              <div key={t} className="rounded-2xl border border-gray-100/80 bg-white p-6 shadow-sm">
                <span className="inline-flex w-9 h-9 rounded-full bg-[#171717] text-white text-sm font-extrabold items-center justify-center mb-4">{i + 1}</span>
                <h3 className="text-base font-bold text-gray-900 mb-1.5">{t}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{b}</p>
              </div>
            ))}
          </div>
          <McpUrlBox />
          <div className="mt-10 flex justify-center">
            <Link href={SIGNUP_URL} className="inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl bg-[#171717] text-white font-bold text-base hover:bg-[#2b2b2b] transition-all shadow-lg shadow-[#171717]/20 hover:-translate-y-px">
              Connect in 60 Seconds <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      <McpSkillCards
        title="PageSpeed skills that run on this MCP"
        intro="Skip the prompt-writing — download a purpose-built skill and just ask."
        skills={SKILLS}
      />

      {/* WHY EASY FETCHER — comparison */}
      <section className="py-14 sm:py-16 px-4 sm:px-6" style={{ background: "linear-gradient(180deg, #fffdf5 0%, #ffffff 100%)" }}>
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-10">
            <p className="text-sm font-semibold text-amber-500 uppercase tracking-wider mb-3">Why Easy Fetcher</p>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 tracking-tight leading-tight">More than a raw connector</h2>
          </div>
          <div className="overflow-hidden rounded-2xl border border-gray-100/80 shadow-sm bg-white">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50/70">
                  <th className="text-left font-bold text-gray-900 px-5 py-4"></th>
                  <th className="px-5 py-4 font-bold text-amber-600">Easy Fetcher</th>
                  <th className="px-5 py-4 font-semibold text-gray-400">Generic MCP</th>
                </tr>
              </thead>
              <tbody>
                {COMPARISON.map(([label, ef, gen]) => (
                  <tr key={label} className="border-t border-gray-100">
                    <td className="px-5 py-4 text-gray-700 font-medium">{label}</td>
                    <td className="px-5 py-4 text-center">{ef ? <Check className="w-5 h-5 text-green-600 inline" /> : <X className="w-5 h-5 text-gray-300 inline" />}</td>
                    <td className="px-5 py-4 text-center">{gen ? <Check className="w-5 h-5 text-green-600 inline" /> : <X className="w-5 h-5 text-gray-300 inline" />}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* RELATED MCPs */}
      <section className="py-14 sm:py-16 px-4 sm:px-6 bg-gray-50/50 border-y border-gray-100/80">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-lg font-bold text-gray-900 mb-5">Related MCPs</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            <Link href="/integrations/google-search-console" className="group flex items-center gap-4 rounded-2xl border border-gray-100/80 bg-white p-5 hover:border-amber-200 hover:shadow-md transition-all">
              <span className="inline-flex w-11 h-11 rounded-xl bg-white border border-gray-100 items-center justify-center">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={IMAGES.connectors.gsc} alt="" width={20} height={20} loading="lazy" decoding="async" className="w-5 h-5 object-contain" />
              </span>
              <div className="flex-1">
                <h3 className="text-base font-bold text-gray-900">Search Console MCP</h3>
                <p className="text-sm text-gray-500">Clicks, impressions, queries &amp; rankings</p>
              </div>
              <ArrowRight className="w-4 h-4 text-gray-300 group-hover:text-amber-500 group-hover:translate-x-0.5 transition-all" />
            </Link>
            <Link href="/integrations/google-analytics" className="group flex items-center gap-4 rounded-2xl border border-gray-100/80 bg-white p-5 hover:border-amber-200 hover:shadow-md transition-all">
              <span className="inline-flex w-11 h-11 rounded-xl bg-white border border-gray-100 items-center justify-center">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={IMAGES.connectors.ga4} alt="" width={20} height={20} loading="lazy" decoding="async" className="w-5 h-5 object-contain" />
              </span>
              <div className="flex-1">
                <h3 className="text-base font-bold text-gray-900">Google Analytics MCP</h3>
                <p className="text-sm text-gray-500">Sessions, users, conversions &amp; traffic</p>
              </div>
              <ArrowRight className="w-4 h-4 text-gray-300 group-hover:text-amber-500 group-hover:translate-x-0.5 transition-all" />
            </Link>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-14 sm:py-16 px-4 sm:px-6 bg-white">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-10">
            <p className="text-sm font-semibold text-amber-500 uppercase tracking-wider mb-3">Questions</p>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 tracking-tight leading-tight">PageSpeed Insights MCP, answered</h2>
          </div>
          <Faq items={FAQS} twoCol />
        </div>
      </section>

      {/* CTA */}
      <section className="py-14 sm:py-16 px-4 sm:px-6" style={{ background: "linear-gradient(135deg, #171717 0%, #050505 50%, #171717 100%)" }}>
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight leading-tight mb-4">Diagnose Core Web Vitals with your AI</h2>
          <p className="text-base sm:text-lg text-gray-300/80 leading-relaxed mb-8 max-w-xl mx-auto">No verification, no code, works with every MCP-compatible AI. Signup today and analyze your first URL.</p>
          <Link href={SIGNUP_URL} className="inline-flex items-center justify-center gap-2 px-9 py-4 rounded-xl bg-white text-[#171717] font-bold text-base hover:bg-gray-50 transition-all shadow-xl hover:-translate-y-px">
            Connect in 60 Seconds <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      <SiteFooter />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
    </>
  );
}
