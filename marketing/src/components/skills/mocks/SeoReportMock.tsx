"use client";

import { useEffect, useId, useRef, useState, type ReactNode } from "react";

// "See it in action" mock for the SEO Report Generator skill — ported from the
// Claude artifact (seo-report-generator.html). A 5-tab narrated report that
// auto-cycles every 2s (looping), pausing on hover / off-screen / background tab.
// Real Search Console + GA4 logos in the header.

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
  red: "#e0523d",
  blue: "#3b6fe0",
  blueSoft: "#eaf0fd",
  purple: "#7c5cd6",
  teal: "#12a5a5",
  slateSoft: "#eef1f6",
  mono: "ui-monospace, SFMono-Regular, Menlo, monospace",
};

const th = { fontSize: 10, fontWeight: 700, letterSpacing: ".04em", textTransform: "uppercase" as const, color: M.inkMute, textAlign: "left" as const, padding: "11px 12px", borderBottom: `1px solid ${M.line}`, background: "#fbfbfa", whiteSpace: "nowrap" as const };
const thNum = { ...th, textAlign: "right" as const };
const td = { padding: "11px 12px", borderBottom: `1px solid ${M.lineSoft}`, fontSize: 12.5, whiteSpace: "nowrap" as const };
const tdNum = { ...td, textAlign: "right" as const, fontVariantNumeric: "tabular-nums" as const, fontWeight: 600 };
const urlStyle = { fontFamily: M.mono, fontSize: 11.5, color: M.inkSoft };

function Scroll({ children, min = 620 }: { children: ReactNode; min?: number }) {
  return (
    <div style={{ overflowX: "auto", border: `1px solid ${M.line}`, borderRadius: 12 }}>
      <table style={{ width: "100%", minWidth: min, borderCollapse: "collapse" }}>{children}</table>
    </div>
  );
}

function BlockHead({ title, src }: { title: string; src: string }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 9, marginBottom: 14 }}>
      <h3 style={{ fontSize: 14, fontWeight: 800, letterSpacing: "-.01em", margin: 0 }}>{title}</h3>
      <span style={{ marginLeft: "auto", fontSize: 10, fontWeight: 700, padding: "3px 8px", borderRadius: 6, background: M.slateSoft, color: M.inkMute, letterSpacing: ".03em" }}>{src}</span>
    </div>
  );
}

function Kpi({ k, v, d, up }: { k: string; v: string; d: string; up: boolean }) {
  return (
    <div style={{ border: `1px solid ${M.line}`, borderRadius: 12, padding: "13px 14px" }}>
      <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: ".04em", textTransform: "uppercase", color: M.inkMute }}>{k}</div>
      <div style={{ fontSize: 22, fontWeight: 800, marginTop: 5, letterSpacing: "-.02em" }}>{v}</div>
      <div style={{ fontSize: 11.5, fontWeight: 700, marginTop: 3, color: up ? M.green : M.red }}>{d}</div>
    </div>
  );
}

function Line({ data, color, invert = false }: { data: number[]; color: string; invert?: boolean }) {
  const gid = "g" + useId().replace(/:/g, "");
  const w = 320, h = 90, pad = 6;
  const min = Math.min(...data), max = Math.max(...data), range = max - min || 1;
  const pts = data.map((v, i) => {
    const x = pad + (i / (data.length - 1)) * (w - pad * 2);
    const y = invert ? pad + ((v - min) / range) * (h - pad * 2) : pad + (1 - (v - min) / range) * (h - pad * 2);
    return [x, y] as [number, number];
  });
  const dp = pts.map((p, i) => (i ? "L" : "M") + p[0].toFixed(1) + " " + p[1].toFixed(1)).join(" ");
  const area = `${dp} L${pts[pts.length - 1][0].toFixed(1)} ${h - pad} L${pts[0][0].toFixed(1)} ${h - pad} Z`;
  const last = pts[pts.length - 1];
  return (
    <svg viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none" style={{ width: "100%", height: 90, display: "block" }}>
      <defs><linearGradient id={gid} x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor={color} stopOpacity="0.18" /><stop offset="100%" stopColor={color} stopOpacity="0" /></linearGradient></defs>
      <path d={area} fill={`url(#${gid})`} />
      <path d={dp} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx={last[0].toFixed(1)} cy={last[1].toFixed(1)} r="3" fill={color} />
    </svg>
  );
}

function ChartCard({ title, value, delta, up, children }: { title: string; value?: string; delta?: string; up?: boolean; children: ReactNode }) {
  return (
    <div style={{ border: `1px solid ${M.line}`, borderRadius: 13, padding: "15px 16px 10px" }}>
      <div style={{ fontSize: 12, fontWeight: 700, color: M.inkSoft, marginBottom: value ? 4 : 8 }}>{title}</div>
      {value && <div style={{ fontSize: 20, fontWeight: 800, letterSpacing: "-.02em", marginBottom: 8 }}>{value} {delta && <small style={{ fontSize: 12, fontWeight: 700, color: up ? M.green : M.red }}>{delta}</small>}</div>}
      {children}
    </div>
  );
}

function Bars({ rows, color }: { rows: { k: string; v: number }[]; color: string }) {
  const max = Math.max(...rows.map((r) => r.v));
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 9, marginTop: 8 }}>
      {rows.map((r, i) => (
        <div key={i} style={{ display: "grid", gridTemplateColumns: "130px 1fr 44px", alignItems: "center", gap: 10, fontSize: 12 }}>
          <span title={r.k} style={{ fontFamily: M.mono, fontSize: 11, color: M.inkSoft, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{r.k}</span>
          <span style={{ height: 20, background: M.lineSoft, borderRadius: 5, overflow: "hidden" }}>
            <span style={{ display: "block", height: "100%", width: `${(r.v / max * 100).toFixed(1)}%`, background: color, borderRadius: 5 }} />
          </span>
          <span style={{ textAlign: "right", fontWeight: 700 }}>{r.v >= 1000 ? (r.v / 1000).toFixed(1) + "k" : r.v}</span>
        </div>
      ))}
    </div>
  );
}

function heat(v: number, min: number, max: number, hue: "g" | "r" | "b") {
  const t = Math.max(0, Math.min(1, (v - min) / (max - min)));
  const a = (0.08 + t * 0.28).toFixed(2);
  return hue === "g" ? `rgba(26,158,95,${a})` : hue === "r" ? `rgba(224,82,61,${a})` : `rgba(59,111,224,${a})`;
}
const Heat = ({ bg, children }: { bg: string; children: ReactNode }) => (
  <span style={{ borderRadius: 5, padding: "3px 7px", fontWeight: 700, fontVariantNumeric: "tabular-nums", background: bg }}>{children}</span>
);

const AI_SERIES = [
  { name: "chatgpt.com", color: M.green, vals: [820, 180, 640, 720, 90] },
  { name: "copilot", color: M.blue, vals: [540, 120, 410, 480, 60] },
  { name: "perplexity", color: M.purple, vals: [160, 40, 120, 140, 20] },
  { name: "gemini", color: M.orange, vals: [90, 25, 70, 80, 12] },
  { name: "claude.ai", color: M.teal, vals: [70, 20, 55, 65, 10] },
  { name: "others", color: M.inkMute, vals: [40, 12, 30, 35, 8] },
];
const AI_WEEKS = ["Wk 50", "Wk 51", "Wk 52", "Wk 1", "Wk 2"];

function AiStacked() {
  const W = 520, H = 180, pad = 28, gap = 18;
  const totals = AI_WEEKS.map((_, i) => AI_SERIES.reduce((a, s) => a + s.vals[i], 0));
  const max = Math.max(...totals);
  const bw = (W - pad * 2 - gap * (AI_WEEKS.length - 1)) / AI_WEEKS.length;
  const els: ReactNode[] = [];
  AI_WEEKS.forEach((wk, i) => {
    let y = H - pad;
    const x = pad + i * (bw + gap);
    AI_SERIES.forEach((s, si) => {
      const hh = (s.vals[i] / max) * (H - pad * 2);
      y -= hh;
      els.push(<rect key={`${i}-${si}`} x={x} y={y} width={bw} height={hh} fill={s.color} />);
    });
    els.push(<text key={`t${i}`} x={x + bw / 2} y={H - pad + 14} fontSize="10" fill={M.inkMute} textAnchor="middle">{wk}</text>);
  });
  return <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", height: "auto", display: "block" }}>{els}</svg>;
}

/* ---------------- panels ---------------- */

function PanelOverview() {
  const r1 = [["Impressions", "1.67M", "▲ 12.4%", true], ["Clicks", "82.3K", "▲ 8.1%", true], ["CTR", "4.92%", "▼ 0.3%", false], ["Avg Position", "6.5", "▲ 1.2", true], ["Sessions", "54.5K", "▲ 9.7%", true]] as const;
  const r2 = [["Engaged Sessions", "38.1K", "▲ 6.4%", true], ["Avg Session Dur.", "2:07", "▲ 5.2%", true], ["Key Events", "10.6K", "▲ 14.9%", true], ["Bounce Rate", "38.0%", "▼ 2.1%", true], ["New Users", "60.2K", "▲ 11.3%", true]] as const;
  return (
    <>
      <div style={{ marginBottom: 30 }}>
        <BlockHead title="Core SEO & Traffic Metrics" src="GSC + GA4" />
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: 10 }}>
          {r1.map((k) => <Kpi key={k[0]} k={k[0]} v={k[1]} d={k[2]} up={k[3]} />)}
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: 10, marginTop: 10 }}>
          {r2.map((k) => <Kpi key={k[0]} k={k[0]} v={k[1]} d={k[2]} up={k[3]} />)}
        </div>
      </div>
      <div style={{ marginBottom: 30 }}>
        <BlockHead title="Performance Dynamics (Trend)" src="Month-over-month" />
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 14 }}>
          <ChartCard title="Clicks Dynamics" value="82.3K" delta="▲ 8.1%" up><Line data={[61, 64, 63, 66, 65, 70, 82]} color={M.blue} /></ChartCard>
          <ChartCard title="Impressions Dynamics" value="1.67M" delta="▲ 12.4%" up><Line data={[18, 20, 19, 21, 20, 22, 26]} color={M.blue} /></ChartCard>
          <ChartCard title="CTR Dynamics" value="4.92%" delta="▼ 0.3%" up={false}><Line data={[5.3, 5.1, 5.2, 5.0, 4.9, 4.95, 4.92]} color={M.purple} /></ChartCard>
          <ChartCard title="Avg Position Dynamics" value="6.5" delta="▲ improving" up><Line data={[9.2, 8.5, 8.1, 7.6, 7.0, 6.7, 6.5]} color={M.teal} invert /></ChartCard>
        </div>
      </div>
      <div style={{ background: "linear-gradient(180deg,#fff9f0,#fffdfa)", border: "1px solid #f6e2c4", borderLeft: `3px solid ${M.orange}`, borderRadius: 12, padding: "14px 16px", fontSize: 13, lineHeight: 1.55, color: M.inkSoft }}>
        <span style={{ fontSize: 10.5, fontWeight: 800, letterSpacing: ".07em", color: M.orange, display: "block", marginBottom: 5 }}>AI INSIGHT</span>
        Impressions grew <b style={{ color: M.ink }}>12.4%</b> while CTR dipped slightly — most gains landed on page 2. Your biggest opportunity is <b style={{ color: M.ink }}>title-tag optimization</b> on high-impression pages, which could convert existing visibility into an estimated <b style={{ color: M.ink }}>+2.4K clicks/month</b> at zero ad cost.
      </div>
    </>
  );
}

function PanelLanding() {
  const lp: [string, number, number, string, number, number, string, number][] = [
    ["/skills/rank-tracker", 428000, 8420, "1.97%", 4.2, 12400, "31%", 1840],
    ["/pricing", 182000, 3060, "1.68%", 6.5, 9800, "28%", 2210],
    ["/blog/gsc-api-guide", 156000, 5240, "3.36%", 5.1, 8600, "42%", 640],
    ["/tools/backlinks", 201000, 6180, "3.07%", 7.2, 7200, "39%", 910],
    ["/skills/seo-audit", 134000, 4110, "3.07%", 8.1, 5900, "45%", 520],
    ["/integrations/zapier", 74000, 1120, "1.51%", 11.4, 3400, "51%", 180],
    ["/blog/seo-checklist", 68000, 980, "1.44%", 9.8, 3100, "48%", 240],
  ];
  const best: [string, number, number, string][] = [["/skills/seo-audit", 3900, 5940, "+52.3%"], ["/tools/backlinks", 4200, 5600, "+33.3%"], ["/blog/gsc-api-guide", 5100, 6900, "+35.3%"], ["/pricing", 8200, 9800, "+19.5%"]];
  const worst: [string, number, number, string][] = [["/blog/old-pricing-2024", 3400, 2100, "-38.2%"], ["/legacy/report", 1800, 1200, "-33.3%"], ["/blog/2024-recap", 2600, 1950, "-25.0%"], ["/features-old", 1400, 1150, "-17.9%"]];
  return (
    <>
      <div style={{ marginBottom: 30 }}>
        <BlockHead title="Top Landing Pages" src="GSC + GA4" />
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 14 }}>
          <ChartCard title="By Clicks (GSC)"><Bars color={M.orange} rows={[{ k: "/skills/rank-tracker", v: 8420 }, { k: "/tools/backlinks", v: 6180 }, { k: "/blog/gsc-api-guide", v: 5240 }, { k: "/skills/seo-audit", v: 4110 }, { k: "/pricing", v: 3060 }]} /></ChartCard>
          <ChartCard title="By Sessions (GA4)"><Bars color={M.blue} rows={[{ k: "/skills/rank-tracker", v: 12400 }, { k: "/pricing", v: 9800 }, { k: "/blog/gsc-api-guide", v: 8600 }, { k: "/tools/backlinks", v: 7200 }, { k: "/skills/seo-audit", v: 5900 }]} /></ChartCard>
        </div>
      </div>
      <div style={{ marginBottom: 30 }}>
        <BlockHead title="Landing Page Performance" src="Heatmap · scrollable" />
        <Scroll min={720}>
          <thead><tr><th style={th}>Landing Page</th><th style={thNum}>Impr.</th><th style={thNum}>Clicks</th><th style={thNum}>CTR</th><th style={thNum}>Avg Pos</th><th style={thNum}>Sessions</th><th style={thNum}>Bounce</th><th style={thNum}>Key Events</th></tr></thead>
          <tbody>
            {lp.map((r) => (
              <tr key={r[0]}>
                <td style={{ ...td, ...urlStyle }}>{r[0]}</td>
                <td style={tdNum}><Heat bg={heat(r[1], 60000, 430000, "b")}>{(r[1] / 1000).toFixed(0)}k</Heat></td>
                <td style={tdNum}><Heat bg={heat(r[2], 900, 8500, "g")}>{r[2].toLocaleString()}</Heat></td>
                <td style={tdNum}>{r[3]}</td>
                <td style={tdNum}><Heat bg={heat(12 - r[4], 0, 8, "g")}>{r[4]}</Heat></td>
                <td style={tdNum}>{r[5].toLocaleString()}</td>
                <td style={tdNum}>{r[6]}</td>
                <td style={tdNum}>{r[7].toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </Scroll>
      </div>
      <div>
        <BlockHead title="Best & Worst Performers" src="GA4 · sessions MoM" />
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 16 }}>
          <div>
            <h4 style={{ fontSize: 12, fontWeight: 800, marginBottom: 9, display: "flex", alignItems: "center", gap: 6 }}><span style={{ width: 8, height: 8, borderRadius: "50%", background: M.green }} /> Best Performers</h4>
            <Scroll min={280}>
              <thead><tr><th style={th}>Page</th><th style={thNum}>2mo</th><th style={thNum}>1mo</th><th style={thNum}>Growth</th></tr></thead>
              <tbody>{best.map((r) => <tr key={r[0]}><td style={{ ...td, ...urlStyle }}>{r[0]}</td><td style={tdNum}>{r[1].toLocaleString()}</td><td style={tdNum}>{r[2].toLocaleString()}</td><td style={{ ...tdNum, color: M.green }}>{r[3]}</td></tr>)}</tbody>
            </Scroll>
          </div>
          <div>
            <h4 style={{ fontSize: 12, fontWeight: 800, marginBottom: 9, display: "flex", alignItems: "center", gap: 6 }}><span style={{ width: 8, height: 8, borderRadius: "50%", background: M.red }} /> Worst Performers</h4>
            <Scroll min={280}>
              <thead><tr><th style={th}>Page</th><th style={thNum}>2mo</th><th style={thNum}>1mo</th><th style={thNum}>Loss</th></tr></thead>
              <tbody>{worst.map((r) => <tr key={r[0]}><td style={{ ...td, ...urlStyle }}>{r[0]}</td><td style={tdNum}>{r[1].toLocaleString()}</td><td style={tdNum}>{r[2].toLocaleString()}</td><td style={{ ...tdNum, color: M.red }}>{r[3]}</td></tr>)}</tbody>
            </Scroll>
          </div>
        </div>
      </div>
    </>
  );
}

function PanelKeywords() {
  const kw: { type: "page" | "q"; cells: string[] }[] = [
    { type: "page", cells: ["/skills/rank-tracker"] },
    { type: "q", cells: ["keyword rank tracker", "1,240", "18,400", "6.7%", "4.2"] },
    { type: "q", cells: ["rank tracking tool", "620", "9,100", "6.8%", "5.9"] },
    { type: "q", cells: ["serp rank checker", "410", "7,800", "5.3%", "8.1"] },
    { type: "page", cells: ["/tools/backlinks"] },
    { type: "q", cells: ["free backlink checker", "980", "14,200", "6.9%", "5.1"] },
    { type: "q", cells: ["backlink analysis tool", "540", "8,600", "6.3%", "7.4"] },
    { type: "page", cells: ["/blog/gsc-api-guide"] },
    { type: "q", cells: ["gsc api tutorial", "760", "11,300", "6.7%", "3.8"] },
    { type: "q", cells: ["search console api python", "430", "6,900", "6.2%", "6.5"] },
  ];
  return (
    <>
      <div style={{ marginBottom: 30 }}>
        <BlockHead title="Brand Visibility Dynamics" src="GSC · branded queries" />
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 14 }}>
          <ChartCard title="Branded Impressions" value="148K" delta="▲ 18.2%" up><Line data={[95, 102, 110, 118, 128, 138, 148]} color={M.blue} /></ChartCard>
          <ChartCard title="Branded Clicks" value="21.4K" delta="▲ 22.7%" up><Line data={[12, 14, 15, 17, 18, 20, 21.4]} color={M.purple} /></ChartCard>
        </div>
      </div>
      <div>
        <BlockHead title="Top Queries by Landing Page" src="GSC · grouped" />
        <Scroll min={560}>
          <thead><tr><th style={th}>Query / Landing Page</th><th style={thNum}>Clicks</th><th style={thNum}>Impr.</th><th style={thNum}>CTR</th><th style={thNum}>Avg Pos</th></tr></thead>
          <tbody>
            {kw.map((r, i) => r.type === "page" ? (
              <tr key={i} style={{ background: "#fbfbfa" }}><td style={{ ...td, ...urlStyle, fontWeight: 700, color: M.ink }}>⏷ {r.cells[0]}</td><td style={td} colSpan={4} /></tr>
            ) : (
              <tr key={i}><td style={{ ...td, paddingLeft: 26 }}>{r.cells[0]}</td><td style={tdNum}>{r.cells[1]}</td><td style={tdNum}>{r.cells[2]}</td><td style={tdNum}>{r.cells[3]}</td><td style={tdNum}>{r.cells[4]}</td></tr>
            ))}
          </tbody>
        </Scroll>
      </div>
    </>
  );
}

function PanelAi() {
  const kpis = [["Sessions", "7.79K", "▲ 41.2%"], ["Total Users", "6.68K", "▲ 38.5%"], ["New Users", "5.30K", "▲ 44.1%"], ["Key Events", "407", "▲ 29.8%"]];
  const src: [string, number, number, number, string, string, number, string][] = [
    ["chatgpt.com", 3140, 2760, 2097, "3:41", "1.24%", 133, M.green],
    ["copilot.microsoft.com", 2100, 1810, 1595, "2:47", "0.78%", 115, M.blue],
    ["perplexity.ai", 588, 536, 480, "3:19", "1.36%", 50, M.purple],
    ["gemini.google.com", 291, 243, 174, "2:52", "2.06%", 38, M.orange],
    ["claude.ai", 252, 210, 150, "3:47", "2.38%", 16, M.teal],
    ["meta.ai", 300, 260, 202, "3:20", "1.79%", 44, M.red],
    ["others", 119, 100, 82, "1:35", "0.00%", 8, M.inkMute],
  ];
  return (
    <>
      <div style={{ marginBottom: 30 }}>
        <BlockHead title="AI Traffic Summary" src="GA4 · AI referrers" />
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: 10 }}>
          {kpis.map((k) => <Kpi key={k[0]} k={k[0]} v={k[1]} d={k[2]} up />)}
        </div>
      </div>
      <div style={{ marginBottom: 30 }}>
        <BlockHead title="AI Traffic Sources" src="GA4 · session source" />
        <Scroll min={640}>
          <thead><tr><th style={th}>Session Source</th><th style={thNum}>Sessions</th><th style={thNum}>Total Users</th><th style={thNum}>New Users</th><th style={thNum}>Avg Dur.</th><th style={thNum}>Bounce</th><th style={thNum}>Key Events</th></tr></thead>
          <tbody>
            {src.map((r) => (
              <tr key={r[0]}>
                <td style={{ ...td, fontWeight: 600 }}><span style={{ display: "inline-block", width: 8, height: 8, borderRadius: "50%", background: r[7], marginRight: 7 }} />{r[0]}</td>
                <td style={tdNum}>{r[1].toLocaleString()}</td><td style={tdNum}>{r[2].toLocaleString()}</td><td style={tdNum}>{r[3].toLocaleString()}</td><td style={tdNum}>{r[4]}</td><td style={tdNum}>{r[5]}</td><td style={tdNum}>{r[6]}</td>
              </tr>
            ))}
          </tbody>
        </Scroll>
      </div>
      <div>
        <BlockHead title="AI Traffic Trend (Weekly Sessions by Source)" src="Stacked" />
        <div style={{ display: "flex", gap: 14, fontSize: 11, color: M.inkMute, marginBottom: 10, flexWrap: "wrap" }}>
          {AI_SERIES.map((s) => <span key={s.name} style={{ display: "inline-flex", alignItems: "center", gap: 5 }}><span style={{ width: 8, height: 8, borderRadius: "50%", background: s.color }} />{s.name}</span>)}
        </div>
        <div style={{ border: `1px solid ${M.line}`, borderRadius: 13, padding: "15px 16px" }}><AiStacked /></div>
      </div>
    </>
  );
}

function PanelBlog() {
  const kpis = [["Blog Sessions", "18.9K", "▲ 15.6%"], ["Blog Users", "15.2K", "▲ 12.8%"], ["New Users", "11.7K", "▲ 18.3%"], ["Key Events", "1.94K", "▲ 9.4%"]];
  const blog: [string, number, number, number, string, string, number][] = [
    ["/blog/gsc-api-guide", 4200, 3400, 2600, "4:12", "42%", 320],
    ["/blog/seo-checklist", 3100, 2500, 1900, "3:48", "48%", 210],
    ["/blog/keyword-research", 2800, 2200, 1700, "3:31", "45%", 180],
    ["/blog/rank-tracking-101", 2100, 1700, 1300, "3:05", "51%", 140],
    ["/blog/technical-seo", 1600, 1300, 980, "4:41", "38%", 160],
    ["/blog/backlink-guide", 1400, 1100, 820, "3:52", "44%", 110],
  ];
  const bBest: [string, string, string][] = [["/blog/technical-seo", "+680", "+73.9%"], ["/blog/gsc-api-guide", "+920", "+28.0%"], ["/blog/keyword-research", "+540", "+23.9%"]];
  const bWorst: [string, string, string][] = [["/blog/2024-recap", "-410", "-42.1%"], ["/blog/old-guide", "-280", "-31.5%"], ["/blog/news-jan", "-190", "-22.4%"]];
  return (
    <>
      <div style={{ marginBottom: 30 }}>
        <BlockHead title="Blog Overview" src="GA4" />
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: 10 }}>
          {kpis.map((k) => <Kpi key={k[0]} k={k[0]} v={k[1]} d={k[2]} up />)}
        </div>
      </div>
      <div style={{ marginBottom: 30 }}>
        <BlockHead title="Blog Page Performance" src="GA4 · scrollable" />
        <Scroll min={640}>
          <thead><tr><th style={th}>Blog Page</th><th style={thNum}>Sessions</th><th style={thNum}>Users</th><th style={thNum}>New Users</th><th style={thNum}>Avg Engage</th><th style={thNum}>Bounce</th><th style={thNum}>Key Events</th></tr></thead>
          <tbody>{blog.map((r) => <tr key={r[0]}><td style={{ ...td, ...urlStyle }}>{r[0]}</td><td style={tdNum}>{r[1].toLocaleString()}</td><td style={tdNum}>{r[2].toLocaleString()}</td><td style={tdNum}>{r[3].toLocaleString()}</td><td style={tdNum}>{r[4]}</td><td style={tdNum}>{r[5]}</td><td style={tdNum}>{r[6]}</td></tr>)}</tbody>
        </Scroll>
      </div>
      <div style={{ marginBottom: 30 }}>
        <BlockHead title="Top Blog Pages by Sessions" src="GA4" />
        <div style={{ border: `1px solid ${M.line}`, borderRadius: 13, padding: "15px 16px 10px" }}>
          <Bars color={M.purple} rows={[{ k: "/blog/gsc-api-guide", v: 4200 }, { k: "/blog/seo-checklist", v: 3100 }, { k: "/blog/keyword-research", v: 2800 }, { k: "/blog/rank-tracking-101", v: 2100 }, { k: "/blog/technical-seo", v: 1600 }]} />
        </div>
      </div>
      <div>
        <BlockHead title="Blog Best & Worst Performers" src="Period comparison" />
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 16 }}>
          <div>
            <h4 style={{ fontSize: 12, fontWeight: 800, marginBottom: 9, display: "flex", alignItems: "center", gap: 6 }}><span style={{ width: 8, height: 8, borderRadius: "50%", background: M.green }} /> Best Performers</h4>
            <Scroll min={260}>
              <thead><tr><th style={th}>Blog Page</th><th style={thNum}>Growth</th><th style={thNum}>%</th></tr></thead>
              <tbody>{bBest.map((r) => <tr key={r[0]}><td style={{ ...td, ...urlStyle }}>{r[0]}</td><td style={{ ...tdNum, color: M.green }}>{r[1]}</td><td style={{ ...tdNum, color: M.green }}>{r[2]}</td></tr>)}</tbody>
            </Scroll>
          </div>
          <div>
            <h4 style={{ fontSize: 12, fontWeight: 800, marginBottom: 9, display: "flex", alignItems: "center", gap: 6 }}><span style={{ width: 8, height: 8, borderRadius: "50%", background: M.red }} /> Worst Performers</h4>
            <Scroll min={260}>
              <thead><tr><th style={th}>Blog Page</th><th style={thNum}>Loss</th><th style={thNum}>%</th></tr></thead>
              <tbody>{bWorst.map((r) => <tr key={r[0]}><td style={{ ...td, ...urlStyle }}>{r[0]}</td><td style={{ ...tdNum, color: M.red }}>{r[1]}</td><td style={{ ...tdNum, color: M.red }}>{r[2]}</td></tr>)}</tbody>
            </Scroll>
          </div>
        </div>
      </div>
    </>
  );
}

const TABS = [
  { id: "overview", label: "Overview", Panel: PanelOverview },
  { id: "landing", label: "Landing Pages", Panel: PanelLanding },
  { id: "keywords", label: "Keyword Analysis", Panel: PanelKeywords },
  { id: "ai", label: "AI Traffic", Panel: PanelAi },
  { id: "blog", label: "Blog Performance", Panel: PanelBlog },
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

export default function SeoReportMock() {
  const [active, setActive] = useState(0);
  const rootRef = useRef<HTMLDivElement>(null);
  const pausedRef = useRef(false);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = rootRef.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => setVisible(e.isIntersecting), { threshold: 0.2 });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    if (!visible) return;
    const id = setInterval(() => {
      if (pausedRef.current || document.hidden) return;
      setActive((a) => (a + 1) % TABS.length);
    }, 2000);
    return () => clearInterval(id);
  }, [visible]);

  const ActivePanel = TABS[active].Panel;

  return (
    <div
      ref={rootRef}
      onMouseEnter={() => { pausedRef.current = true; }}
      onMouseLeave={() => { pausedRef.current = false; }}
      style={{ background: M.paper, border: `1px solid ${M.line}`, borderRadius: 18, boxShadow: "var(--shadow-lg)", overflow: "hidden", color: M.ink }}
    >
      {/* header */}
      <div style={{ padding: "24px 28px 20px", borderBottom: `1px solid ${M.line}` }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 14 }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
              <h2 style={{ fontSize: 22, fontWeight: 800, letterSpacing: "-.02em", margin: 0 }}>SEO Report Generator</h2>
              <div style={{ display: "flex", gap: 6 }}>
                <LogoBadge logo="/connectors/gsc.svg" label="Search Console" bg={M.orangeSoft} fg={M.orange} />
                <LogoBadge logo="/connectors/google-analytics.svg" label="GA4" bg={M.blueSoft} fg={M.blue} />
              </div>
            </div>
            <p style={{ color: M.inkMute, fontSize: 12.5, marginTop: 7 }}>
              <b style={{ color: M.inkSoft, fontWeight: 600 }}>www.easyfetcher.com</b> · Complete narrated SEO report from your connected data
            </p>
          </div>
          <div style={{ fontSize: 12, fontWeight: 600, color: M.inkSoft, border: `1px solid ${M.line}`, borderRadius: 9, padding: "8px 12px" }}>
            📅 Jan 1 – Jan 14, 2026 <span style={{ color: M.inkMute }}>vs prev period</span>
          </div>
        </div>
      </div>

      {/* tabs */}
      <div style={{ display: "flex", gap: 4, padding: "0 20px", borderBottom: `1px solid ${M.line}`, overflowX: "auto" }}>
        {TABS.map((t, i) => {
          const on = i === active;
          return (
            <button key={t.id} onClick={() => setActive(i)} style={{
              flexShrink: 0, padding: "13px 16px 12px", fontSize: 13.5, fontWeight: 700,
              color: on ? M.ink : M.inkMute, cursor: "pointer", background: "none", border: "none",
              borderBottom: `2.5px solid ${on ? M.orange : "transparent"}`, whiteSpace: "nowrap", fontFamily: "inherit", transition: "color .15s",
            }}>{t.label}</button>
          );
        })}
      </div>

      {/* active panel */}
      <div style={{ padding: "26px 28px 30px", minHeight: 460 }}>
        <ActivePanel />
      </div>

      {/* footer */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 28px", borderTop: `1px solid ${M.line}`, flexWrap: "wrap", gap: 12 }}>
        <span style={{ fontSize: 12, color: M.inkMute }}>Generated from connected Search Console + GA4 · Jan 1–14, 2026 · Mock preview data</span>
        <span style={{ display: "inline-flex", gap: 6 }}>
          {TABS.map((_, i) => <span key={i} style={{ width: i === active ? 18 : 6, height: 6, borderRadius: 999, background: i === active ? M.orange : M.line, transition: "width .2s, background .2s" }} />)}
        </span>
      </div>
    </div>
  );
}
