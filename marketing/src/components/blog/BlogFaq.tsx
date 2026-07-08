"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import type { Faq } from "@/lib/blog";

export default function BlogFaq({ faqs }: { faqs: Faq[] }) {
  const [open, setOpen] = useState<number | null>(0);
  if (!faqs?.length) return null;

  return (
    <section className="mt-14">
      <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight mb-6">
        Frequently asked questions
      </h2>
      <div className="divide-y divide-gray-100 border border-gray-100 rounded-2xl overflow-hidden">
        {faqs.map((faq, i) => (
          <div key={i} className="bg-white">
            <button
              onClick={() => setOpen(open === i ? null : i)}
              aria-expanded={open === i}
              className="w-full flex items-center justify-between gap-4 px-5 sm:px-6 py-4 text-left hover:bg-gray-50 transition-colors"
            >
              <span className="text-sm sm:text-base font-semibold text-gray-900">{faq.q}</span>
              <ChevronDown className={`w-5 h-5 text-gray-400 shrink-0 transition-transform duration-200 ${open === i ? "rotate-180" : ""}`} />
            </button>
            {open === i && (
              <p className="px-5 sm:px-6 pb-5 text-sm text-gray-600 leading-relaxed">{faq.a}</p>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}
