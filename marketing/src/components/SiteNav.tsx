"use client";

import { useState } from "react";
import { Zap, Menu, X } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { SIGNUP_URL, LOGIN_URL } from "@/lib/constants";

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
        <div className="hidden md:flex items-center gap-8 text-[15px] font-semibold text-gray-500">
          <a href="/#features" className="hover:text-gray-900 transition-colors">Features</a>
          <a href="/#connectors" className="hover:text-gray-900 transition-colors">Integrations</a>
          <Link href="/skills" className="hover:text-gray-900 transition-colors">Skills</Link>
          <Link href="/pricing" className="hover:text-gray-900 transition-colors">Pricing</Link>
          <Link href="/blogs" className="hover:text-gray-900 transition-colors">Blog</Link>
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
          <a href="/#connectors" onClick={() => setOpen(false)} className="py-2.5 px-3 rounded-xl text-sm font-semibold text-gray-700 hover:bg-amber-50 hover:text-amber-600 transition-colors">Integrations</a>
          <Link href="/skills" onClick={() => setOpen(false)} className="py-2.5 px-3 rounded-xl text-sm font-semibold text-gray-700 hover:bg-amber-50 hover:text-amber-600 transition-colors">Skills</Link>
          <Link href="/pricing" onClick={() => setOpen(false)} className="py-2.5 px-3 rounded-xl text-sm font-semibold text-gray-700 hover:bg-amber-50 hover:text-amber-600 transition-colors">Pricing</Link>
          <Link href="/blogs" onClick={() => setOpen(false)} className="py-2.5 px-3 rounded-xl text-sm font-semibold text-gray-700 hover:bg-amber-50 hover:text-amber-600 transition-colors">Blog</Link>
          <a href="/#testimonials" onClick={() => setOpen(false)} className="py-2.5 px-3 rounded-xl text-sm font-semibold text-gray-700 hover:bg-amber-50 hover:text-amber-600 transition-colors">Customers</a>
        </div>
      )}
    </nav>
  );
}
