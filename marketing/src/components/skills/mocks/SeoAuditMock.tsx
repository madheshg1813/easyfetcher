"use client";

import { useEffect, useRef, useState } from "react";

// "See it in action" mock for the SEO Audit skill — ported from the Claude
// artifact (seo-audit.html). A full crawl-and-score audit rendered inside a
// Claude output window; the audit body auto-scrolls (ping-pong), pausing on
// hover, off-screen and in background tabs. Real GSC + PageSpeed logos in title.

const A = {
  ink: "#14181f",
  inkSoft: "#4b5563",
  inkMute: "#8a94a3",
  line: "#eceef1",
  lineSoft: "#f4f5f7",
  paper: "#ffffff",
  canvas: "#fafaf8",
  orange: "#f28c1e",
  orangeSoft: "#fff4e6",
  green: "#1a9e5f",
  greenSoft: "#e7f6ee",
  amber: "#d98a09",
  amberSoft: "#fdf3e0",
  red: "#e0523d",
  redSoft: "#fbeae7",
  blue: "#3b6fe0",
  blueSoft: "#eaf0fd",
  slateSoft: "#eef1f6",
  mono: "ui-monospace, SFMono-Regular, Menlo, monospace",
};

type Tone = "red" | "amber" | "green" | "blue" | "gray";
const TONES: Record<Tone, [string, string]> = {
  red: [A.redSoft, A.red],
  amber: [A.amberSoft, A.amber],
  green: [A.greenSoft, A.green],
  blue: [A.blueSoft, A.blue],
  gray: [A.slateSoft, A.inkMute],
};

function Tag({ tone, children }: { tone: Tone; children: React.ReactNode }) {
  const [bg, fg] = TONES[tone];
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 4, fontSize: 11, fontWeight: 700, padding: "3px 9px", borderRadius: 20, background: bg, color: fg, whiteSpace: "nowrap" }}>
      {children}
    </span>
  );
}

function SecHead({ n, title, src }: { n: number; title: string; src: string }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14, marginTop: 28 }}>
      <span style={{ width: 22, height: 22, borderRadius: 6, background: A.ink, color: "#fff", fontSize: 11, fontWeight: 800, display: "grid", placeItems: "center" }}>{n}</span>
      <h3 style={{ fontSize: 15, fontWeight: 800, letterSpacing: "-.01em", margin: 0, color: A.ink }}>{title}</h3>
      <span style={{ marginLeft: "auto", fontSize: 10.5, fontWeight: 700, padding: "3px 8px", borderRadius: 6, background: A.slateSoft, color: A.inkMute, letterSpacing: ".03em" }}>{src}</span>
    </div>
  );
}

const th = { fontSize: 10.5, fontWeight: 700, letterSpacing: ".05em", textTransform: "uppercase" as const, color: A.inkMute, textAlign: "left" as const, padding: "0 12px 9px", borderBottom: `1px solid ${A.line}`, whiteSpace: "nowrap" as const };
const td = { padding: "12px", borderBottom: `1px solid ${A.lineSoft}`, fontSize: 13, verticalAlign: "middle" as const };
const urlStyle = { fontFamily: A.mono, fontSize: 12, color: A.inkSoft };

function Scroll({ children, minWidth = 560 }: { children: React.ReactNode; minWidth?: number }) {
  return (
    <div style={{ overflowX: "auto" }}>
      <table style={{ width: "100%", minWidth, borderCollapse: "collapse" }}>{children}</table>
    </div>
  );
}

const SCHEMA = [
  { name: "Organization", ico: "🏢", ok: false },
  { name: "SoftwareApplication", ico: "💻", ok: false },
  { name: "FAQPage", ico: "❓", ok: false },
  { name: "LocalBusiness", ico: "📍", ok: false },
  { name: "BreadcrumbList", ico: "🍞", ok: true },
  { name: "WebSite / Sitelinks", ico: "🔎", ok: true },
];

const INDEXING: [string, string, number, Tone, string][] = [
  ["Server error (5xx)", "/api/report/legacy", 4, "red", "Not indexed"],
  ["Not found (404)", "/blog/old-pricing-2024", 12, "red", "Not indexed"],
  ["Page with redirect", "/features/", 9, "amber", "Excluded"],
  ["Excluded by 'noindex' tag", "/preview/draft-post", 6, "amber", "Excluded"],
  ["Duplicate, no canonical", "/blog?ref=twitter", 17, "amber", "Excluded"],
  ["Crawled — not indexed", "/integrations/zapier", 8, "gray", "Pending"],
];

const ZERO: [string, string, string, string, string][] = [
  ["keyword rank tracker", "/skills/rank-tracker", "3,420", "11.4", "→ Improve title + meta"],
  ["free backlink checker", "/tools/backlinks", "2,880", "14.2", "→ Add FAQ schema"],
  ["gsc api tutorial", "/blog/gsc-api-guide", "1,950", "9.8", "→ Rewrite H1"],
  ["seo audit tool", "/skills/seo-audit", "1,610", "12.1", "→ Stronger CTA"],
  ["pagespeed insights bulk", "/tools/pagespeed", "1,240", "15.6", "→ Target snippet"],
];

const PSI: [string, number, string, Tone, string, Tone, string][] = [
  ["/ (home)", 42, "4.8s", "red", "0.19", "amber", "Unoptimized hero image"],
  ["/pricing", 56, "3.1s", "amber", "0.04", "green", "Render-blocking JS"],
  ["/skills/rank-tracker", 48, "4.2s", "red", "0.14", "amber", "No image dimensions set"],
  ["/blog/gsc-api-guide", 71, "2.4s", "green", "0.02", "green", "Long TBT from analytics"],
];

const ONPAGE: [string, number, Tone, string, string][] = [
  ["Missing image ALT text", 34, "amber", "Warning", "/features (9 imgs)"],
  ["Missing OG image (og:image)", 21, "red", "Critical", "/blog/* posts"],
  ["Duplicate meta titles", 8, "red", "Critical", "/integrations/*"],
  ["Meta description too short", 15, "amber", "Warning", "/tools/*"],
  ["Missing H1", 3, "amber", "Warning", "/changelog"],
  ["Title over 60 chars", 6, "gray", "Minor", "/skills/seo-audit"],
];

const HEALTH: [string, string, Tone, string, string][] = [
  ["Broken internal links", "11", "red", "Fix", "Point to live URLs or 301"],
  ["Orphan pages", "7", "amber", "Review", "Add to nav or sitemap"],
  ["Sitemap freshness", "6d ago", "green", "OK", "Auto-submitted to GSC"],
  ["HTTPS / mixed content", "0", "green", "OK", "All assets secure"],
  ["Mobile usability errors", "2", "amber", "Review", "Tap targets too close"],
  ["Canonical tag coverage", "94%", "green", "OK", "9 pages missing canonical"],
];

function LogoBadge({ logo, label, bg, fg }: { logo: string; label: string; bg: string; fg: string }) {
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 5, fontSize: 11, fontWeight: 700, padding: "4px 9px 4px 6px", borderRadius: 20, background: bg, color: fg }}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={logo} alt={label} width={13} height={13} style={{ width: 13, height: 13, objectFit: "contain" }} />
      {label}
    </span>
  );
}

function AuditBody() {
  const R = 40, CIRC = 2 * Math.PI * R, score = 82;
  return (
    <div style={{ background: "#fff", color: A.ink, padding: "26px 28px 28px" }}>
      {/* header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 24 }}>
        <div style={{ minWidth: 240 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
            <h2 style={{ fontSize: 22, fontWeight: 800, letterSpacing: "-.02em", margin: 0 }}>SEO Audit</h2>
          </div>
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginTop: 10 }}>
            <LogoBadge logo="/connectors/gsc.svg" label="Search Console" bg={A.orangeSoft} fg={A.orange} />
            <LogoBadge logo="/connectors/pagespeed.svg" label="PageSpeed" bg={A.blueSoft} fg={A.blue} />
            <span style={{ display: "inline-flex", alignItems: "center", fontSize: 11, fontWeight: 700, padding: "4px 10px", borderRadius: 20, background: A.slateSoft, color: A.inkSoft }}>External API</span>
          </div>
          <p style={{ color: A.inkMute, fontSize: 12.5, marginTop: 12, lineHeight: 1.5 }}>
            <b style={{ color: A.inkSoft, fontWeight: 600 }}>www.easyfetcher.com</b> · Full crawl-and-score pass · 148 pages scanned · May 22, 2026
          </p>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 14, flex: "none" }}>
          <div style={{ position: "relative", width: 84, height: 84 }}>
            <svg width="84" height="84" viewBox="0 0 92 92" style={{ transform: "rotate(-90deg)" }}>
              <circle cx="46" cy="46" r={R} fill="none" stroke={A.line} strokeWidth="9" />
              <circle cx="46" cy="46" r={R} fill="none" stroke={A.orange} strokeWidth="9" strokeLinecap="round" strokeDasharray={CIRC} strokeDashoffset={CIRC * (1 - score / 100)} />
            </svg>
            <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
              <b style={{ fontSize: 25, fontWeight: 800, letterSpacing: "-.02em" }}>{score}</b>
              <span style={{ fontSize: 8.5, fontWeight: 700, letterSpacing: ".1em", color: A.inkMute }}>SCORE</span>
            </div>
          </div>
          <div style={{ fontSize: 12, color: A.inkMute, lineHeight: 1.5 }}>
            <span style={{ fontSize: 15, fontWeight: 800, color: A.amber, display: "block", marginBottom: 2 }}>Good</span>
            18 issues found<br />7 critical · 11 to improve
          </div>
        </div>
      </div>

      {/* overview */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12, margin: "22px 0 4px" }}>
        {([["Critical Errors", "7", A.red], ["Warnings", "11", A.amber], ["Missed Clicks / mo", "~2.4k", A.ink], ["Passed Checks", "63", A.green]] as [string, string, string][]).map((o) => (
          <div key={o[0]} style={{ border: `1px solid ${A.line}`, borderRadius: 13, padding: "13px 15px", background: A.paper }}>
            <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: ".05em", textTransform: "uppercase", color: A.inkMute }}>{o[0]}</div>
            <div style={{ fontSize: 24, fontWeight: 800, marginTop: 5, letterSpacing: "-.02em", color: o[2] }}>{o[1]}</div>
          </div>
        ))}
      </div>

      {/* 1. Schema */}
      <SecHead n={1} title="Structured Data / Schema" src="External API" />
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 10 }}>
        {SCHEMA.map((s) => (
          <div key={s.name} style={{ display: "flex", alignItems: "center", gap: 10, border: `1px solid ${s.ok ? "#d6efdf" : "#f6d9d3"}`, background: s.ok ? "#f4fbf7" : "#fef7f5", borderRadius: 11, padding: "11px 13px" }}>
            <span style={{ width: 30, height: 30, borderRadius: 8, display: "grid", placeItems: "center", fontSize: 15, background: s.ok ? A.greenSoft : A.redSoft, flexShrink: 0 }}>{s.ico}</span>
            <div>
              <b style={{ fontSize: 13, fontWeight: 700, display: "block" }}>{s.name}</b>
              <span style={{ fontSize: 11.5, fontWeight: 600, color: s.ok ? A.green : A.red }}>{s.ok ? "✓ Valid" : "✗ Not implemented"}</span>
            </div>
          </div>
        ))}
      </div>
      <p style={{ fontSize: 12, color: A.inkMute, marginTop: 10 }}>Adding <b style={{ color: A.inkSoft, fontWeight: 600 }}>Organization</b>, <b style={{ color: A.inkSoft, fontWeight: 600 }}>SoftwareApplication</b> and <b style={{ color: A.inkSoft, fontWeight: 600 }}>FAQPage</b> markup can unlock rich results on 40+ pages.</p>

      {/* 2. Indexing */}
      <SecHead n={2} title="Page Indexing Errors" src="GSC · URL Inspection API" />
      <Scroll>
        <thead><tr><th style={th}>Reason</th><th style={th}>Example URL</th><th style={{ ...th, textAlign: "right" }}>Pages</th><th style={th}>Status</th></tr></thead>
        <tbody>
          {INDEXING.map((r) => (
            <tr key={r[1]}>
              <td style={td}>{r[0]}</td>
              <td style={{ ...td, ...urlStyle }}>{r[1]}</td>
              <td style={{ ...td, textAlign: "right", fontWeight: 800 }}>{r[2]}</td>
              <td style={td}><Tag tone={r[3]}>{r[4]}</Tag></td>
            </tr>
          ))}
        </tbody>
      </Scroll>

      {/* 3. Zero clicks */}
      <SecHead n={3} title="Impressions but Zero Clicks" src="GSC · Search Analytics" />
      <Scroll>
        <thead><tr><th style={th}>Query</th><th style={th}>Landing page</th><th style={{ ...th, textAlign: "right" }}>Impr.</th><th style={{ ...th, textAlign: "right" }}>Clicks</th><th style={{ ...th, textAlign: "right" }}>Avg. pos</th><th style={th}>Opportunity</th></tr></thead>
        <tbody>
          {ZERO.map((r) => (
            <tr key={r[0]}>
              <td style={td}>{r[0]}</td>
              <td style={{ ...td, ...urlStyle }}>{r[1]}</td>
              <td style={{ ...td, textAlign: "right", fontWeight: 700 }}>{r[2]}</td>
              <td style={{ ...td, textAlign: "right", fontWeight: 800, color: A.red }}>0</td>
              <td style={{ ...td, textAlign: "right", fontWeight: 700 }}>{r[3]}</td>
              <td style={{ ...td, fontSize: 11.5, fontWeight: 700, color: A.green }}>{r[4]}</td>
            </tr>
          ))}
        </tbody>
      </Scroll>
      <p style={{ fontSize: 12, color: A.inkMute, marginTop: 10 }}>These 5 queries account for <b style={{ color: A.inkSoft, fontWeight: 600 }}>11,100 impressions</b> with no clicks — mostly page-2 rankings with weak titles.</p>

      {/* 4. PSI */}
      <SecHead n={4} title="Slow Pages (Core Web Vitals)" src="PageSpeed Insights" />
      <Scroll>
        <thead><tr><th style={th}>Page</th><th style={{ ...th, textAlign: "right" }}>Mobile</th><th style={th}>LCP</th><th style={th}>CLS</th><th style={th}>Main issue</th></tr></thead>
        <tbody>
          {PSI.map((r) => {
            const barColor = r[1] < 50 ? A.red : r[1] < 70 ? A.amber : A.green;
            return (
              <tr key={r[0]}>
                <td style={{ ...td, ...urlStyle }}>{r[0]}</td>
                <td style={{ ...td, textAlign: "right" }}>
                  <span style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
                    <span style={{ width: 80, height: 6, borderRadius: 4, background: A.line, overflow: "hidden", display: "inline-block" }}>
                      <span style={{ display: "block", height: "100%", width: `${r[1]}%`, background: barColor, borderRadius: 4 }} />
                    </span>
                    <span style={{ fontSize: 12, fontWeight: 800, color: barColor, minWidth: 22 }}>{r[1]}</span>
                  </span>
                </td>
                <td style={td}><Tag tone={r[3]}>{r[2]}</Tag></td>
                <td style={td}><Tag tone={r[5]}>{r[4]}</Tag></td>
                <td style={{ ...td, fontSize: 12, color: A.inkMute }}>{r[6]}</td>
              </tr>
            );
          })}
        </tbody>
      </Scroll>

      {/* 5. On-page */}
      <SecHead n={5} title="On-Page & Metadata Gaps" src="External API · Crawl" />
      <Scroll>
        <thead><tr><th style={th}>Issue</th><th style={{ ...th, textAlign: "right" }}>Pages</th><th style={th}>Severity</th><th style={th}>Example</th></tr></thead>
        <tbody>
          {ONPAGE.map((r) => (
            <tr key={r[0]}>
              <td style={td}>{r[0]}</td>
              <td style={{ ...td, textAlign: "right", fontWeight: 800 }}>{r[1]}</td>
              <td style={td}><Tag tone={r[2]}>{r[3]}</Tag></td>
              <td style={{ ...td, ...urlStyle }}>{r[4]}</td>
            </tr>
          ))}
        </tbody>
      </Scroll>

      {/* 6. Health */}
      <SecHead n={6} title="Additional Health Checks" src="GSC + Crawl + API" />
      <Scroll>
        <thead><tr><th style={th}>Check</th><th style={{ ...th, textAlign: "right" }}>Result</th><th style={th}>Status</th><th style={th}>Note</th></tr></thead>
        <tbody>
          {HEALTH.map((r) => (
            <tr key={r[0]}>
              <td style={td}>{r[0]}</td>
              <td style={{ ...td, textAlign: "right", fontWeight: 800 }}>{r[1]}</td>
              <td style={td}><Tag tone={r[2]}>{r[3]}</Tag></td>
              <td style={{ ...td, fontSize: 12, color: A.inkMute }}>{r[4]}</td>
            </tr>
          ))}
        </tbody>
      </Scroll>

      <p style={{ marginTop: 22, fontSize: 11, color: A.inkMute }}>Crawl-and-score pass · Data from Search Console, PageSpeed Insights &amp; external crawl API · Mock preview data</p>
    </div>
  );
}

export default function SeoAuditMock() {
  const scrollRef = useRef<HTMLDivElement>(null);
  const pausedRef = useRef(false); // hover pause — ref so it never restarts the loop
  const [visible, setVisible] = useState(false);

  // Only animate while the card is on screen.
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => setVisible(e.isIntersecting), { threshold: 0.15 });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  // Gentle ping-pong auto-scroll; idles when paused/hidden/off-screen.
  useEffect(() => {
    if (!visible) return;
    const el = scrollRef.current;
    if (!el) return;
    let raf = 0;
    let dir = 1;
    let holdUntil = 0;
    const speed = 0.6; // px per frame (~36px/s)
    const tick = (t: number) => {
      if (!pausedRef.current && !document.hidden) {
        const max = el.scrollHeight - el.clientHeight;
        if (max > 4 && t >= holdUntil) {
          el.scrollTop += dir * speed;
          if (el.scrollTop <= 0) { el.scrollTop = 0; dir = 1; holdUntil = t + 900; }
          else if (el.scrollTop >= max) { el.scrollTop = max; dir = -1; holdUntil = t + 1300; }
        }
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [visible]);

  return (
    <div style={{ background: "#fff", border: "1px solid var(--border)", borderRadius: 16, boxShadow: "var(--shadow-lg)", overflow: "hidden", maxWidth: 920, margin: "0 auto" }}>
      {/* Claude window chrome */}
      <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "12px 16px", background: A.ink }}>
        <div style={{ display: "flex", gap: 7 }}>
          {["#ff5f57", "#febc2e", "#28c840"].map((c) => <span key={c} style={{ width: 11, height: 11, borderRadius: 999, background: c, opacity: 0.9 }} />)}
        </div>
        <span style={{ marginLeft: 6, display: "inline-flex", alignItems: "center", gap: 7, color: "rgba(255,255,255,.9)", fontSize: 13, fontWeight: 600 }}>
          <span style={{ width: 19, height: 19, borderRadius: 6, background: "#fff", display: "grid", placeItems: "center" }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/connectors/claude-icon.png" alt="Claude" width={13} height={13} style={{ width: 13, height: 13, objectFit: "contain" }} />
          </span>
          Claude
        </span>
        <span style={{ marginLeft: "auto", fontSize: 11.5, color: "rgba(255,255,255,.5)" }}>Search Console + PageSpeed</span>
      </div>

      <div style={{ padding: "18px 20px 20px" }}>
        {/* user prompt */}
        <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 16 }}>
          <span style={{ background: A.slateSoft, border: `1px solid ${A.line}`, borderRadius: "12px 12px 4px 12px", padding: "9px 13px", fontSize: 13.5, color: A.inkSoft, fontWeight: 500 }}>
            Run a full SEO audit for easyfetcher.com
          </span>
        </div>
        {/* assistant → scrollable audit */}
        <div style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
          <span style={{ width: 32, height: 32, flex: "none", borderRadius: 9, display: "grid", placeItems: "center", background: "#fff", border: `1px solid ${A.line}`, boxShadow: "0 1px 2px rgba(20,24,31,.05)" }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/connectors/claude-icon.png" alt="Claude" width={18} height={18} style={{ width: 18, height: 18, objectFit: "contain" }} />
          </span>
          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{ fontSize: 13.5, color: A.inkSoft, marginBottom: 14, lineHeight: 1.5 }}>Done — here&apos;s your full crawl-and-score audit. Scroll to review all six checks:</p>
            <div
              ref={scrollRef}
              onMouseEnter={() => { pausedRef.current = true; }}
              onMouseLeave={() => { pausedRef.current = false; }}
              style={{ maxHeight: 540, overflowY: "auto", border: `1px solid ${A.line}`, borderRadius: 14, boxShadow: "inset 0 -14px 20px -18px rgba(20,24,31,.18)" }}
            >
              <AuditBody />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
