"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { IMAGES } from "@/lib/cloudinary";

// "See it in action" mock for the AI Traffic Report skill — ported from the
// Claude artifact (ai-traffic-report.html). A GA4 report of sessions arriving
// from AI assistants. Body auto-scrolls (ping-pong), pausing on hover / off-screen.
//
// LOGOS: all AI sources use real logos hosted on Cloudinary (see AI_LOGO_FILES).
// "Others" keeps the generic three-dot mark.

const M = {
  ink: "#14181f",
  inkSoft: "#4b5563",
  inkMute: "#8a94a3",
  line: "#eceef1",
  lineSoft: "#f4f5f7",
  paper: "#ffffff",
  orange: "#f28c1e",
  green: "#1a9e5f",
  red: "#e0523d",
  blue: "#3b6fe0",
  blueSoft: "#eaf0fd",
  slateSoft: "#eef1f6",
  mono: "ui-monospace, SFMono-Regular, Menlo, monospace",
};

// Brand colours for each AI source.
const BRAND: Record<string, string> = {
  chatgpt: "#10a37f", copilot: "#0a6dd8", perplexity: "#20b8cd", gemini: "#f28c1e",
  claude: "#d97757", meta: "#4267ee", grok: "#14181f", other: "#9aa3af",
};

// Real logos hosted on Cloudinary. Add more here to swap a placeholder mark.
const AI_LOGO_FILES: Record<string, string> = {
  chatgpt: IMAGES.connectors.chatgpt,
  gemini: IMAGES.connectors.gemini,
  perplexity: IMAGES.connectors.perplexity,
  grok: IMAGES.connectors.grok,
  claude: IMAGES.connectors.claude,
  copilot: IMAGES.connectors.copilot,
  meta: IMAGES.connectors.meta,
};

function AiLogo({ k }: { k: string }) {
  // Neutral white chip so every real logo keeps its own colours and stays crisp.
  const chip = (inner: ReactNode) => (
    <span style={{ width: 26, height: 26, borderRadius: 7, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", background: "#fff", border: `1px solid ${M.line}` }}>{inner}</span>
  );
  const file = AI_LOGO_FILES[k];
  if (file) {
    // eslint-disable-next-line @next/next/no-img-element
    return chip(<img src={file} alt={k} width={16} height={16} style={{ width: 16, height: 16, objectFit: "contain" }} />);
  }
  const c = BRAND[k];
  switch (k) {
    case "chatgpt":
      return chip(<svg width={17} height={17} viewBox="0 0 24 24" fill="none"><path d="M12 2a5 5 0 0 1 4.6 3A5 5 0 0 1 21 9.5a5 5 0 0 1-1 7.8A5 5 0 0 1 12 22a5 5 0 0 1-8-4.7A5 5 0 0 1 3 9.5 5 5 0 0 1 7.4 5 5 5 0 0 1 12 2Z" stroke={c} strokeWidth="1.6" /><path d="M12 8v4l3 1.7" stroke={c} strokeWidth="1.6" strokeLinecap="round" /></svg>);
    case "copilot":
      return chip(<svg width={17} height={17} viewBox="0 0 24 24" fill="none"><path d="M4 14c0-3 2-5 5-5 2 0 3 1 4 3 1-2 2-3 4-3 3 0 4 2 4 5s-2 5-5 5c-2 0-3-1-4-3-1 2-2 3-4 3-3 0-4-2-4-5Z" stroke={c} strokeWidth="1.5" /></svg>);
    case "perplexity":
      return chip(<svg width={17} height={17} viewBox="0 0 24 24" fill="none"><path d="M12 3v18M4 7l8 5 8-5M4 17l8-5 8 5M12 3 4 7v10M12 3l8 4v10" stroke={c} strokeWidth="1.4" strokeLinejoin="round" /></svg>);
    case "gemini":
      return chip(<svg width={17} height={17} viewBox="0 0 24 24" fill="none"><path d="M12 2c.4 5 5 9.6 10 10-5 .4-9.6 5-10 10-.4-5-5-9.6-10-10 5-.4 9.6-5 10-10Z" fill={c} /></svg>);
    case "meta":
      return chip(<svg width={17} height={17} viewBox="0 0 24 24" fill="none"><path d="M3 15c0-4 2-7 4.5-7 3 0 4 4.5 6 4.5S16 8 19 8c2 0 2.5 3 2.5 5" stroke={c} strokeWidth="1.6" fill="none" strokeLinecap="round" /></svg>);
    case "grok":
      return chip(<svg width={15} height={15} viewBox="0 0 24 24" fill="none"><path d="M5 19 17 5M9 19l8-9M7 9l5-4" stroke={c} strokeWidth="1.6" strokeLinecap="round" /></svg>);
    default:
      return chip(<svg width={15} height={15} viewBox="0 0 24 24" fill="none"><circle cx="6" cy="12" r="1.6" fill={c} /><circle cx="12" cy="12" r="1.6" fill={c} /><circle cx="18" cy="12" r="1.6" fill={c} /></svg>);
  }
}

interface Src { key: string; name: string; dom: string; sessions: number; users: number; newu: number; dur: string; bounce: string; ke: number; conv: string; }
const SOURCES: Src[] = [
  { key: "chatgpt", name: "ChatGPT", dom: "chatgpt.com", sessions: 3140, users: 2760, newu: 2097, dur: "3:41", bounce: "1.24%", ke: 133, conv: "6.1%" },
  { key: "copilot", name: "Copilot", dom: "copilot.microsoft.com", sessions: 2100, users: 1810, newu: 1595, dur: "2:47", bounce: "0.78%", ke: 115, conv: "5.5%" },
  { key: "meta", name: "Meta AI", dom: "meta.ai", sessions: 300, users: 260, newu: 202, dur: "3:20", bounce: "1.79%", ke: 44, conv: "5.2%" },
  { key: "perplexity", name: "Perplexity", dom: "perplexity.ai", sessions: 588, users: 536, newu: 480, dur: "3:19", bounce: "1.36%", ke: 50, conv: "8.5%" },
  { key: "gemini", name: "Gemini", dom: "gemini.google.com", sessions: 291, users: 243, newu: 174, dur: "2:52", bounce: "2.06%", ke: 38, conv: "4.1%" },
  { key: "claude", name: "Claude", dom: "claude.ai", sessions: 252, users: 210, newu: 150, dur: "3:47", bounce: "2.38%", ke: 16, conv: "7.9%" },
  { key: "grok", name: "Grok", dom: "grok.com", sessions: 129, users: 110, newu: 88, dur: "2:31", bounce: "1.90%", ke: 9, conv: "4.4%" },
  { key: "other", name: "Others", dom: "other AI referrers", sessions: 90, users: 80, newu: 64, dur: "1:35", bounce: "0.00%", ke: 8, conv: "3.0%" },
];
const SORTED = [...SOURCES].sort((a, b) => b.sessions - a.sessions);
const TOTAL = SOURCES.reduce((a, s) => a + s.sessions, 0);
const MAX_SESS = Math.max(...SOURCES.map((s) => s.sessions));

const th = { fontSize: 10, fontWeight: 700, letterSpacing: ".04em", textTransform: "uppercase" as const, color: M.inkMute, textAlign: "left" as const, padding: "11px 14px", borderBottom: `1px solid ${M.line}`, background: "#fbfbfa", whiteSpace: "nowrap" as const };
const thNum = { ...th, textAlign: "right" as const };
const td = { padding: "12px 14px", borderBottom: `1px solid ${M.lineSoft}`, fontSize: 13, whiteSpace: "nowrap" as const, verticalAlign: "middle" as const };
const tdNum = { ...td, textAlign: "right" as const, fontVariantNumeric: "tabular-nums" as const, fontWeight: 600 };

function BlockHead({ title, src }: { title: string; src?: string }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 9, marginBottom: 14 }}>
      <h3 style={{ fontSize: 14, fontWeight: 800, letterSpacing: "-.01em", margin: 0 }}>{title}</h3>
      {src && <span style={{ marginLeft: "auto", fontSize: 10, fontWeight: 700, padding: "3px 8px", borderRadius: 6, background: M.slateSoft, color: M.inkMute, letterSpacing: ".03em" }}>{src}</span>}
    </div>
  );
}

function Spark({ data }: { data: number[] }) {
  const w = 52, h = 20, min = Math.min(...data), max = Math.max(...data), r = max - min || 1;
  const d = data.map((v, i) => `${i ? "L" : "M"}${((i / (data.length - 1)) * w).toFixed(1)} ${((1 - (v - min) / r) * h).toFixed(1)}`).join(" ");
  return <svg width={w} height={h} style={{ position: "absolute", right: 14, bottom: 14, opacity: 0.55 }}><path d={d} fill="none" stroke={M.green} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" /></svg>;
}

function Kpi({ k, v, d, up, spark }: { k: string; v: string; d: string; up: boolean; spark?: number[] }) {
  return (
    <div style={{ border: `1px solid ${M.line}`, borderRadius: 12, padding: "15px 16px", position: "relative" }}>
      <div style={{ fontSize: 10.5, fontWeight: 700, letterSpacing: ".04em", textTransform: "uppercase", color: M.inkMute }}>{k}</div>
      <div style={{ fontSize: 26, fontWeight: 800, marginTop: 6, letterSpacing: "-.02em" }}>{v}</div>
      <div style={{ fontSize: 12, fontWeight: 700, marginTop: 3, color: up ? M.green : M.red }}>{d}</div>
      {spark && <Spark data={spark} />}
    </div>
  );
}

function WeeklyStacked() {
  const weeks = ["Week 50", "Week 51", "Week 52", "Week 1", "Week 2"];
  const series = [
    { name: "ChatGPT", color: BRAND.chatgpt, vals: [720, 150, 560, 640, 80] },
    { name: "Copilot", color: BRAND.copilot, vals: [480, 110, 360, 430, 55] },
    { name: "Perplexity", color: BRAND.perplexity, vals: [140, 35, 110, 130, 18] },
    { name: "Gemini", color: BRAND.gemini, vals: [80, 22, 62, 72, 10] },
    { name: "Claude", color: BRAND.claude, vals: [62, 18, 48, 58, 9] },
    { name: "Meta AI", color: BRAND.meta, vals: [70, 20, 54, 64, 10] },
    { name: "Others", color: BRAND.other, vals: [40, 12, 30, 35, 8] },
  ];
  const W = 900, H = 240, padL = 36, padB = 30, padT = 10, gap = 30;
  const totals = weeks.map((_, i) => series.reduce((a, s) => a + s.vals[i], 0));
  const max = Math.max(...totals) * 1.1;
  const bw = (W - padL - gap * weeks.length) / weeks.length;
  const els: ReactNode[] = [];
  for (let i = 0; i <= 4; i++) {
    const y = padT + (H - padT - padB) * i / 4;
    const val = Math.round(max * (1 - i / 4));
    els.push(<line key={`g${i}`} x1={padL} y1={y} x2={W} y2={y} stroke={M.line} strokeWidth="1" />);
    els.push(<text key={`gt${i}`} x={padL - 6} y={y + 3} fontSize="9" fill={M.inkMute} textAnchor="end">{val >= 1000 ? (val / 1000).toFixed(1) + "k" : val}</text>);
  }
  weeks.forEach((wk, i) => {
    let y = H - padB;
    const x = padL + gap / 2 + i * (bw + gap);
    series.forEach((s, si) => {
      const hh = (s.vals[i] / max) * (H - padT - padB);
      y -= hh;
      els.push(<rect key={`b${i}-${si}`} x={x} y={y} width={bw} height={hh} fill={s.color} />);
    });
    els.push(<text key={`wl${i}`} x={x + bw / 2} y={H - padB + 16} fontSize="10" fill={M.inkMute} textAnchor="middle">{wk}</text>);
    els.push(<text key={`wt${i}`} x={x + bw / 2} y={y - 6} fontSize="10" fontWeight="700" fill={M.ink} textAnchor="middle">{totals[i] >= 1000 ? (totals[i] / 1000).toFixed(1) + "k" : totals[i]}</text>);
  });
  const legend = series;
  return (
    <>
      <div style={{ display: "flex", gap: 14, fontSize: 11.5, color: M.inkSoft, marginBottom: 12, flexWrap: "wrap" }}>
        {legend.map((s) => <span key={s.name} style={{ display: "inline-flex", alignItems: "center", gap: 6 }}><span style={{ width: 9, height: 9, borderRadius: "50%", background: s.color }} />{s.name}</span>)}
      </div>
      <div style={{ border: `1px solid ${M.line}`, borderRadius: 13, padding: 16 }}>
        <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", height: "auto", display: "block" }}>{els}</svg>
      </div>
    </>
  );
}

function ReportBody() {
  const pages: [string, number, number][] = [
    ["/skills/rank-tracker", 2140, 118], ["/blog/gsc-api-guide", 1620, 74], ["/tools/backlinks", 1180, 61],
    ["/skills/seo-audit", 940, 52], ["/pricing", 780, 48], ["/blog/seo-checklist", 540, 28],
  ];
  const keMax = Math.max(...SOURCES.map((s) => s.ke));
  const sumUsers = SOURCES.reduce((a, s) => a + s.users, 0);
  const sumNew = SOURCES.reduce((a, s) => a + s.newu, 0);
  const sumKe = SOURCES.reduce((a, s) => a + s.ke, 0);

  return (
    <div style={{ padding: "24px 28px 8px", background: M.paper }}>
      {/* KPIs */}
      <div style={{ marginBottom: 30 }}>
        <BlockHead title="AI Traffic Summary" src="GA4 · AI referrers" />
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 12 }}>
          <Kpi k="Sessions" v="7.79K" d="▲ 41.2%" up spark={[3.1, 3.4, 4.0, 4.5, 5.2, 6.4, 7.8]} />
          <Kpi k="Total Users" v="6.68K" d="▲ 38.5%" up spark={[2.8, 3.1, 3.6, 4.1, 4.7, 5.5, 6.7]} />
          <Kpi k="New Users" v="5.30K" d="▲ 44.1%" up spark={[2.2, 2.6, 3.1, 3.6, 4.2, 4.8, 5.3]} />
          <Kpi k="Key Events" v="407" d="▲ 29.8%" up spark={[280, 300, 320, 350, 370, 390, 407]} />
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 12, marginTop: 12 }}>
          <Kpi k="% of All Sessions" v="14.3%" d="▲ 4.1pts" up />
          <Kpi k="Avg Session Dur." v="3:12" d="▲ 8.4%" up />
          <Kpi k="Avg Bounce Rate" v="1.31%" d="▼ 0.6pts" up />
          <Kpi k="Conv. Rate" v="5.22%" d="▲ 1.2pts" up />
        </div>
      </div>

      {/* Share bar */}
      <div style={{ marginBottom: 30 }}>
        <BlockHead title="Traffic Share by AI Source" src="Sessions" />
        <div style={{ display: "flex", height: 40, borderRadius: 10, overflow: "hidden", border: `1px solid ${M.line}` }}>
          {SORTED.map((s) => {
            const pct = s.sessions / TOTAL * 100;
            return <div key={s.key} title={`${s.name} ${pct.toFixed(1)}%`} style={{ flex: s.sessions, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10.5, fontWeight: 800, color: "#fff", minWidth: 0, background: BRAND[s.key] }}>{pct > 7 ? pct.toFixed(0) + "%" : ""}</div>;
          })}
        </div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 14, marginTop: 12, fontSize: 12, color: M.inkSoft }}>
          {SORTED.map((s) => (
            <span key={s.key} style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
              <span style={{ width: 9, height: 9, borderRadius: "50%", background: BRAND[s.key] }} />{s.name} <span style={{ color: M.inkMute, fontWeight: 600 }}>{(s.sessions / TOTAL * 100).toFixed(1)}%</span>
            </span>
          ))}
        </div>
      </div>

      {/* Detailed table */}
      <div style={{ marginBottom: 30 }}>
        <BlockHead title="AI Traffic Sources — Detailed" src="GA4 · session source" />
        <div style={{ overflowX: "auto", border: `1px solid ${M.line}`, borderRadius: 12 }}>
          <table style={{ width: "100%", minWidth: 780, borderCollapse: "collapse" }}>
            <thead><tr><th style={th}>AI Source</th><th style={thNum}>Sessions</th><th style={th}>Share</th><th style={thNum}>Total Users</th><th style={thNum}>New Users</th><th style={thNum}>Avg Dur.</th><th style={thNum}>Bounce</th><th style={thNum}>Key Events</th><th style={thNum}>Conv.</th></tr></thead>
            <tbody>
              {SORTED.map((s) => {
                const pct = (s.sessions / TOTAL * 100).toFixed(1);
                return (
                  <tr key={s.key}>
                    <td style={td}><div style={{ display: "flex", alignItems: "center", gap: 10 }}><AiLogo k={s.key} /><div><b style={{ fontWeight: 700, fontSize: 13 }}>{s.name}</b><small style={{ display: "block", fontSize: 11, color: M.inkMute, fontFamily: M.mono }}>{s.dom}</small></div></div></td>
                    <td style={tdNum}>{s.sessions.toLocaleString()}</td>
                    <td style={td}><span style={{ display: "inline-flex", alignItems: "center", gap: 7 }}><span style={{ width: 54, height: 6, borderRadius: 3, background: M.line, overflow: "hidden" }}><span style={{ display: "block", height: "100%", width: `${s.sessions / MAX_SESS * 100}%`, background: BRAND[s.key], borderRadius: 3 }} /></span>{pct}%</span></td>
                    <td style={tdNum}>{s.users.toLocaleString()}</td>
                    <td style={tdNum}>{s.newu.toLocaleString()}</td>
                    <td style={tdNum}>{s.dur}</td>
                    <td style={tdNum}>{s.bounce}</td>
                    <td style={tdNum}>{s.ke}</td>
                    <td style={tdNum}>{s.conv}</td>
                  </tr>
                );
              })}
              <tr>
                <td style={{ ...td, fontWeight: 800, background: "#fbfbfa", borderTop: `1.5px solid ${M.line}` }}>Grand total</td>
                <td style={{ ...tdNum, fontWeight: 800, background: "#fbfbfa", borderTop: `1.5px solid ${M.line}` }}>{TOTAL.toLocaleString()}</td>
                <td style={{ ...td, background: "#fbfbfa", borderTop: `1.5px solid ${M.line}` }} />
                <td style={{ ...tdNum, fontWeight: 800, background: "#fbfbfa", borderTop: `1.5px solid ${M.line}` }}>{sumUsers.toLocaleString()}</td>
                <td style={{ ...tdNum, fontWeight: 800, background: "#fbfbfa", borderTop: `1.5px solid ${M.line}` }}>{sumNew.toLocaleString()}</td>
                <td style={{ ...tdNum, fontWeight: 800, background: "#fbfbfa", borderTop: `1.5px solid ${M.line}` }}>3:12</td>
                <td style={{ ...tdNum, fontWeight: 800, background: "#fbfbfa", borderTop: `1.5px solid ${M.line}` }}>1.31%</td>
                <td style={{ ...tdNum, fontWeight: 800, background: "#fbfbfa", borderTop: `1.5px solid ${M.line}` }}>{sumKe}</td>
                <td style={{ ...tdNum, fontWeight: 800, background: "#fbfbfa", borderTop: `1.5px solid ${M.line}` }}>5.2%</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Weekly stacked */}
      <div style={{ marginBottom: 30 }}>
        <BlockHead title="Weekly Sessions by Source" src="Stacked · 5 weeks" />
        <WeeklyStacked />
      </div>

      {/* Two col */}
      <div style={{ marginBottom: 30, display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 16 }}>
        <div>
          <BlockHead title="Top AI Landing Pages" />
          <div style={{ overflowX: "auto", border: `1px solid ${M.line}`, borderRadius: 12 }}>
            <table style={{ width: "100%", minWidth: 280, borderCollapse: "collapse" }}>
              <thead><tr><th style={th}>Page</th><th style={thNum}>Sessions</th><th style={thNum}>Key Events</th></tr></thead>
              <tbody>{pages.map((p) => <tr key={p[0]}><td style={{ ...td, fontFamily: M.mono, fontSize: 11.5, color: M.inkSoft }}>{p[0]}</td><td style={tdNum}>{p[1].toLocaleString()}</td><td style={tdNum}>{p[2]}</td></tr>)}</tbody>
            </table>
          </div>
        </div>
        <div>
          <BlockHead title="Key Events by Source" />
          <div style={{ border: `1px solid ${M.line}`, borderRadius: 13, padding: 16, display: "flex", flexDirection: "column", gap: 11 }}>
            {SORTED.map((s) => (
              <div key={s.key} style={{ display: "grid", gridTemplateColumns: "26px 1fr 40px", alignItems: "center", gap: 10, fontSize: 12 }}>
                <AiLogo k={s.key} />
                <span style={{ height: 22, background: M.lineSoft, borderRadius: 6, overflow: "hidden" }}><span style={{ display: "block", height: "100%", width: `${(s.ke / keMax * 100).toFixed(1)}%`, background: BRAND[s.key], borderRadius: 6 }} /></span>
                <span style={{ textAlign: "right", fontWeight: 700 }}>{s.ke}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Insight */}
      <div style={{ marginBottom: 24, background: "linear-gradient(180deg,#fff9f0,#fffdfa)", border: "1px solid #f6e2c4", borderLeft: `3px solid ${M.orange}`, borderRadius: 12, padding: "14px 16px", fontSize: 13, lineHeight: 1.55, color: M.inkSoft }}>
        <span style={{ fontSize: 10.5, fontWeight: 800, letterSpacing: ".07em", color: M.orange, display: "block", marginBottom: 5 }}>AI INSIGHT</span>
        AI referral sessions jumped <b style={{ color: M.ink }}>41.2%</b> this period and now drive <b style={{ color: M.ink }}>14.3%</b> of all traffic. <b style={{ color: M.ink }}>ChatGPT</b> alone accounts for ~40% of AI visits with a strong <b style={{ color: M.ink }}>3:41</b> average duration. Perplexity and Claude convert best per visit — worth creating citation-friendly, well-structured content on your top pages to capture more of this fast-growing channel.
      </div>
    </div>
  );
}

export default function AiTrafficReportMock() {
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
    <div style={{ background: M.paper, border: `1px solid ${M.line}`, borderRadius: 18, boxShadow: "var(--shadow-lg)", overflow: "hidden", color: M.ink, maxWidth: 960, margin: "0 auto" }}>
      {/* header */}
      <div style={{ padding: "24px 28px 20px", borderBottom: `1px solid ${M.line}`, display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 14 }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
            <h2 style={{ fontSize: 22, fontWeight: 800, letterSpacing: "-.02em", margin: 0 }}>AI Traffic Report</h2>
            <span style={{ display: "inline-flex", alignItems: "center", gap: 5, fontSize: 11, fontWeight: 700, padding: "4px 9px 4px 6px", borderRadius: 20, background: M.blueSoft, color: M.blue }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/connectors/google-analytics.svg" alt="GA4" width={13} height={13} style={{ width: 13, height: 13, objectFit: "contain" }} /> GA4
            </span>
          </div>
          <p style={{ color: M.inkMute, fontSize: 12.5, marginTop: 7 }}>
            <b style={{ color: M.inkSoft, fontWeight: 600 }}>www.easyfetcher.com</b> · Sessions arriving from ChatGPT, Perplexity, Gemini &amp; other AI referrals
          </p>
        </div>
        <div style={{ fontSize: 12, fontWeight: 600, color: M.inkSoft, border: `1px solid ${M.line}`, borderRadius: 9, padding: "8px 12px" }}>
          📅 Jan 1 – Jan 14, 2026 <span style={{ color: M.inkMute }}>vs prev period</span>
        </div>
      </div>

      {/* scrollable body */}
      <div
        ref={scrollRef}
        onMouseEnter={() => { pausedRef.current = true; }}
        onMouseLeave={() => { pausedRef.current = false; }}
        style={{ maxHeight: 560, overflowY: "auto", boxShadow: "inset 0 -14px 20px -18px rgba(20,24,31,.18)" }}
      >
        <ReportBody />
      </div>

      {/* footer */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 28px", borderTop: `1px solid ${M.line}`, flexWrap: "wrap", gap: 12 }}>
        <span style={{ fontSize: 12, color: M.inkMute }}>Generated from connected GA4 · Jan 1–14, 2026 · Mock preview data</span>
      </div>
    </div>
  );
}
