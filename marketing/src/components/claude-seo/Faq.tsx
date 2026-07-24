"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";

export interface Qa {
  q: string;
  a: string;
}

function Item({ item, open, onToggle }: { item: Qa; open: boolean; onToggle: () => void }) {
  return (
    <div className={`rounded-2xl border border-gray-200 bg-white transition-shadow ${open ? "shadow-sm" : ""}`}>
      <button
        type="button"
        className="w-full flex items-center justify-between px-5 py-4 text-left gap-4 cursor-pointer"
        onClick={onToggle}
        aria-expanded={open}
      >
        <span className="text-sm sm:text-[15px] font-bold text-gray-900 leading-snug">{item.q}</span>
        <span className={`shrink-0 w-7 h-7 rounded-full grid place-items-center bg-gray-100 text-gray-500 transition-transform ${open ? "rotate-180" : ""}`}>
          <ChevronDown className="w-4 h-4" />
        </span>
      </button>
      {open && (
        <div className="px-5 pb-5 text-sm text-gray-600 leading-relaxed">{item.a}</div>
      )}
    </div>
  );
}

// FAQ accordion. Default is a single stacked column. Pass `twoCol` to split the
// items into two side-by-side columns (e.g. 4 + 4 for eight questions), which
// collapses to one column on small screens. One item is open at a time.
export default function Faq({ items, twoCol = false }: { items: Qa[]; twoCol?: boolean }) {
  const [open, setOpen] = useState<number | null>(0);
  const toggle = (i: number) => setOpen(open === i ? null : i);

  if (!twoCol) {
    return (
      <div className="flex flex-col gap-3">
        {items.map((item, i) => (
          <Item key={i} item={item} open={open === i} onToggle={() => toggle(i)} />
        ))}
      </div>
    );
  }

  const half = Math.ceil(items.length / 2);
  const cols = [items.slice(0, half), items.slice(half)];
  return (
    <div className="grid md:grid-cols-2 gap-3 md:gap-5 items-start">
      {cols.map((col, c) => (
        <div key={c} className="flex flex-col gap-3">
          {col.map((item, i) => {
            const idx = c * half + i;
            return <Item key={idx} item={item} open={open === idx} onToggle={() => toggle(idx)} />;
          })}
        </div>
      ))}
    </div>
  );
}
