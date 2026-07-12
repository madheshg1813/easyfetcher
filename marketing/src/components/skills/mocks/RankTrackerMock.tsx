"use client";

// Hero mock for the Keyword Rank Tracker skill page — ported from the Claude
// artifact (keyword-rank-tracker.html). Compact dashboard: summary stats,
// per-country ranking table with sparklines, interactive country tabs.
// Tabs auto-rotate every 3s; rotation pauses off-screen/on-hover and stops
// once the user picks a country manually.

import { useEffect, useRef, useState } from "react";

const M = {
  ink: "#14181f",
  inkSoft: "#4b5563",
  inkMute: "#8a94a3",
  line: "#eceef1",
  lineSoft: "#f4f5f7",
  paper: "#ffffff",
  orange: "#f28c1e",
  orangeSoft: "#fff4e6",
  green: "#1a9e5f",
  greenSoft: "#e7f6ee",
  red: "#e0523d",
  redSoft: "#fbeae7",
  slateSoft: "#eef1f6",
};

type CountryCode = "US" | "UK" | "IN";

const KEYWORDS = [
  { kw: "Claude Rank Tracker", url: "/claude-rank-tracker" },
  { kw: "Claude Keyword Tracker", url: "/claude-keyword-tracker" },
  { kw: "Claude SEO Tracker", url: "/claude-seo-tracker" },
  { kw: "Claude Rank Checker", url: "/claude-rank-checker" },
  { kw: "Keywords Rank Tracker", url: "/keywords-rank-tracker" },
];

const DATA: Record<CountryCode, { now: number; prev: number; path: number[] }[]> = {
  US: [
    { now: 2, prev: 4, path: [7, 6, 5, 4, 3, 3, 2] },
    { now: 5, prev: 8, path: [11, 10, 9, 8, 7, 6, 5] },
    { now: 3, prev: 3, path: [4, 3, 4, 3, 3, 4, 3] },
    { now: 9, prev: 6, path: [5, 6, 6, 7, 8, 8, 9] },
    { now: 12, prev: 18, path: [22, 20, 18, 16, 14, 13, 12] },
  ],
  UK: [
    { now: 4, prev: 6, path: [8, 7, 7, 6, 5, 5, 4] },
    { now: 7, prev: 5, path: [4, 5, 5, 6, 6, 7, 7] },
    { now: 2, prev: 5, path: [8, 7, 6, 5, 4, 3, 2] },
    { now: 11, prev: 11, path: [12, 11, 12, 11, 11, 12, 11] },
    { now: 15, prev: 19, path: [24, 22, 21, 19, 18, 16, 15] },
  ],
  IN: [
    { now: 1, prev: 3, path: [5, 4, 4, 3, 2, 2, 1] },
    { now: 3, prev: 7, path: [9, 8, 8, 7, 5, 4, 3] },
    { now: 6, prev: 6, path: [7, 6, 7, 6, 6, 7, 6] },
    { now: 8, prev: 13, path: [16, 15, 14, 13, 11, 9, 8] },
    { now: 10, prev: 8, path: [6, 7, 7, 8, 9, 9, 10] },
  ],
};

const SUMMARY: Record<CountryCode, { top3: string; top3D: string; top10: string; top10D: string; mover: string; moverKw: string }> = {
  US: { top3: "2", top3D: "▲ 1 new", top10: "4", top10D: "→ no change", mover: "+6", moverKw: "Keywords Rank Tracker" },
  UK: { top3: "2", top3D: "▲ 1 new", top10: "3", top10D: "▲ 1 gained", mover: "+4", moverKw: "Keywords Rank Tracker" },
  IN: { top3: "2", top3D: "→ no change", top10: "5", top10D: "▲ 1 gained", mover: "+5", moverKw: "Claude Rank Checker" },
};

const COUNTRIES: { code: CountryCode; flag: string; label: string }[] = [
  { code: "US", flag: "🇺🇸", label: "US" },
  { code: "UK", flag: "🇬🇧", label: "UK" },
  { code: "IN", flag: "🇮🇳", label: "India" },
];

function Spark({ path, diff }: { path: number[]; diff: number }) {
  const w = 64, h = 22, pad = 3;
  const min = Math.min(...path), max = Math.max(...path);
  const range = max - min || 1;
  const pts = path.map((v, i) => [
    pad + (i / (path.length - 1)) * (w - pad * 2),
    pad + ((v - min) / range) * (h - pad * 2),
  ]);
  const color = diff > 0 ? M.green : diff < 0 ? M.red : M.inkMute;
  const d = pts.map((p, i) => (i === 0 ? "M" : "L") + p[0].toFixed(1) + " " + p[1].toFixed(1)).join(" ");
  const last = pts[pts.length - 1];
  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} style={{ display: "block", margin: "0 auto" }}>
      <path d={d} fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx={last[0].toFixed(1)} cy={last[1].toFixed(1)} r="2.2" fill={color} />
    </svg>
  );
}

function Delta({ diff }: { diff: number }) {
  const s =
    diff > 0
      ? { bg: M.greenSoft, fg: M.green, txt: `▲ +${diff}` }
      : diff < 0
        ? { bg: M.redSoft, fg: M.red, txt: `▼ ${diff}` }
        : { bg: M.slateSoft, fg: M.inkMute, txt: "→" };
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 3, fontSize: 11, fontWeight: 700,
      padding: "2px 8px", borderRadius: 20, background: s.bg, color: s.fg, whiteSpace: "nowrap",
    }}>{s.txt}</span>
  );
}

export default function RankTrackerMock() {
  const [country, setCountry] = useState<CountryCode>("US");
  const rootRef = useRef<HTMLDivElement>(null);
  const pausedRef = useRef(false); // hover pause — ref so it doesn't restart the interval
  const stoppedRef = useRef(false); // user clicked a tab — stop auto-rotation for good
  const [visible, setVisible] = useState(false);

  // Only rotate while the card is actually on screen (also idles in background tabs).
  useEffect(() => {
    const el = rootRef.current;
    if (!el) return;
    const io = new IntersectionObserver(([entry]) => setVisible(entry.isIntersecting), { threshold: 0.3 });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    if (!visible) return;
    const id = setInterval(() => {
      if (pausedRef.current || stoppedRef.current || document.hidden) return;
      setCountry((c) => {
        const order: CountryCode[] = ["US", "UK", "IN"];
        return order[(order.indexOf(c) + 1) % order.length];
      });
    }, 3000);
    return () => clearInterval(id);
  }, [visible]);

  const pickCountry = (c: CountryCode) => {
    stoppedRef.current = true; // respect the user's choice — no more auto-switching
    setCountry(c);
  };

  const s = SUMMARY[country];
  const rows = KEYWORDS.map((k, i) => ({ ...k, ...DATA[country][i] }));

  const th = { fontSize: 9, fontWeight: 700, letterSpacing: ".05em", textTransform: "uppercase" as const, color: M.inkMute, padding: "0 8px 8px", borderBottom: `1px solid ${M.line}` };
  const stat = { border: `1px solid ${M.line}`, borderRadius: 11, padding: "10px 12px", background: M.paper };
  const statLabel = { fontSize: 8.5, fontWeight: 700, letterSpacing: ".06em", color: M.inkMute, textTransform: "uppercase" as const };

  return (
    <div
      ref={rootRef}
      onMouseEnter={() => { pausedRef.current = true; }}
      onMouseLeave={() => { pausedRef.current = false; }}
      style={{
        background: M.paper, border: `1px solid ${M.line}`, borderRadius: 16,
        boxShadow: "var(--shadow-lg)", padding: "18px 18px 16px", maxWidth: 560, marginLeft: "auto",
        color: M.ink,
      }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 10, flexWrap: "wrap" }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ fontSize: 15.5, fontWeight: 800, letterSpacing: "-.02em" }}>Keyword Rank Tracker</span>
            <span style={{
              display: "inline-flex", alignItems: "center", gap: 4, fontSize: 9, fontWeight: 700,
              padding: "3px 7px", borderRadius: 20, background: "#e9effc", color: "#2f5fd0",
            }}>
              <span style={{ width: 7, height: 7, borderRadius: "50%", background: "#2f5fd0", display: "inline-block" }} />
              Live SERP API
            </span>
          </div>
          <p style={{ color: M.inkMute, fontSize: 10.5, marginTop: 4 }}>
            <b style={{ color: M.inkSoft, fontWeight: 600 }}>easyfetcher.com</b> · 5 keywords tracked · This week vs. 2 weeks ago
          </p>
        </div>
        <div style={{ display: "flex", gap: 6 }}>
          {COUNTRIES.map((c) => {
            const active = country === c.code;
            return (
              <button key={c.code} onClick={() => pickCountry(c.code)} style={{
                display: "inline-flex", alignItems: "center", gap: 4, fontSize: 10.5, fontWeight: 600,
                padding: "5px 9px", borderRadius: 8, cursor: "pointer", transition: "all .15s",
                border: `1px solid ${active ? M.ink : M.line}`,
                background: active ? M.ink : M.paper, color: active ? "#fff" : M.inkSoft,
                fontFamily: "inherit",
              }}>
                <span style={{ fontSize: 12, lineHeight: 1 }}>{c.flag}</span> {c.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Summary strip */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8, margin: "14px 0 12px" }}>
        <div style={stat}>
          <div style={statLabel}>Keywords in Top 3</div>
          <div style={{ fontSize: 19, fontWeight: 800, letterSpacing: "-.02em", marginTop: 3 }}>{s.top3}</div>
          <div style={{ fontSize: 9.5, marginTop: 1, fontWeight: 600, color: s.top3D.startsWith("▲") ? M.green : M.inkMute }}>{s.top3D}</div>
        </div>
        <div style={stat}>
          <div style={statLabel}>Keywords in Top 10</div>
          <div style={{ fontSize: 19, fontWeight: 800, letterSpacing: "-.02em", marginTop: 3 }}>{s.top10}</div>
          <div style={{ fontSize: 9.5, marginTop: 1, fontWeight: 600, color: s.top10D.startsWith("▲") ? M.green : M.inkMute }}>{s.top10D}</div>
        </div>
        <div style={stat}>
          <div style={statLabel}>Biggest Mover</div>
          <div style={{ fontSize: 19, fontWeight: 800, letterSpacing: "-.02em", marginTop: 3, color: M.green }}>{s.mover}</div>
          <div style={{ fontSize: 9.5, marginTop: 1, fontWeight: 600, color: M.inkSoft, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{s.moverKw}</div>
        </div>
      </div>

      {/* Table */}
      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr>
            <th style={{ ...th, textAlign: "left" }}>Keyword / Page</th>
            <th style={{ ...th, textAlign: "center" }}>This Week</th>
            <th style={{ ...th, textAlign: "center" }}>Change</th>
            <th style={{ ...th, textAlign: "center" }}>Trend</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => {
            const diff = r.prev - r.now; // positive = moved up (better)
            return (
              <tr key={r.kw}>
                <td style={{ padding: "8px 8px", borderBottom: i < rows.length - 1 ? `1px solid ${M.lineSoft}` : "none" }}>
                  <div style={{ fontSize: 11.5, fontWeight: 700 }}>{r.kw}</div>
                  <div style={{ fontSize: 9, color: M.inkMute, marginTop: 1, fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace" }}>easyfetcher.com{r.url}</div>
                </td>
                <td style={{ padding: "8px 8px", textAlign: "center", borderBottom: i < rows.length - 1 ? `1px solid ${M.lineSoft}` : "none" }}>
                  <span style={{ fontSize: 14, fontWeight: 800, letterSpacing: "-.01em" }}>#{r.now}</span>
                </td>
                <td style={{ padding: "8px 8px", textAlign: "center", borderBottom: i < rows.length - 1 ? `1px solid ${M.lineSoft}` : "none" }}>
                  <Delta diff={diff} />
                </td>
                <td style={{ padding: "8px 8px", textAlign: "center", borderBottom: i < rows.length - 1 ? `1px solid ${M.lineSoft}` : "none" }}>
                  <Spark path={r.path} diff={diff} />
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      {/* Footer meta */}
      <div style={{ marginTop: 10, fontSize: 9.5, color: M.inkMute }}>
        Rank positions checked via external SERP API · Updated daily · Mock preview data
      </div>
    </div>
  );
}
