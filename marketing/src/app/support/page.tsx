import Link from "next/link";
import { ArrowRight, Mail, PlugZap, KeyRound, ShieldCheck } from "lucide-react";
import SiteNav from "@/components/SiteNav";
import SiteFooter from "@/components/SiteFooter";
import { SIGNUP_URL } from "@/lib/constants";

const SITE = "https://www.easyfetcher.com";
const SUPPORT_EMAIL = "support@easyfetcher.com";

export const metadata = {
  title: "Support — EasyFetcher",
  description:
    "Get help with EasyFetcher: connect your Google data, add the MCP server to Claude or ChatGPT, and reach our team at support@easyfetcher.com.",
  alternates: { canonical: `${SITE}/support` },
};

const breadcrumb = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    { "@type": "ListItem", position: 1, name: "Home", item: SITE },
    { "@type": "ListItem", position: 2, name: "Support", item: `${SITE}/support` },
  ],
};

// Kept in sync with the FAQ copy elsewhere on the site so the ContactPage /
// FAQ answers stay consistent.
const TOPICS = [
  {
    icon: PlugZap,
    title: "Connecting your data",
    body: "Sign in with Google and choose the Search Console and GA4 properties you want to share. Access is read-only and nothing is written back to your accounts. Setup takes about two minutes — no API keys.",
  },
  {
    icon: KeyRound,
    title: "Adding EasyFetcher to Claude or ChatGPT",
    body: "Copy your connector URL from the dashboard and paste it into your AI client's connector settings. Claude and ChatGPT both connect over the Model Context Protocol (MCP) — no install, no extension.",
  },
  {
    icon: ShieldCheck,
    title: "Security & revoking access",
    body: "Connections are read-only and tokens are encrypted at rest with AES-256. You can revoke access any time from your EasyFetcher dashboard or directly in your Google account, and your data is never used to train AI models.",
  },
];

const FAQS = [
  {
    q: "How do I get started?",
    a: "Create a free account, connect your Google data, and paste your MCP connector URL into Claude or ChatGPT. From there, just ask in plain language — for example, “Audit easyfetcher.com and show me the top 5 fixes.”",
  },
  {
    q: "Which data sources are supported?",
    a: "Google Search Console, Google Analytics 4, PageSpeed Insights, Google Business Profile, Bing Webmaster Tools, and live SERP rank checking. More sources are added over time.",
  },
  {
    q: "How fast will I hear back?",
    a: "We aim to reply to every support email within one business day. Including your account email and a short description of what you were doing helps us resolve things faster.",
  },
  {
    q: "How do I delete my account and data?",
    a: "You can revoke access and delete your account from your dashboard at any time. On deletion, all stored OAuth tokens, settings and personal data are permanently removed from our active databases.",
  },
];

export default function SupportPage() {
  return (
    <>
      <div className="min-h-screen bg-white text-gray-900" style={{ fontFamily: "'Inter', system-ui, sans-serif" }}>
        <SiteNav />

        {/* Header */}
        <section
          className="pt-20 pb-12 px-4 sm:px-6 text-center border-b border-gray-100"
          style={{ background: "linear-gradient(180deg, #fffbeb 0%, #ffffff 100%)" }}
        >
          <div className="max-w-3xl mx-auto">
            <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 tracking-tight mb-3">
              Support
            </h1>
            <p className="text-base text-gray-500 leading-relaxed">
              Help connecting your data and running EasyFetcher inside Claude and ChatGPT.
              Can&apos;t find what you need? Email us — a real person will reply.
            </p>
          </div>
        </section>

        {/* Contact card */}
        <section className="px-4 sm:px-6 -mt-0 pt-12">
          <div className="max-w-3xl mx-auto">
            <div className="rounded-2xl border border-amber-100 bg-amber-50/50 p-6 sm:p-7 flex flex-col sm:flex-row sm:items-center gap-5">
              <span className="inline-flex w-12 h-12 shrink-0 rounded-xl bg-white border border-amber-100 items-center justify-center text-amber-600">
                <Mail className="w-5 h-5" />
              </span>
              <div className="flex-1">
                <p className="text-sm font-bold text-gray-900 mb-1">Email support</p>
                <p className="text-sm text-gray-600 leading-relaxed">
                  Reach us at{" "}
                  <a href={`mailto:${SUPPORT_EMAIL}`} className="text-amber-600 font-semibold hover:underline">
                    {SUPPORT_EMAIL}
                  </a>
                  . We reply within one business day.
                </p>
              </div>
              <a
                href={`mailto:${SUPPORT_EMAIL}`}
                className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-[#0e1b2f] text-white font-bold text-sm hover:bg-[#1c3050] transition-all shadow-sm"
              >
                Contact us <ArrowRight className="w-4 h-4" />
              </a>
            </div>
          </div>
        </section>

        {/* Common topics */}
        <section className="py-14 px-4 sm:px-6">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Common topics</h2>
            <div className="grid grid-cols-1 gap-4">
              {TOPICS.map((t) => {
                const Icon = t.icon;
                return (
                  <div key={t.title} className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
                    <div className="flex items-start gap-4">
                      <span className="inline-flex w-10 h-10 shrink-0 rounded-xl bg-amber-50 text-amber-600 items-center justify-center">
                        <Icon className="w-5 h-5" />
                      </span>
                      <div>
                        <h3 className="text-base font-bold text-gray-900 mb-1.5">{t.title}</h3>
                        <p className="text-sm text-gray-600 leading-relaxed">{t.body}</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className="pb-16 px-4 sm:px-6">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Frequently asked</h2>
            <div className="divide-y divide-gray-100 border border-gray-100 rounded-2xl overflow-hidden">
              {FAQS.map((f) => (
                <div key={f.q} className="p-6 bg-white">
                  <h3 className="text-sm sm:text-base font-semibold text-gray-900 mb-2">{f.q}</h3>
                  <p className="text-sm text-gray-600 leading-relaxed">{f.a}</p>
                </div>
              ))}
            </div>

            <div className="mt-8 text-center">
              <p className="text-sm text-gray-500 mb-4">Ready to try it?</p>
              <Link
                href={SIGNUP_URL}
                className="inline-flex items-center justify-center gap-2 px-7 py-3 rounded-xl bg-[#0e1b2f] text-white font-bold text-sm hover:bg-[#1c3050] transition-all shadow-sm"
              >
                Get Started Free <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </section>

        <SiteFooter />
      </div>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumb) }} />
    </>
  );
}
