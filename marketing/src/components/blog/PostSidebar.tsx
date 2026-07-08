"use client";

import { useState } from "react";
import Link from "next/link";
import { Link2, Check, ArrowRight, ArrowDown, Facebook, Linkedin, Twitter, Mail, ChevronDown, List, Sparkles, Search, ListOrdered, TrendingUp } from "lucide-react";
import { IMAGES } from "@/lib/cloudinary";
import { SIGNUP_URL } from "@/lib/constants";
import type { Heading } from "@/lib/blog";

const ASSISTANT_LOGOS: Record<string, string> = {
  Claude: IMAGES.destinations.claude,
  ChatGPT: IMAGES.destinations.chatgpt,
  Perplexity: IMAGES.destinations.perplexity,
  Gemini: IMAGES.destinations.gemini,
};

export default function PostSidebar({
  headings,
  url,
  title,
  assistant,
}: {
  headings: Heading[];
  url: string;
  title: string;
  assistant: { name: string; connectLabel: string };
}) {
  const brainLogo = ASSISTANT_LOGOS[assistant.name];
  const [tocOpen, setTocOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const enc = encodeURIComponent;
  const summarizePrompt = `Summarize this article for me: ${url}`;
  const q = enc(summarizePrompt);

  const summarize = [
    { label: "ChatGPT", img: IMAGES.destinations.chatgpt, href: `https://chatgpt.com/?q=${q}` },
    { label: "Claude", img: IMAGES.destinations.claude, href: `https://claude.ai/new?q=${q}` },
    { label: "Perplexity", img: IMAGES.destinations.perplexity, href: `https://www.perplexity.ai/search?q=${q}` },
    { label: "Gemini", img: IMAGES.destinations.gemini, href: `https://gemini.google.com/app?q=${q}` },
  ];

  const shares = [
    { label: "Facebook", Icon: Facebook, href: `https://www.facebook.com/sharer/sharer.php?u=${enc(url)}` },
    { label: "X", Icon: Twitter, href: `https://twitter.com/intent/tweet?url=${enc(url)}&text=${enc(title)}` },
    { label: "LinkedIn", Icon: Linkedin, href: `https://www.linkedin.com/sharing/share-offsite/?url=${enc(url)}` },
    { label: "Email", Icon: Mail, href: `mailto:?subject=${enc(title)}&body=${enc(url)}` },
  ];

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      /* clipboard unavailable */
    }
  }

  return (
    <div className="space-y-5">
      {/* Table of contents — collapsed by default, H2 only */}
      {headings.length > 0 && (
        <div className="rounded-2xl border border-gray-100 bg-white shadow-sm overflow-hidden">
          <button
            onClick={() => setTocOpen((o) => !o)}
            aria-expanded={tocOpen}
            className="w-full flex items-center justify-between gap-3 px-5 py-4 text-left hover:bg-gray-50 transition-colors"
          >
            <span className="flex items-center gap-2 text-sm font-bold text-gray-900">
              <List className="w-4 h-4 text-gray-400" /> In this page
            </span>
            <ChevronDown className={`w-5 h-5 text-gray-400 shrink-0 transition-transform duration-200 ${tocOpen ? "rotate-180" : ""}`} />
          </button>
          {tocOpen && (
            <nav className="px-5 pb-5 pt-1 space-y-2.5 border-t border-gray-100">
              {headings.map((h) => (
                <a
                  key={h.id}
                  href={`#${h.id}`}
                  onClick={() => setTocOpen(false)}
                  className="block text-sm text-gray-600 hover:text-[#0e1b2f] leading-snug transition-colors"
                >
                  {h.text}
                </a>
              ))}
            </nav>
          )}
        </div>
      )}

      {/* Promo banner — visualizes: your SEO tools → Easy Fetcher → the AI brain */}
      <div
        className="rounded-2xl border border-amber-100 p-6 shadow-sm"
        style={{ background: "linear-gradient(165deg, #fffdf5 0%, #ffffff 60%)" }}
      >
        {/* Tier 1 — your Google data sources */}
        <div className="flex items-center justify-center gap-2.5">
          {[
            { img: IMAGES.connectors.gsc, label: "Search Console" },
            { img: IMAGES.connectors.ga4, label: "Google Analytics" },
            { img: IMAGES.connectors.pagespeed, label: "PageSpeed Insights" },
          ].map((s) => (
            <span
              key={s.label}
              title={s.label}
              className="w-12 h-12 rounded-xl bg-white border border-gray-100 shadow-sm flex items-center justify-center"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={s.img} alt={s.label} className="w-6 h-6 object-contain" />
            </span>
          ))}
        </div>

        {/* + join */}
        <div className="flex justify-center my-2.5">
          <span className="w-6 h-6 rounded-full bg-white border border-gray-200 shadow-sm flex items-center justify-center text-gray-400 text-base font-semibold leading-none">
            +
          </span>
        </div>

        {/* Tier 1b — the SEO APIs Easy Fetcher adds */}
        <div className="flex flex-wrap items-center justify-center gap-1.5">
          {[
            { Icon: Search, label: "Keyword Volume" },
            { Icon: Link2, label: "Backlinks" },
            { Icon: ListOrdered, label: "SERP Tracker" },
            { Icon: TrendingUp, label: "Rank Tracker" },
            { Icon: Sparkles, label: "Skills" },
          ].map(({ Icon, label }) => (
            <span
              key={label}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white border border-gray-200 shadow-sm text-[11px] font-semibold text-gray-600"
            >
              <Icon className="w-3 h-3 text-amber-500" />
              {label}
            </span>
          ))}
        </div>

        <ArrowDown className="w-4 h-4 text-gray-300 mx-auto my-2.5" />

        {/* Tier 2 — the AI brain */}
        <div className="flex justify-center mb-5">
          <span className="relative w-16 h-16 rounded-2xl bg-white border border-gray-100 shadow-md flex items-center justify-center">
            <span
              className="absolute inset-0 rounded-2xl blur-lg opacity-25"
              style={{ background: "radial-gradient(circle, #D97757 0%, transparent 70%)" }}
            />
            {brainLogo ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={brainLogo} alt={assistant.name} className="relative w-9 h-9 object-contain" />
            ) : (
              <Sparkles className="relative w-8 h-8 text-[#0e1b2f]" />
            )}
          </span>
        </div>

        <Link
          href={SIGNUP_URL}
          className="w-full inline-flex items-center justify-center gap-2 px-5 py-3.5 rounded-xl bg-[#0e1b2f] text-white font-bold text-sm hover:bg-[#1c3050] transition-colors shadow-md"
        >
          {assistant.connectLabel} <ArrowRight className="w-4 h-4" />
        </Link>
      </div>

      {/* Summarize with AI */}
      <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
        <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Summarize with AI</p>
        <div className="grid grid-cols-2 gap-2">
          {summarize.map((s) => (
            <a
              key={s.label}
              href={s.href}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-gray-200 hover:border-[#0e1b2f]/30 hover:bg-gray-50 transition-all text-sm font-medium text-gray-700"
            >
              {s.img ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={s.img} alt={s.label} className="w-4 h-4 object-contain" />
              ) : (
                <span className="w-4 h-4 rounded-full bg-[#0e1b2f] text-white flex items-center justify-center">
                  <Sparkles className="w-2.5 h-2.5" />
                </span>
              )}
              {s.label}
            </a>
          ))}
        </div>
      </div>

      {/* Share */}
      <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
        <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Share</p>
        <div className="flex items-center gap-2 flex-wrap">
          {shares.map(({ label, Icon, href }) => (
            <a
              key={label}
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`Share on ${label}`}
              className="w-9 h-9 rounded-full border border-gray-200 flex items-center justify-center text-gray-500 hover:text-[#0e1b2f] hover:border-[#0e1b2f]/30 transition-all"
            >
              <Icon className="w-4 h-4" />
            </a>
          ))}
          <button
            onClick={copyLink}
            aria-label="Copy link"
            className="w-9 h-9 rounded-full border border-gray-200 flex items-center justify-center text-gray-500 hover:text-[#0e1b2f] hover:border-[#0e1b2f]/30 transition-all"
          >
            {copied ? <Check className="w-4 h-4 text-green-600" /> : <Link2 className="w-4 h-4" />}
          </button>
        </div>
      </div>
    </div>
  );
}
