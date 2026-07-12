"use client";

import { useEffect, useRef, useState } from "react";

// "See it in action" mock for the Keyword Cannibalization Detector skill — ported
// from the Claude artifact. Expandable query cards (click to open); the body
// auto-scrolls (ping-pong), pausing on hover / off-screen. Real Search Console logo.

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
  amber: "#d98a09",
  amberSoft: "#fdf3e0",
  blue: "#3b6fe0",
  blueSoft: "#eaf0fd",
  slateSoft: "#eef1f6",
  mono: "ui-monospace, SFMono-Regular, Menlo, monospace",
};

const PALETTE = ["#3b6fe0", "#f28c1e", "#7c5cd6", "#12a5a5", "#e0523d"];

interface Page { url: string; impr: number; pos: number; primary?: boolean; }
interface Row { query: string; severity: "high" | "med"; impressions: number; clicks: number; ctr: string; pages: Page[]; rec: string; }

const DATA: Row[] = [
  {
    query: "keyword rank tracker", severity: "high", impressions: 18400, clicks: 210, ctr: "1.1%",
    pages: [
      { url: "/skills/rank-tracker", impr: 7200, pos: 4.2, primary: true },
      { url: "/blog/best-rank-trackers", impr: 6100, pos: 8.9 },
      { url: "/tools/serp-checker", impr: 3400, pos: 12.1 },
      { url: "/blog/rank-tracking-guide", impr: 1700, pos: 15.4 },
    ],
    rec: "Google is rotating 4 pages for this term. Keep <b>/skills/rank-tracker</b> as the canonical target, add internal links from the 3 blog posts to it, and re-focus those posts on long-tail variants (e.g. “how to track rankings”) to stop the overlap.",
  },
  {
    query: "free backlink checker", severity: "high", impressions: 14200, clicks: 180, ctr: "1.3%",
    pages: [
      { url: "/tools/backlinks", impr: 6800, pos: 5.1, primary: true },
      { url: "/blog/backlink-analysis", impr: 5100, pos: 9.4 },
      { url: "/features/backlink-monitor", impr: 2300, pos: 13.8 },
    ],
    rec: "Two commercial pages (<b>/tools/backlinks</b> and <b>/features/backlink-monitor</b>) target the same buyer intent. Consolidate them into one, 301-redirect the weaker URL, and the blog post should link up rather than compete.",
  },
  {
    query: "seo audit tool", severity: "high", impressions: 9600, clicks: 96, ctr: "1.0%",
    pages: [
      { url: "/skills/seo-audit", impr: 4200, pos: 6.5, primary: true },
      { url: "/tools/site-audit", impr: 3600, pos: 7.2 },
      { url: "/blog/seo-audit-checklist", impr: 1800, pos: 14.1 },
    ],
    rec: "<b>/skills/seo-audit</b> and <b>/tools/site-audit</b> are near-duplicates fighting for the same query — merge them. The checklist blog has different intent (how-to) and just needs its title tuned so it stops matching the commercial term.",
  },
  {
    query: "gsc api tutorial", severity: "med", impressions: 8100, clicks: 140, ctr: "1.7%",
    pages: [
      { url: "/blog/gsc-api-guide", impr: 4900, pos: 3.8, primary: true },
      { url: "/docs/search-console-api", impr: 3200, pos: 6.9 },
    ],
    rec: "Only 2 pages, but both rank on page 1 and split clicks. Point the <b>/docs</b> page at deeper technical intent and keep <b>/blog/gsc-api-guide</b> as the tutorial — add a clear cross-link between them.",
  },
  {
    query: "keyword research tool", severity: "med", impressions: 6300, clicks: 88, ctr: "1.4%",
    pages: [
      { url: "/tools/keyword-research", impr: 3500, pos: 7.4, primary: true },
      { url: "/blog/keyword-research", impr: 2800, pos: 9.9 },
    ],
    rec: "The blog post is cannibalizing the product page. Rework the post to target “how to do keyword research” (informational) and internally link “keyword research tool” anchor text to <b>/tools/keyword-research</b>.",
  },
  {
    query: "rank tracking software", severity: "med", impressions: 4600, clicks: 61, ctr: "1.3%",
    pages: [
      { url: "/skills/rank-tracker", impr: 2600, pos: 8.1, primary: true },
      { url: "/pricing", impr: 2000, pos: 11.6 },
    ],
    rec: "Your <b>/pricing</b> page is accidentally ranking for a product query. Adjust its title/H1 to focus on pricing intent so <b>/skills/rank-tracker</b> can own this term outright.",
  },
];

function Card({ d, open, onToggle }: { d: Row; open: boolean; onToggle: () => void }) {
  const sevColor = d.severity === "high" ? M.red : M.amber;
  const sevSoft = d.severity === "high" ? M.redSoft : M.amberSoft;
  const total = d.pages.reduce((a, p) => a + p.impr, 0);
  return (
    <div style={{ border: `1px solid ${M.line}`, borderRadius: 14, marginBottom: 14, overflow: "hidden" }}>
      <div onClick={onToggle} style={{ display: "flex", alignItems: "center", gap: 14, padding: "15px 18px", cursor: "pointer", background: open ? "#fcfcfb" : M.paper }}>
        <span style={{ width: 8, alignSelf: "stretch", borderRadius: 4, flexShrink: 0, margin: "-3px 0", background: sevColor }} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 15, fontWeight: 800, letterSpacing: "-.01em", display: "flex", alignItems: "center", gap: 9, flexWrap: "wrap" }}>
            &ldquo;{d.query}&rdquo;
            <span style={{ fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 20, background: sevSoft, color: sevColor }}>{d.severity === "high" ? "HIGH" : "MEDIUM"}</span>
          </div>
          <div style={{ fontSize: 12, color: M.inkMute, marginTop: 3 }}>{d.pages.length} pages competing · exact-match query</div>
        </div>
        <div style={{ display: "flex", gap: 22, textAlign: "right", flexShrink: 0 }}>
          {[[`${(d.impressions / 1000).toFixed(1)}K`, "Impr."], [`${d.clicks}`, "Clicks"], [d.ctr, "CTR"]].map((s, i) => (
            <div key={i} style={{ minWidth: 54 }}>
              <div style={{ fontSize: 17, fontWeight: 800, fontVariantNumeric: "tabular-nums" }}>{s[0]}</div>
              <div style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: ".04em", color: M.inkMute, marginTop: 1 }}>{s[1]}</div>
            </div>
          ))}
        </div>
        <span style={{ color: M.inkMute, fontSize: 13, flexShrink: 0, transition: "transform .2s", transform: open ? "rotate(90deg)" : "none" }}>▶</span>
      </div>
      {open && (
        <div style={{ padding: "4px 18px 18px", borderTop: `1px solid ${M.lineSoft}`, background: "#fcfcfb" }}>
          <div style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: ".04em", color: M.inkMute, marginTop: 12 }}>Impression split across pages</div>
          <div style={{ display: "flex", height: 26, borderRadius: 7, overflow: "hidden", margin: "14px 0 6px", border: `1px solid ${M.line}` }}>
            {d.pages.map((p, i) => {
              const pct = p.impr / total * 100;
              return <div key={i} title={p.url} style={{ flex: p.impr, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, fontWeight: 800, color: "#fff", background: PALETTE[i % PALETTE.length] }}>{pct > 10 ? pct.toFixed(0) + "%" : ""}</div>;
            })}
          </div>
          <table style={{ width: "100%", borderCollapse: "collapse", marginTop: 10 }}>
            <thead><tr>
              {["Ranking Page", "Impressions", "Share", "Avg Pos"].map((h, i) => (
                <th key={h} style={{ fontSize: 10, fontWeight: 700, letterSpacing: ".04em", textTransform: "uppercase", color: M.inkMute, textAlign: i === 0 ? "left" : "right", padding: "8px 10px" }}>{h}</th>
              ))}
            </tr></thead>
            <tbody>
              {d.pages.map((p, i) => (
                <tr key={p.url}>
                  <td style={{ padding: "9px 10px", borderTop: `1px solid ${M.line}`, fontSize: 12.5 }}>
                    <span style={{ fontFamily: M.mono, fontSize: 11.5, color: M.inkSoft, display: "flex", alignItems: "center", gap: 8 }}>
                      <span style={{ width: 9, height: 9, borderRadius: 3, flexShrink: 0, background: PALETTE[i % PALETTE.length] }} />{p.url}
                      {p.primary && <span style={{ fontSize: 9.5, fontWeight: 700, padding: "1px 6px", borderRadius: 5, background: M.greenSoft, color: M.green }}>STRONGEST</span>}
                    </span>
                  </td>
                  <td style={{ padding: "9px 10px", borderTop: `1px solid ${M.line}`, fontSize: 12.5, textAlign: "right", fontVariantNumeric: "tabular-nums", fontWeight: 600 }}>{p.impr.toLocaleString()}</td>
                  <td style={{ padding: "9px 10px", borderTop: `1px solid ${M.line}`, fontSize: 12.5, textAlign: "right", fontVariantNumeric: "tabular-nums", fontWeight: 600 }}>{(p.impr / total * 100).toFixed(0)}%</td>
                  <td style={{ padding: "9px 10px", borderTop: `1px solid ${M.line}`, fontSize: 12.5, textAlign: "right", fontVariantNumeric: "tabular-nums", fontWeight: 600 }}>{p.pos}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <div style={{ marginTop: 14, display: "flex", gap: 10, alignItems: "flex-start", fontSize: 12.5, lineHeight: 1.5, background: M.blueSoft, borderRadius: 10, padding: "11px 13px", color: M.inkSoft }}>
            <span style={{ fontSize: 14 }}>💡</span>
            <div><b style={{ color: M.ink }}>Recommended fix:</b> <span dangerouslySetInnerHTML={{ __html: " " + d.rec }} /></div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function KeywordCannibalizationMock() {
  const [open, setOpen] = useState<Record<number, boolean>>({ 0: true });
  const scrollRef = useRef<HTMLDivElement>(null);
  const pausedRef = useRef(false);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => setVisible(e.isIntersecting), { threshold: 0.15 });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    if (!visible) return;
    const el = scrollRef.current;
    if (!el) return;
    let raf = 0, dir = 1, holdUntil = 0;
    const speed = 0.6;
    const tick = (t: number) => {
      if (!pausedRef.current && !document.hidden) {
        const mx = el.scrollHeight - el.clientHeight;
        if (mx > 4 && t >= holdUntil) {
          el.scrollTop += dir * speed;
          if (el.scrollTop <= 0) { el.scrollTop = 0; dir = 1; holdUntil = t + 900; }
          else if (el.scrollTop >= mx) { el.scrollTop = mx; dir = -1; holdUntil = t + 1300; }
        }
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [visible]);

  const kpis: [string, string, string, string][] = [
    ["Cannibalized Queries", "14", "exact-match, 2+ pages", M.red],
    ["Impressions Affected", "61.2K", "split across pages", M.amber],
    ["Est. Lost Clicks / mo", "~1.9K", "from diluted ranking", M.red],
    ["Avg Pages / Query", "2.8", "competing for same term", M.ink],
  ];

  return (
    <div style={{ background: M.paper, border: `1px solid ${M.line}`, borderRadius: 18, boxShadow: "var(--shadow-lg)", overflow: "hidden", color: M.ink, maxWidth: 940, margin: "0 auto" }}>
      {/* header */}
      <div style={{ padding: "24px 28px 20px", borderBottom: `1px solid ${M.line}`, display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 14 }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
            <h2 style={{ fontSize: 21, fontWeight: 800, letterSpacing: "-.02em", margin: 0 }}>Keyword Cannibalization Detector</h2>
            <span style={{ display: "inline-flex", alignItems: "center", gap: 5, fontSize: 11, fontWeight: 700, padding: "4px 9px 4px 6px", borderRadius: 20, background: M.orangeSoft, color: M.orange }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/connectors/gsc.svg" alt="Search Console" width={13} height={13} style={{ width: 13, height: 13, objectFit: "contain" }} /> Search Console
            </span>
          </div>
          <p style={{ color: M.inkMute, fontSize: 12.5, marginTop: 7, maxWidth: 620 }}>
            <b style={{ color: M.inkSoft, fontWeight: 600 }}>www.easyfetcher.com</b> · Queries whose impressions are split across multiple ranking pages — confusing Google and leaking clicks
          </p>
        </div>
        <div style={{ fontSize: 12, fontWeight: 600, color: M.inkSoft, border: `1px solid ${M.line}`, borderRadius: 9, padding: "8px 12px" }}>📅 Last 90 days</div>
      </div>

      {/* scrollable body */}
      <div
        ref={scrollRef}
        onMouseEnter={() => { pausedRef.current = true; }}
        onMouseLeave={() => { pausedRef.current = false; }}
        style={{ maxHeight: 560, overflowY: "auto", padding: "24px 28px 8px", boxShadow: "inset 0 -14px 20px -18px rgba(20,24,31,.18)" }}
      >
        {/* KPIs */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 12, marginBottom: 26 }}>
          {kpis.map((k) => (
            <div key={k[0]} style={{ border: `1px solid ${M.line}`, borderRadius: 12, padding: "14px 16px" }}>
              <div style={{ fontSize: 10.5, fontWeight: 700, letterSpacing: ".04em", textTransform: "uppercase", color: M.inkMute }}>{k[0]}</div>
              <div style={{ fontSize: 25, fontWeight: 800, marginTop: 5, letterSpacing: "-.02em", color: k[3] }}>{k[1]}</div>
              <div style={{ fontSize: 11.5, fontWeight: 600, marginTop: 3, color: M.inkMute }}>{k[2]}</div>
            </div>
          ))}
        </div>

        {/* Explainer */}
        <div style={{ background: "linear-gradient(180deg,#fff9f0,#fffdfa)", border: "1px solid #f6e2c4", borderLeft: `3px solid ${M.orange}`, borderRadius: 12, padding: "14px 16px", fontSize: 13, lineHeight: 1.55, color: M.inkSoft, marginBottom: 26 }}>
          <span style={{ fontSize: 10.5, fontWeight: 800, letterSpacing: ".07em", color: M.orange, display: "block", marginBottom: 5 }}>WHAT THIS MEANS</span>
          When <b style={{ color: M.ink }}>2 or more of your pages</b> rank for the same exact query, Google can&apos;t decide which one to show — so it rotates them, splits the impressions, and often ranks all of them lower. The result: <b style={{ color: M.ink }}>lots of impressions but very few clicks</b>. Fixing cannibalization (consolidate, redirect, or re-target intent) usually recovers clicks fast with no new content.
        </div>

        {/* Section head */}
        <div style={{ display: "flex", alignItems: "center", gap: 9, marginBottom: 6 }}>
          <h3 style={{ fontSize: 15, fontWeight: 800, letterSpacing: "-.01em", margin: 0 }}>Cannibalized Queries</h3>
          <span style={{ marginLeft: "auto", fontSize: 10, fontWeight: 700, padding: "3px 8px", borderRadius: 6, background: M.slateSoft, color: M.inkMute, letterSpacing: ".03em" }}>GSC · exact query match</span>
        </div>
        <p style={{ fontSize: 12.5, color: M.inkMute, marginBottom: 16 }}>Sorted by impact. Click a query to see which pages are competing and the recommended fix.</p>

        {DATA.map((d, i) => <Card key={d.query} d={d} open={!!open[i]} onToggle={() => setOpen((o) => ({ ...o, [i]: !o[i] }))} />)}
      </div>

      {/* footer */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 28px", borderTop: `1px solid ${M.line}`, flexWrap: "wrap", gap: 12 }}>
        <span style={{ fontSize: 12, color: M.inkMute }}>Analyzed from connected Search Console · Last 90 days · Mock preview data</span>
      </div>
    </div>
  );
}
