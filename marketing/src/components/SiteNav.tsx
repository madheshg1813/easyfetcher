"use client";

import { useState } from "react";
import { Zap, Menu, X } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { SIGNUP_URL, LOGIN_URL } from "@/lib/constants";

export default function SiteNav() {
  const [open, setOpen] = useState(false);

  return (
    <nav className="sticky top-0 z-50 bg-white border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5 sm:gap-3">
          <Image
            src="/ef-icon.png"
            alt="EasyFetcher"
            width={44}
            height={44}
            className="h-9 w-9 sm:h-11 sm:w-11 object-contain"
            priority
          />
          <span className="text-xl sm:text-2xl tracking-tight font-bold text-gray-900">Easy Fetcher</span>
        </Link>

        {/* Desktop links */}
        <div className="hidden md:flex items-center gap-8 text-[15px] font-medium text-gray-600">
          <a href="/#features" className="hover:text-amber-500 transition-colors">Features</a>
          <a href="/#connectors" className="hover:text-amber-500 transition-colors">Integrations</a>
          <Link href="/pricing" className="hover:text-amber-500 transition-colors">Pricing</Link>
          <a href="/#testimonials" className="hover:text-amber-500 transition-colors">Customers</a>
        </div>

        {/* Desktop CTA */}
        <div className="hidden md:flex items-center gap-3">
          <Link href={LOGIN_URL} className="text-[15px] font-medium text-gray-700 hover:text-amber-500 transition-colors px-4 py-2">
            Sign in
          </Link>
          <Link
            href={SIGNUP_URL}
            className="px-6 py-3 rounded-lg bg-[#0e1b2f] text-white text-[15px] font-semibold hover:bg-[#1c3050] transition-colors shadow-sm"
          >
            Get started free
          </Link>
        </div>

        {/* Mobile: Get started + hamburger */}
        <div className="flex md:hidden items-center gap-2">
          <Link
            href={SIGNUP_URL}
            className="px-4 py-2 rounded-lg bg-[#0e1b2f] text-white text-sm font-semibold hover:bg-[#1c3050] transition-colors"
          >
            Get started
          </Link>
          <button
            onClick={() => setOpen(!open)}
            className="p-2 rounded-lg text-gray-600 hover:bg-gray-100 transition-colors"
            aria-label="Toggle menu"
          >
            {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile dropdown */}
      {open && (
        <div className="md:hidden border-t border-gray-100 bg-white px-4 py-3 flex flex-col gap-1">
          <a href="/#features" onClick={() => setOpen(false)} className="py-2.5 px-3 rounded-lg text-sm font-medium text-gray-700 hover:bg-amber-50 hover:text-amber-600 transition-colors">Features</a>
          <a href="/#connectors" onClick={() => setOpen(false)} className="py-2.5 px-3 rounded-lg text-sm font-medium text-gray-700 hover:bg-amber-50 hover:text-amber-600 transition-colors">Integrations</a>
          <Link href="/pricing" onClick={() => setOpen(false)} className="py-2.5 px-3 rounded-lg text-sm font-medium text-gray-700 hover:bg-amber-50 hover:text-amber-600 transition-colors">Pricing</Link>
          <a href="/#testimonials" onClick={() => setOpen(false)} className="py-2.5 px-3 rounded-lg text-sm font-medium text-gray-700 hover:bg-amber-50 hover:text-amber-600 transition-colors">Customers</a>
        </div>
      )}
    </nav>
  );
}
