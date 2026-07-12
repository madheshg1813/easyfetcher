"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

// "See it in action" mock for the Technical SEO Audit skill — ported from the
// Claude artifact. Lighthouse categories, Core Web Vitals, technical issues and
// per-page scores with a Mobile/Desktop toggle. Body auto-scrolls (ping-pong),
// pausing on hover / off-screen. Real PageSpeed Insights logo in the header.

const M = {
  ink: "#14181f",
  inkSoft: "#4b5563",
  inkMute: "#8a94a3",
  line: "#eceef1",
  lineSoft: "#f4f5f7",
  paper: "#ffffff",
  orange: "#f28c1e",
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

function Ring({ size, stroke, r, score, color }: { size: number; stroke: number; r: number; score: number; color: string }) {
  const circ = 2 * Math.PI * r;
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ transform: "rotate(-90deg)" }}>
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={M.line} strokeWidth={stroke} />
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color} strokeWidth={stroke} strokeLinecap="round" strokeDasharray={circ} strokeDashoffset={circ * (1 - score / 100)} />
    </svg>
  );
}

const CATS: [string, number, string, string][] = [
  ["Performance", 65, M.amber, "Needs work"],
  ["Accessibility", 94, M.green, "Good"],
  ["Best Practices", 91, M.green, "Good"],
  ["SEO", 84, M.amber, "Minor issues"],
];

const VITALS: { t: string; v: string; unit?: string; pill: string; tone: "good" | "avg" | "poor"; pct: number; color: string }[] = [
  { t: "LCP", v: "4.2", unit: "s", pill: "Poor", tone: "poor", pct: 78, color: M.red },
  { t: "INP", v: "248", unit: "ms", pill: "Needs work", tone: "avg", pct: 56, color: M.amber },
  { t: "CLS", v: "0.06", pill: "Good", tone: "good", pct: 24, color: M.green },
];
const PILL_TONE: Record<string, [string, string]> = { good: [M.greenSoft, M.green], avg: [M.amberSoft, M.amber], poor: [M.redSoft, M.red] };

const ISSUES: { st: "fail" | "warn" | "pass"; impact: "high" | "med" | "low"; title: string; cntType: "" | "red" | "amber"; count: string; desc: string }[] = [
  { st: "fail", impact: "high", title: "Redirect chains", cntType: "red", count: "9 chains", desc: "9 URLs pass through 2+ redirects before resolving (e.g. /features → /features/ → https://). Each hop adds latency and wastes crawl budget." },
  { st: "fail", impact: "high", title: "Render-blocking resources", cntType: "red", count: "14 pages", desc: "Blocking CSS/JS in <head> delays first paint on 14 templates. Defer non-critical JS and inline critical CSS." },
  { st: "fail", impact: "high", title: "Properly size images", cntType: "red", count: "38 images", desc: "Hero and thumbnail images are served larger than their display size — biggest driver of the 4.2s LCP." },
  { st: "warn", impact: "med", title: "Canonical conflicts", cntType: "amber", count: "11 pages", desc: "11 pages declare a canonical that points elsewhere while also being indexable — sending Google mixed signals." },
  { st: "warn", impact: "med", title: "Crawl traps (infinite params)", cntType: "amber", count: "6 patterns", desc: "Faceted URLs like /blog?sort=&page= generate near-infinite crawlable combinations. Add rules to robots or noindex." },
  { st: "warn", impact: "med", title: "Next-gen image formats", cntType: "amber", count: "52 images", desc: "Serving JPEG/PNG where WebP/AVIF would cut ~340KB. Convert and add <picture> fallbacks." },
  { st: "warn", impact: "med", title: "Unused JavaScript", cntType: "amber", count: "210 KB", desc: "Third-party analytics and unused bundles add 380ms Total Blocking Time. Code-split and lazy-load." },
  { st: "pass", impact: "low", title: "HTTPS & valid certificate", cntType: "", count: "Passed", desc: "All pages served over HTTPS with no mixed-content warnings." },
  { st: "pass", impact: "low", title: "Mobile viewport configured", cntType: "", count: "Passed", desc: "Responsive viewport meta present site-wide; tap targets adequately sized." },
];
const ICO_TXT = { fail: "✕", warn: "!", pass: "✓" };
const ICO_TONE = { fail: [M.redSoft, M.red], warn: [M.amberSoft, M.amber], pass: [M.greenSoft, M.green] };

const PAGES: Record<"mobile" | "desktop", [string, number, string, string, string, string][]> = {
  mobile: [
    ["/ (home)", 42, "4.8s", "290ms", "0.19", "Unoptimized hero image"],
    ["/skills/rank-tracker", 48, "4.2s", "260ms", "0.14", "No image dimensions set"],
    ["/pricing", 56, "3.1s", "210ms", "0.04", "Render-blocking JS"],
    ["/tools/backlinks", 61, "2.9s", "180ms", "0.07", "Third-party scripts"],
    ["/blog/gsc-api-guide", 71, "2.4s", "150ms", "0.02", "Long TBT from analytics"],
    ["/skills/seo-audit", 67, "2.7s", "200ms", "0.05", "Unused CSS"],
    ["/integrations/zapier", 74, "2.2s", "140ms", "0.03", "Redirect chain (2 hops)"],
  ],
  desktop: [
    ["/ (home)", 74, "2.1s", "90ms", "0.08", "Unoptimized hero image"],
    ["/skills/rank-tracker", 79, "1.9s", "80ms", "0.06", "No image dimensions set"],
    ["/pricing", 85, "1.4s", "70ms", "0.02", "Render-blocking JS"],
    ["/tools/backlinks", 88, "1.3s", "60ms", "0.03", "Third-party scripts"],
    ["/blog/gsc-api-guide", 93, "1.1s", "50ms", "0.01", "Long TBT from analytics"],
    ["/skills/seo-audit", 90, "1.2s", "70ms", "0.02", "Unused CSS"],
    ["/integrations/zapier", 95, "0.9s", "40ms", "0.01", "Redirect chain (2 hops)"],
  ],
};
const scoreTone = (s: number): "good" | "avg" | "poor" => (s >= 90 ? "good" : s >= 50 ? "avg" : "poor");
const SB_TONE: Record<string, [string, string]> = { good: [M.greenSoft, M.green], avg: [M.amberSoft, M.amber], poor: [M.redSoft, M.red] };

const th = { fontSize: 10, fontWeight: 700, letterSpacing: ".04em", textTransform: "uppercase" as const, color: M.inkMute, textAlign: "left" as const, padding: "11px 14px", borderBottom: `1px solid ${M.line}`, background: "#fbfbfa", whiteSpace: "nowrap" as const };
const td = { padding: "12px 14px", borderBottom: `1px solid ${M.lineSoft}`, fontSize: 12.5, whiteSpace: "nowrap" as const };

function BlockHead({ title, src, right }: { title: string; src?: string; right?: ReactNode }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 9, marginBottom: 15 }}>
      <h3 style={{ fontSize: 15, fontWeight: 800, letterSpacing: "-.01em", margin: 0 }}>{title}</h3>
      {src && <span style={{ marginLeft: "auto", fontSize: 10, fontWeight: 700, padding: "3px 8px", borderRadius: 6, background: M.slateSoft, color: M.inkMute, letterSpacing: ".03em" }}>{src}</span>}
      {right}
    </div>
  );
}

function Body({ dev, setDev }: { dev: "mobile" | "desktop"; setDev: (d: "mobile" | "desktop") => void }) {
  return (
    <div style={{ padding: "26px 28px 8px", background: M.paper }}>
      {/* Lighthouse categories */}
      <div style={{ marginBottom: 30 }}>
        <BlockHead title="Lighthouse Categories" src="PSI · Mobile" />
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 12 }}>
          {CATS.map(([label, score, color, note]) => (
            <div key={label} style={{ border: `1px solid ${M.line}`, borderRadius: 13, padding: 16, display: "flex", alignItems: "center", gap: 14 }}>
              <div style={{ position: "relative", width: 52, height: 52, flexShrink: 0 }}>
                <Ring size={52} stroke={6} r={22} score={score as number} color={color as string} />
                <b style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 15, fontWeight: 800, color: color as string }}>{score}</b>
              </div>
              <div><div style={{ fontSize: 12, fontWeight: 700, color: M.inkSoft }}>{label}</div><div style={{ fontSize: 11, color: M.inkMute, marginTop: 2 }}>{note}</div></div>
            </div>
          ))}
        </div>
      </div>

      {/* Core Web Vitals */}
      <div style={{ marginBottom: 30 }}>
        <BlockHead title="Core Web Vitals" src="PSI · field + lab" />
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: 12 }}>
          {VITALS.map((vt) => {
            const [bg, fg] = PILL_TONE[vt.tone];
            return (
              <div key={vt.t} style={{ border: `1px solid ${M.line}`, borderRadius: 13, padding: "15px 16px" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <span style={{ fontSize: 11, fontWeight: 700, color: M.inkMute, letterSpacing: ".03em" }}>{vt.t}</span>
                  <span style={{ fontSize: 10, fontWeight: 800, padding: "3px 8px", borderRadius: 20, background: bg, color: fg }}>{vt.pill}</span>
                </div>
                <div style={{ fontSize: 26, fontWeight: 800, letterSpacing: "-.02em", marginTop: 8 }}>{vt.v}{vt.unit && <small style={{ fontSize: 13, fontWeight: 700, color: M.inkMute }}>{vt.unit}</small>}</div>
                <div style={{ height: 5, borderRadius: 3, background: M.line, marginTop: 10, overflow: "hidden" }}><div style={{ height: "100%", borderRadius: 3, width: `${vt.pct}%`, background: vt.color }} /></div>
              </div>
            );
          })}
          <div style={{ border: `1px solid ${M.line}`, borderRadius: 13, padding: "15px 16px" }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: M.inkMute, letterSpacing: ".03em" }}>OTHER LAB METRICS</span>
            <div style={{ display: "flex", gap: 18, marginTop: 10, flexWrap: "wrap" }}>
              {[["2.1s", "FCP"], ["380ms", "TBT"], ["5.4s", "Speed Index"]].map((m) => (
                <div key={m[1]}><div style={{ fontSize: 19, fontWeight: 800 }}>{m[0]}</div><div style={{ fontSize: 10, color: M.inkMute, fontWeight: 700, textTransform: "uppercase" }}>{m[1]}</div></div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Technical issues */}
      <div style={{ marginBottom: 30 }}>
        <BlockHead title="Technical Issues" src="PSI · Crawl diagnostics" />
        <div style={{ border: `1px solid ${M.line}`, borderRadius: 13, overflow: "hidden" }}>
          {ISSUES.map((i, idx) => {
            const [ibg, ifg] = ICO_TONE[i.st];
            const cntTone = i.cntType === "red" ? [M.redSoft, M.red] : i.cntType === "amber" ? [M.amberSoft, M.amber] : [M.slateSoft, M.inkSoft];
            const impTone = i.impact === "high" ? [M.redSoft, M.red] : i.impact === "med" ? [M.amberSoft, M.amber] : [M.slateSoft, M.inkMute];
            return (
              <div key={idx} style={{ display: "flex", alignItems: "flex-start", gap: 13, padding: "15px 18px", borderBottom: idx < ISSUES.length - 1 ? `1px solid ${M.lineSoft}` : "none" }}>
                <span style={{ width: 26, height: 26, borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, flexShrink: 0, fontWeight: 800, background: ibg, color: ifg }}>{ICO_TXT[i.st]}</span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13.5, fontWeight: 700, display: "flex", alignItems: "center", gap: 9, flexWrap: "wrap" }}>
                    {i.title}<span style={{ fontSize: 10, fontWeight: 800, padding: "2px 8px", borderRadius: 20, background: cntTone[0], color: cntTone[1] }}>{i.count}</span>
                  </div>
                  <div style={{ fontSize: 12, color: M.inkMute, marginTop: 3, lineHeight: 1.45 }}>{i.desc}</div>
                </div>
                <span style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: ".04em", padding: "2px 8px", borderRadius: 5, flexShrink: 0, alignSelf: "center", background: impTone[0], color: impTone[1] }}>{i.impact}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Per-page scores */}
      <div style={{ marginBottom: 30 }}>
        <BlockHead title="Page-Level Scores" right={
          <div style={{ marginLeft: "auto", display: "inline-flex", border: `1px solid ${M.line}`, borderRadius: 9, overflow: "hidden" }}>
            {(["mobile", "desktop"] as const).map((d) => (
              <button key={d} onClick={() => setDev(d)} style={{ border: "none", background: dev === d ? M.ink : M.paper, color: dev === d ? "#fff" : M.inkMute, fontSize: 12, fontWeight: 700, padding: "6px 13px", cursor: "pointer", fontFamily: "inherit", textTransform: "capitalize" }}>{d}</button>
            ))}
          </div>
        } />
        <div style={{ overflowX: "auto", border: `1px solid ${M.line}`, borderRadius: 12 }}>
          <table style={{ width: "100%", minWidth: 620, borderCollapse: "collapse" }}>
            <thead><tr><th style={th}>Page</th><th style={{ ...th, textAlign: "center" }}>Perf</th><th style={{ ...th, textAlign: "right" }}>LCP</th><th style={{ ...th, textAlign: "right" }}>INP</th><th style={{ ...th, textAlign: "right" }}>CLS</th><th style={th}>Main bottleneck</th></tr></thead>
            <tbody>
              {PAGES[dev].map((r) => {
                const [sbg, sfg] = SB_TONE[scoreTone(r[1] as number)];
                return (
                  <tr key={r[0] as string}>
                    <td style={{ ...td, fontFamily: M.mono, fontSize: 11.5, color: M.inkSoft }}>{r[0]}</td>
                    <td style={{ ...td, textAlign: "center" }}><span style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", minWidth: 34, height: 26, borderRadius: 7, fontWeight: 800, fontSize: 13, background: sbg, color: sfg }}>{r[1]}</span></td>
                    <td style={{ ...td, textAlign: "right", fontVariantNumeric: "tabular-nums", fontWeight: 600 }}>{r[2]}</td>
                    <td style={{ ...td, textAlign: "right", fontVariantNumeric: "tabular-nums", fontWeight: 600 }}>{r[3]}</td>
                    <td style={{ ...td, textAlign: "right", fontVariantNumeric: "tabular-nums", fontWeight: 600 }}>{r[4]}</td>
                    <td style={{ ...td, color: M.inkMute }}>{r[5]}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Insight */}
      <div style={{ marginBottom: 24, background: "linear-gradient(180deg,#fff9f0,#fffdfa)", border: "1px solid #f6e2c4", borderLeft: `3px solid ${M.orange}`, borderRadius: 12, padding: "14px 16px", fontSize: 13, lineHeight: 1.55, color: M.inkSoft }}>
        <span style={{ fontSize: 10.5, fontWeight: 800, letterSpacing: ".07em", color: M.orange, display: "block", marginBottom: 5 }}>TOP PRIORITY FIX</span>
        <b style={{ color: M.ink }}>LCP is the biggest lever.</b> The homepage and rank-tracker pages load their hero image late (4.2s LCP). Serving a properly-sized, next-gen (WebP/AVIF) hero and preloading it would move Performance from <b style={{ color: M.ink }}>65 → ~85</b> and lift LCP into the &ldquo;Good&rdquo; range — a fix that touches only 3 templates but affects every high-traffic page.
      </div>
    </div>
  );
}

export default function TechnicalSeoAuditMock() {
  const [dev, setDev] = useState<"mobile" | "desktop">("mobile");
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

  return (
    <div style={{ background: M.paper, border: `1px solid ${M.line}`, borderRadius: 18, boxShadow: "var(--shadow-lg)", overflow: "hidden", color: M.ink, maxWidth: 940, margin: "0 auto" }}>
      {/* header */}
      <div style={{ padding: "24px 28px 22px", borderBottom: `1px solid ${M.line}`, display: "flex", justifyContent: "space-between", alignItems: "center", gap: 24, flexWrap: "wrap" }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
            <h2 style={{ fontSize: 21, fontWeight: 800, letterSpacing: "-.02em", margin: 0 }}>Technical SEO Audit</h2>
            <span style={{ display: "inline-flex", alignItems: "center", gap: 5, fontSize: 11, fontWeight: 700, padding: "4px 9px 4px 6px", borderRadius: 20, background: M.blueSoft, color: M.blue }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/connectors/pagespeed.svg" alt="PageSpeed Insights" width={13} height={13} style={{ width: 13, height: 13, objectFit: "contain" }} /> PageSpeed Insights
            </span>
          </div>
          <p style={{ color: M.inkMute, fontSize: 12.5, marginTop: 7 }}>
            <b style={{ color: M.inkSoft, fontWeight: 600 }}>www.easyfetcher.com</b> · Crawl traps, redirect chains, canonical conflicts &amp; render-blocking issues · 148 pages
          </p>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <div style={{ position: "relative", width: 90, height: 90 }}>
            <Ring size={90} stroke={9} r={42} score={82} color={M.orange} />
            <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
              <b style={{ fontSize: 26, fontWeight: 800, letterSpacing: "-.02em" }}>82</b>
              <span style={{ fontSize: 8.5, fontWeight: 700, letterSpacing: ".1em", color: M.inkMute }}>SCORE</span>
            </div>
          </div>
          <div style={{ fontSize: 12, color: M.inkMute, lineHeight: 1.5 }}>
            <span style={{ fontSize: 15, fontWeight: 800, color: M.amber, display: "block", marginBottom: 2 }}>Good</span>
            23 issues found<br />6 critical · 9 warnings<br />8 to improve
          </div>
        </div>
      </div>

      {/* scrollable body */}
      <div
        ref={scrollRef}
        onMouseEnter={() => { pausedRef.current = true; }}
        onMouseLeave={() => { pausedRef.current = false; }}
        style={{ maxHeight: 560, overflowY: "auto", boxShadow: "inset 0 -14px 20px -18px rgba(20,24,31,.18)" }}
      >
        <Body dev={dev} setDev={setDev} />
      </div>

      {/* footer */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 28px", borderTop: `1px solid ${M.line}`, flexWrap: "wrap", gap: 12 }}>
        <span style={{ fontSize: 12, color: M.inkMute }}>Powered by PageSpeed Insights · Last crawl 3 hours ago · Mock preview data</span>
      </div>
    </div>
  );
}
