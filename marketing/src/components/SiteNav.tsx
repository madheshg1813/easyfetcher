"use client";

import { useState } from "react";
import { Menu, X, ChevronDown, Sparkles, FileText } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { SIGNUP_URL, LOGIN_URL } from "@/lib/constants";
import { IMAGES } from "@/lib/cloudinary";

const INTEGRATIONS = [
  { name: "Google Search Console", blurb: "Clicks, impressions & rankings", logo: IMAGES.connectors.gsc, href: "/integrations/google-search-console" },
  { name: "Google Analytics 4", blurb: "Traffic, users & conversions", logo: IMAGES.connectors.ga4, href: "/integrations/google-analytics" },
  { name: "PageSpeed Insights", blurb: "Core Web Vitals & performance", logo: IMAGES.connectors.pagespeed, href: "/integrations/page-speed-insights" },
];

const RESOURCES = [
  { name: "Claude Skills", blurb: "Ready-made SEO skills for Claude", href: "/skills", icon: Sparkles },
  { name: "Blogs", blurb: "Guides, tips & product updates", href: "/blogs", icon: FileText },
];

export default function SiteNav() {
  const [open, setOpen] = useState(false);

  return (
    <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-gray-100/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3.5 sm:py-4 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 group">
          <Image
            src="/ef-icon.png"
            alt="EasyFetcher"
            width={44}
            height={44}
            className="h-9 w-9 sm:h-10 sm:w-10 object-contain transition-all duration-300 group-hover:scale-[1.03]"
            priority
          />
          <span className="text-xl sm:text-2xl font-bold tracking-normal text-gray-900">
            Easy <span className="text-amber-500">Fetcher</span>
          </span>
        </Link>

        {/* Desktop links */}
        <div className="hidden md:flex items-center gap-7 text-[15px] font-semibold text-gray-500">
          <a href="/#features" className="hover:text-gray-900 transition-colors">Features</a>

          {/* Integrations dropdown */}
          <div className="relative group">
            <button className="inline-flex items-center gap-1 hover:text-gray-900 transition-colors">
              Integrations <ChevronDown className="w-4 h-4 text-gray-400 group-hover:text-gray-600 transition-colors" />
            </button>
            <div className="absolute left-1/2 -translate-x-1/2 top-full pt-3 hidden group-hover:block">
              <div className="w-[300px] rounded-2xl border border-gray-100 bg-white shadow-xl shadow-gray-200/50 p-2">
                {INTEGRATIONS.map((i) => (
                  <Link key={i.href} href={i.href} className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-amber-50/70 transition-colors">
                    <span className="inline-flex w-9 h-9 shrink-0 rounded-lg bg-gray-50 border border-gray-100 items-center justify-center">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={i.logo} alt="" width={20} height={20} loading="lazy" decoding="async" className="w-5 h-5 object-contain" />
                    </span>
                    <span>
                      <span className="block text-sm font-bold text-gray-900">{i.name}</span>
                      <span className="block text-xs text-gray-400">{i.blurb}</span>
                    </span>
                  </Link>
                ))}
              </div>
            </div>
          </div>

          {/* Resources dropdown */}
          <div className="relative group">
            <button className="inline-flex items-center gap-1 hover:text-gray-900 transition-colors">
              Resources <ChevronDown className="w-4 h-4 text-gray-400 group-hover:text-gray-600 transition-colors" />
            </button>
            <div className="absolute left-1/2 -translate-x-1/2 top-full pt-3 hidden group-hover:block">
              <div className="w-[280px] rounded-2xl border border-gray-100 bg-white shadow-xl shadow-gray-200/50 p-2">
                {RESOURCES.map((r) => {
                  const Icon = r.icon;
                  return (
                    <Link key={r.href} href={r.href} className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-amber-50/70 transition-colors">
                      <span className="inline-flex w-9 h-9 shrink-0 rounded-lg bg-amber-50 text-amber-600 items-center justify-center">
                        <Icon className="w-[18px] h-[18px]" />
                      </span>
                      <span>
                        <span className="block text-sm font-bold text-gray-900">{r.name}</span>
                        <span className="block text-xs text-gray-400">{r.blurb}</span>
                      </span>
                    </Link>
                  );
                })}
              </div>
            </div>
          </div>

          <Link href="/pricing" className="hover:text-gray-900 transition-colors">Pricing</Link>
          <a href="/#testimonials" className="hover:text-gray-900 transition-colors">Customers</a>
        </div>

        {/* Desktop CTA */}
        <div className="hidden md:flex items-center gap-3">
          <Link href={LOGIN_URL} className="text-[15px] font-semibold text-gray-500 hover:text-gray-900 transition-colors px-4 py-2">
            Sign in
          </Link>
          <Link
            href={SIGNUP_URL}
            className="px-6 py-2.5 rounded-xl bg-[#0e1b2f] text-white text-[15px] font-bold hover:bg-[#1c3050] transition-all shadow-lg shadow-[#0e1b2f]/15 hover:shadow-xl hover:shadow-[#0e1b2f]/20 hover:-translate-y-px"
          >
            Get started free
          </Link>
        </div>

        {/* Mobile: Get started + hamburger */}
        <div className="flex md:hidden items-center gap-2">
          <Link
            href={SIGNUP_URL}
            className="px-4 py-2 rounded-xl bg-[#0e1b2f] text-white text-sm font-bold hover:bg-[#1c3050] transition-colors shadow-md shadow-[#0e1b2f]/10"
          >
            Get started
          </Link>
          <button
            onClick={() => setOpen(!open)}
            className="p-2 rounded-xl text-gray-600 hover:bg-gray-50 transition-colors"
            aria-label="Toggle menu"
          >
            {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile dropdown */}
      {open && (
        <div className="md:hidden border-t border-gray-100/80 bg-white/95 backdrop-blur-xl px-4 py-3 flex flex-col gap-1">
          <a href="/#features" onClick={() => setOpen(false)} className="py-2.5 px-3 rounded-xl text-sm font-semibold text-gray-700 hover:bg-amber-50 hover:text-amber-600 transition-colors">Features</a>

          <p className="px-3 pt-3 pb-1 text-[11px] font-bold uppercase tracking-wider text-gray-400">Integrations</p>
          {INTEGRATIONS.map((i) => (
            <Link key={i.href} href={i.href} onClick={() => setOpen(false)} className="flex items-center gap-3 py-2.5 px-3 rounded-xl text-sm font-semibold text-gray-700 hover:bg-amber-50 hover:text-amber-600 transition-colors">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={i.logo} alt="" width={18} height={18} loading="lazy" decoding="async" className="w-[18px] h-[18px] object-contain" />
              {i.name}
            </Link>
          ))}

          <p className="px-3 pt-3 pb-1 text-[11px] font-bold uppercase tracking-wider text-gray-400">Resources</p>
          {RESOURCES.map((r) => {
            const Icon = r.icon;
            return (
              <Link key={r.href} href={r.href} onClick={() => setOpen(false)} className="flex items-center gap-3 py-2.5 px-3 rounded-xl text-sm font-semibold text-gray-700 hover:bg-amber-50 hover:text-amber-600 transition-colors">
                <Icon className="w-[18px] h-[18px] text-amber-600" />
                {r.name}
              </Link>
            );
          })}

          <div className="border-t border-gray-100 mt-2 pt-2 flex flex-col gap-1">
            <Link href="/pricing" onClick={() => setOpen(false)} className="py-2.5 px-3 rounded-xl text-sm font-semibold text-gray-700 hover:bg-amber-50 hover:text-amber-600 transition-colors">Pricing</Link>
            <a href="/#testimonials" onClick={() => setOpen(false)} className="py-2.5 px-3 rounded-xl text-sm font-semibold text-gray-700 hover:bg-amber-50 hover:text-amber-600 transition-colors">Customers</a>
          </div>
        </div>
      )}
    </nav>
  );
}
