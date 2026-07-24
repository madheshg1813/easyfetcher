import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  ShieldCheck,
  Zap,
  BarChart3,
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
const URL = `${SITE}/integrations/google-analytics`;

export const metadata: Metadata = {
  title: "Connect Google Analytics to AI with MCP | Easy Fetcher",
  description:
    "Connect your GA4 property to any MCP-compatible AI — Claude, ChatGPT, Perplexity, Cursor, Gemini CLI and more. Ask for traffic and SEO reports in plain language.",
  alternates: { canonical: URL },
  openGraph: {
    title: "Connect Google Analytics to AI with MCP Server",
    description:
      "Give any MCP-compatible AI secure, read-only access to your GA4 data and analyze traffic with natural language.",
    url: URL,
    type: "website",
  },
};

const SKILLS: McpSkill[] = [
  { id: "ai-traffic-report", name: "AI Traffic Report", body: "See which AI assistants send you traffic — sessions, users and signups per source, from GA4.", href: "/skills/ai-traffic-report" },
  { id: "seo-report-generator", name: "SEO Report Generator", body: "A complete, narrated SEO report from your Search Console + GA4 data in a single prompt.", href: "/skills/seo-report-generator" },
];

const PROMPTS = [
  "Analyze my organic traffic for the last 90 days",
  "Find the pages that are losing traffic month over month",
  "Compare this month vs last month by channel",
  "Show me sessions coming from AI assistants",
  "Which landing pages drive the most conversions?",
  "Create an executive SEO report I can send a client",
];

const FEATURES = [
  { icon: ShieldCheck, title: "Secure OAuth", body: "Read-only Google sign-in. Tokens are encrypted; nothing is ever written back to your account." },
  { icon: Zap, title: "Real-time data", body: "Every answer is pulled live from the GA4 API when you ask — never a stale cached copy." },
  { icon: BarChart3, title: "GA4 reports", body: "Sessions, users, events, conversions, landing pages and channels — the full GA4 surface." },
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
  { q: "What is a Google Analytics MCP?", a: "A Google Analytics MCP is a connector built on the Model Context Protocol (MCP) that gives an AI assistant secure, read-only access to your GA4 data. Instead of guessing, tools like Claude, ChatGPT and Cursor can read your real sessions, users and conversions and answer questions about them. Easy Fetcher hosts the MCP server for you, so there's nothing to install or maintain." },
  { q: "How do I connect Google Analytics to AI with an MCP server?", a: "Create a free Easy Fetcher account, copy your Google Analytics MCP URL, and paste it into your AI tool's connector settings. Then sign in with Google and choose the GA4 property you want to read. The whole setup takes under two minutes — no API keys and no code." },
  { q: "Which AI platforms support the Google Analytics MCP?", a: "Any MCP-compatible client. That includes Claude, Claude Code, ChatGPT, Codex, Perplexity, Cursor and Gemini CLI, plus other tools that support the Model Context Protocol. You connect once with Easy Fetcher and use the same server across all of them." },
  { q: "Why does an AI assistant need an MCP to read GA4?", a: "On their own, AI assistants can't see your analytics, so they invent plausible but wrong numbers. The Google Analytics MCP is the secure bridge: it authenticates with Google on your behalf and returns your actual GA4 figures, so every answer is grounded in your real data." },
  { q: "What GA4 data can the AI access through the MCP?", a: "The Google Analytics MCP can read users, sessions, events, conversions, landing pages and traffic sources from your GA4 property — everything an AI needs to analyze traffic and build reports. Access is read-only, so it can view your data but never change anything in your account." },
  { q: "Is my Google Analytics data safe with the Easy Fetcher MCP?", a: "Yes. The connection is read-only through Google OAuth, tokens are encrypted at rest, and your data is never used to train AI models. You can revoke access at any time from your Easy Fetcher dashboard or directly in your Google account." },
  { q: "Do I need to write code or an API key to use it?", a: "No. There are no API keys to generate and nothing to deploy. You sign in with Google, pick your GA4 property, and paste one connector URL into your AI tool — no developer setup required." },
  { q: "Is the Google Analytics MCP free to use?", a: "Creating an Easy Fetcher account and connecting your GA4 property is free. Running the MCP on your data uses an Easy Fetcher plan, which sets your monthly usage limit and how many properties you can connect — so you can start small and scale up as you need more." },
];

export default function GoogleAnalyticsMcpPage() {
  const faqSchema = { "@context": "https://schema.org", "@type": "FAQPage", mainEntity: FAQS.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })) };
  const breadcrumbSchema = { "@context": "https://schema.org", "@type": "BreadcrumbList", itemListElement: [
    { "@type": "ListItem", position: 1, name: "Easy Fetcher", item: SITE },
    { "@type": "ListItem", position: 2, name: "Integrations", item: `${SITE}/#connectors` },
    { "@type": "ListItem", position: 3, name: "Google Analytics MCP", item: URL },
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
            <img src={IMAGES.connectors.ga4} alt="" width={16} height={16} decoding="async" className="w-4 h-4 object-contain" />
            <span className="text-xs font-semibold text-gray-600">Google Analytics 4</span>
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-[54px] font-extrabold text-gray-900 leading-[1.08] tracking-[-0.02em] mb-5">
            Connect Google Analytics to AI with MCP Server
          </h1>
          <p className="text-base sm:text-lg lg:text-xl text-gray-500 leading-relaxed max-w-2xl mx-auto mb-8">
            Give any MCP-compatible AI secure, read-only access to your GA4 data. Ask about traffic,
            conversions and landing pages in plain language — and get answers from your real numbers,
            not guesses.
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
              ["Connect Google", "Sign in with Google and pick the GA4 property you want to read. Read-only."],
              ["Start chatting", "Ask about traffic, conversions or SEO and get answers from your live data."],
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
        title="GA4 skills that run on this MCP"
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
            <Link href="/integrations/page-speed-insights" className="group flex items-center gap-4 rounded-2xl border border-gray-100/80 bg-white p-5 hover:border-amber-200 hover:shadow-md transition-all">
              <span className="inline-flex w-11 h-11 rounded-xl bg-white border border-gray-100 items-center justify-center">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={IMAGES.connectors.pagespeed} alt="" width={20} height={20} loading="lazy" decoding="async" className="w-5 h-5 object-contain" />
              </span>
              <div className="flex-1">
                <h3 className="text-base font-bold text-gray-900">PageSpeed MCP</h3>
                <p className="text-sm text-gray-500">Core Web Vitals &amp; performance</p>
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
            <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 tracking-tight leading-tight">Google Analytics MCP, answered</h2>
          </div>
          <Faq items={FAQS} twoCol />
        </div>
      </section>

      {/* CTA */}
      <section className="py-14 sm:py-16 px-4 sm:px-6" style={{ background: "linear-gradient(135deg, #171717 0%, #050505 50%, #171717 100%)" }}>
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight leading-tight mb-4">Connect GA4 to your AI in 60 seconds</h2>
          <p className="text-base sm:text-lg text-gray-300/80 leading-relaxed mb-8 max-w-xl mx-auto">Read-only, no code, works with every MCP-compatible AI. Signup today and ask your first question.</p>
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
