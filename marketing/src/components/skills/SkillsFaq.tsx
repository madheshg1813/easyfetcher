"use client";

import { useState } from "react";
import { FAQS } from "@/lib/skills";
import Icon from "./Icon";
import { Eyebrow } from "./primitives";

interface Faq {
  q: string;
  a: string;
}

function FaqItem({ f, isOpen, onToggle }: { f: Faq; isOpen: boolean; onToggle: () => void }) {
  return (
    <div style={{
      border: "1px solid var(--border)", borderRadius: 14, background: isOpen ? "var(--bg-soft)" : "#fff",
      boxShadow: isOpen ? "var(--shadow-sm)" : "none", transition: "background .18s",
    }}>
      <button onClick={onToggle} style={{
        width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16,
        background: "transparent", border: "none", cursor: "pointer", padding: "18px 20px", textAlign: "left",
      }}>
        <span style={{ fontWeight: 700, fontSize: 15.5, color: "var(--ink)", letterSpacing: "-0.01em", lineHeight: 1.4 }}>{f.q}</span>
        <span style={{
          width: 28, height: 28, flex: "none", borderRadius: 999, display: "grid", placeItems: "center",
          background: isOpen ? "var(--amber)" : "var(--bg-soft-2)", transition: "transform .2s, background .2s",
          transform: isOpen ? "rotate(180deg)" : "none",
        }}>
          <Icon name="chevron-down" size={16} style={{ color: isOpen ? "var(--ink)" : "var(--gray)" }} />
        </span>
      </button>
      {isOpen && (
        <div style={{ padding: "0 20px 20px", fontSize: 14.5, lineHeight: 1.62, color: "var(--gray)" }}>
          {f.a}
        </div>
      )}
    </div>
  );
}

// FAQ accordion. Pass `faqs` for page-specific questions (falls back to the
// generic hub set). With `twoCol`, items split into two side-by-side columns
// (4 + 4 for eight questions), collapsing to one column on small screens.
export default function SkillsFaq({ faqs, twoCol = false }: { faqs?: Faq[]; twoCol?: boolean }) {
  const items = faqs || FAQS;
  const [open, setOpen] = useState(0);

  const toggle = (i: number) => setOpen(open === i ? -1 : i);

  const half = Math.ceil(items.length / 2);
  const columns = twoCol ? [items.slice(0, half), items.slice(half)] : [items];

  return (
    <section id="faq" style={{ background: "#fff", padding: "84px 0" }}>
      <div className="wrap" style={{ maxWidth: twoCol ? undefined : 820 }}>
        <div style={{ textAlign: "center", marginBottom: 44 }}>
          <Eyebrow>FAQ</Eyebrow>
          <h2 style={{ fontSize: 40, fontWeight: 800, letterSpacing: "-0.025em", marginTop: 14, color: "var(--ink)" }}>
            Questions, answered
          </h2>
        </div>
        <div className={twoCol ? "ef-two" : undefined} style={{
          display: "grid",
          gridTemplateColumns: twoCol ? "1fr 1fr" : "1fr",
          gap: twoCol ? 20 : 12,
          alignItems: "start",
        }}>
          {columns.map((col, c) => (
            <div key={c} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {col.map((f, i) => {
                const idx = c * half + i;
                return <FaqItem key={idx} f={f} isOpen={open === idx} onToggle={() => toggle(idx)} />;
              })}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
