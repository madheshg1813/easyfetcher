"use client";

import { useState } from "react";
import { Zap, Menu, X } from "lucide-react";
import Link from "next/link";
import { SIGNUP_URL, LOGIN_URL } from "@/lib/constants";

export default function SiteNav() {
  const [open, setOpen] = useState(false);

  return (
    <nav className="sticky top-0 z-50 bg-white border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo.png" alt="EasyFetcher" className="h-10 w-auto object-contain" />
        </Link>

        {/* Desktop links */}
        <div className="hidden md:flex items-center gap-8 text-sm font-medium text-gray-600">
          <a href="/#features" className="hover:text-amber-500 transition-colors">Features</a>
          <a href="/#connectors" className="hover:text-amber-500 transition-colors">Integrations</a>
          <Link href="/pricing" className="hover:text-amber-500 transition-colors">Pricing</Link>
          <a href="/#testimonials" className="hover:text-amber-500 transition-colors">Customers</a>
        </div>

        {/* Desktop CTA */}
        <div className="hidden md:flex items-center gap-3">
          <Link href={LOGIN_URL} className="text-sm font-medium text-gray-700 hover:text-amber-500 transition-colors px-4 py-2">
            Sign in
          </Link>
          <Link
            href={SIGNUP_URL}
            className="px-5 py-2.5 rounded-lg bg-amber-500 text-gray-900 text-sm font-semibold hover:bg-amber-600 transition-colors shadow-sm"
          >
            Get started free
          </Link>
        </div>

        {/* Mobile: Get started + hamburger */}
        <div className="flex md:hidden items-center gap-2">
          <Link
            href={SIGNUP_URL}
            className="px-4 py-2 rounded-lg bg-amber-500 text-gray-900 text-sm font-semibold hover:bg-amber-600 transition-colors"
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
