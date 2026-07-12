// Per-skill card banners — compact, static previews shown in the skill-card
// thumbnail slot (hub grid, related cards, install modal). When a skill has a
// banner here it replaces the generic category Thumbnail, so the card looks like
// the real thing. Register more per skill id as you build them.

import type { ComponentType } from "react";

const C = {
  ink: "#1e2433",
  ink2: "#3a4256",
  line: "#e2e8f0",
  line2: "#eef2f7",
  amber: "#f0900e",
  green: "#16a34a",
  greenSoft: "#e7f6ee",
  red: "#e0523d",
  redSoft: "#fbeae7",
  slate: "#94a3b8",
  slateSoft: "#eef1f6",
  panel: "#ffffff",
  blue: "#2f5fd0",
  blueSoft: "#e9effc",
  inkSoft: "#4b5563",
  you: "#f28c1e",
  c1: "#3b6fe0",
  c2: "#7c5cd6",
  c3: "#12a5a5",
  warn: "#d98a09",
  orange: "#f28c1e",
};

function Wrap({ children }: { children: React.ReactNode }) {
  return (
    <div style={{
      aspectRatio: "320 / 168", width: "100%",
      background: "linear-gradient(160deg, var(--bg-soft) 0%, var(--bg-soft-2) 100%)",
      borderBottom: "1px solid var(--border)", overflow: "hidden",
    }}>
      {children}
    </div>
  );
}

function spark(path: number[], ox: number, oy: number, w: number, h: number) {
  const min = Math.min(...path), max = Math.max(...path), range = max - min || 1;
  const pts = path.map((v, i) => [ox + (i / (path.length - 1)) * w, oy + ((v - min) / range) * h]);
  const d = pts.map((p, i) => (i ? "L" : "M") + p[0].toFixed(1) + " " + p[1].toFixed(1)).join(" ");
  return { d, last: pts[pts.length - 1] };
}

function RankTrackerBanner() {
  const rows = [
    { kw: "Claude Rank Tracker", rank: 2, delta: "+2", dir: "up" as const, path: [8, 7, 6, 5, 4, 3, 2] },
    { kw: "Claude SEO Tracker", rank: 3, delta: "0", dir: "flat" as const, path: [4, 3, 4, 3, 3, 4, 3] },
    { kw: "Keywords Rank Tracker", rank: 12, delta: "+6", dir: "up" as const, path: [22, 20, 18, 16, 14, 13, 12] },
  ];
  const stats: [string, string, boolean][] = [
    ["TOP 3", "2", false],
    ["TOP 10", "4", false],
    ["MOVER", "+6", true],
  ];
  const deltaTone = { up: [C.greenSoft, C.green, "▲"], down: [C.redSoft, C.red, "▼"], flat: [C.slateSoft, C.slate, "→"] };

  return (
    <Wrap>
      <svg viewBox="0 0 320 168" style={{ width: "100%", height: "100%", display: "block" }} preserveAspectRatio="xMidYMid meet">
        {/* header */}
        <text x="16" y="24" fontFamily="Inter" fontSize="9.5" fontWeight="800" fill={C.ink}>Keyword Rank Tracker</text>
        <rect x="238" y="15" width="66" height="13" rx="6.5" fill={C.blueSoft} />
        <circle cx="248" cy="21.5" r="2.4" fill={C.blue} />
        <text x="255" y="24.3" fontFamily="Inter" fontSize="6.8" fontWeight="700" fill={C.blue}>Live SERP API</text>

        {/* stat chips */}
        {stats.map((s, i) => (
          <g key={i} transform={`translate(${16 + i * 98}, 34)`}>
            <rect x="0" y="0" width="90" height="34" rx="9" fill={C.panel} stroke={C.line} />
            <text x="11" y="14" fontFamily="Inter" fontSize="6" fontWeight="700" letterSpacing="0.4" fill={C.slate}>{s[0]}</text>
            <text x="11" y="27" fontFamily="Inter" fontSize="14" fontWeight="800" fill={s[2] ? C.green : C.ink}>{s[1]}</text>
          </g>
        ))}

        {/* table header */}
        <text x="16" y="86" fontFamily="Inter" fontSize="6.2" fontWeight="700" letterSpacing="0.4" fill={C.slate}>KEYWORD</text>
        <text x="196" y="86" fontFamily="Inter" fontSize="6.2" fontWeight="700" letterSpacing="0.4" fill={C.slate}>RANK</text>
        <text x="234" y="86" fontFamily="Inter" fontSize="6.2" fontWeight="700" letterSpacing="0.4" fill={C.slate}>CHG</text>
        <text x="272" y="86" fontFamily="Inter" fontSize="6.2" fontWeight="700" letterSpacing="0.4" fill={C.slate}>TREND</text>
        <line x1="16" y1="91" x2="304" y2="91" stroke={C.line} strokeWidth="1" />

        {/* rows */}
        {rows.map((r, i) => {
          const y = 106 + i * 21;
          const [bg, fg, arrow] = deltaTone[r.dir];
          const sp = spark(r.path, 268, y - 9, 34, 10);
          return (
            <g key={i}>
              <text x="16" y={y} fontFamily="Inter" fontSize="8" fontWeight="700" fill={C.ink}>{r.kw}</text>
              <text x="196" y={y} fontFamily="Inter" fontSize="9.5" fontWeight="800" fill={C.ink}>#{r.rank}</text>
              <rect x="228" y={y - 9} width="30" height="12" rx="6" fill={bg} />
              <text x="243" y={y - 0.5} fontFamily="Inter" fontSize="6.5" fontWeight="700" fill={fg} textAnchor="middle">{arrow}{r.dir === "flat" ? "" : r.delta}</text>
              <path d={sp.d} fill="none" stroke={fg} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
              <circle cx={sp.last[0].toFixed(1)} cy={sp.last[1].toFixed(1)} r="1.8" fill={fg} />
              {i < rows.length - 1 && <line x1="16" y1={y + 6} x2="304" y2={y + 6} stroke={C.line2} strokeWidth="1" />}
            </g>
          );
        })}
      </svg>
    </Wrap>
  );
}

function CompetitorRankBanner() {
  const cols = [
    { label: "You", x: 140, color: C.you },
    { label: "semrush", x: 186, color: C.c1 },
    { label: "ahrefs", x: 232, color: C.c2 },
    { label: "moz", x: 278, color: C.c3 },
  ];
  const rows: { kw: string; ranks: number[] }[] = [
    { kw: "Keyword Rank Tracker", ranks: [4, 2, 6, 9] },
    { kw: "Best SEO Tools", ranks: [1, 3, 5, 8] },
    { kw: "Keyword Research Tool", ranks: [2, 6, 4, 5] },
  ];

  return (
    <Wrap>
      <svg viewBox="0 0 320 168" style={{ width: "100%", height: "100%", display: "block" }} preserveAspectRatio="xMidYMid meet">
        {/* header */}
        <text x="16" y="24" fontFamily="Inter" fontSize="9.5" fontWeight="800" fill={C.ink}>Competitor Rank Watch</text>
        <rect x="238" y="15" width="66" height="13" rx="6.5" fill={C.blueSoft} />
        <circle cx="248" cy="21.5" r="2.4" fill={C.blue} />
        <text x="255" y="24.3" fontFamily="Inter" fontSize="6.8" fontWeight="700" fill={C.blue}>Live SERP API</text>

        {/* table header */}
        <text x="16" y="52" fontFamily="Inter" fontSize="6.4" fontWeight="700" letterSpacing="0.4" fill={C.slate}>KEYWORD</text>
        {cols.map((c) => (
          <text key={c.label} x={c.x} y="52" fontFamily="Inter" fontSize="7.5" fontWeight="800" fill={c.color} textAnchor="middle">
            {c.label}
          </text>
        ))}
        <line x1="16" y1="58" x2="304" y2="58" stroke={C.line} strokeWidth="1" />

        {/* rows */}
        {rows.map((r, ri) => {
          const y = 78 + ri * 27;
          const best = Math.min(...r.ranks);
          const winner = r.ranks.indexOf(best);
          return (
            <g key={r.kw}>
              <text x="16" y={y} fontFamily="Inter" fontSize="8" fontWeight="700" fill={C.ink}>{r.kw}</text>
              {r.ranks.map((v, i) => {
                const win = i === winner;
                return (
                  <g key={i}>
                    <rect x={cols[i].x - 13} y={y - 10} width="26" height="14" rx="7" fill={win ? C.greenSoft : C.slateSoft} />
                    <text x={cols[i].x} y={y - 0.2} fontFamily="Inter" fontSize="8.5" fontWeight="800" fill={win ? C.green : C.inkSoft} textAnchor="middle">#{v}</text>
                  </g>
                );
              })}
              {ri < rows.length - 1 && <line x1="16" y1={y + 8} x2="304" y2={y + 8} stroke={C.line2} strokeWidth="1" />}
            </g>
          );
        })}

        <text x="16" y="160" fontFamily="Inter" fontSize="7" fontWeight="600" fill={C.slate}>Green = best rank · You lead 2 of 3 keywords</text>
      </svg>
    </Wrap>
  );
}

function SeoAuditBanner() {
  const R = 30, CIRC = 2 * Math.PI * R, score = 82;
  const counts: [string, string, string][] = [
    ["7", "Critical errors", C.red],
    ["11", "Warnings", C.warn],
    ["63", "Passed checks", C.green],
  ];
  return (
    <Wrap>
      <svg viewBox="0 0 320 168" style={{ width: "100%", height: "100%", display: "block" }} preserveAspectRatio="xMidYMid meet">
        {/* header */}
        <text x="16" y="24" fontFamily="Inter" fontSize="9.5" fontWeight="800" fill={C.ink}>SEO Audit</text>
        <text x="16" y="37" fontFamily="Inter" fontSize="7" fontWeight="600" fill={C.slate}>Search Console · PageSpeed · Crawl</text>

        {/* score ring */}
        <g transform="translate(0, 8)">
          <circle cx="58" cy="104" r={R} fill="none" stroke={C.line} strokeWidth="8" />
          <circle cx="58" cy="104" r={R} fill="none" stroke={C.orange} strokeWidth="8" strokeLinecap="round"
            strokeDasharray={CIRC} strokeDashoffset={CIRC * (1 - score / 100)} transform="rotate(-90 58 104)" />
          <text x="58" y="106" fontFamily="Inter" fontSize="18" fontWeight="800" fill={C.ink} textAnchor="middle">{score}</text>
          <text x="58" y="117" fontFamily="Inter" fontSize="5.6" fontWeight="700" letterSpacing="0.8" fill={C.slate} textAnchor="middle">SCORE</text>
          <text x="58" y="150" fontFamily="Inter" fontSize="7.5" fontWeight="800" fill={C.warn} textAnchor="middle">Good · 18 issues</text>
        </g>

        {/* counts */}
        <text x="120" y="70" fontFamily="Inter" fontSize="8" fontWeight="700" letterSpacing="0.3" fill={C.inkSoft}>ISSUES FOUND</text>
        {counts.map((c, i) => {
          const y = 92 + i * 24;
          return (
            <g key={i}>
              <rect x="120" y={y - 10} width="12" height="12" rx="3" fill={c[2]} opacity="0.15" />
              <circle cx="126" cy={y - 4} r="2.4" fill={c[2]} />
              <text x="140" y={y} fontFamily="Inter" fontSize="13" fontWeight="800" fill={c[2]}>{c[0]}</text>
              <text x={c[0].length > 1 ? 158 : 152} y={y} fontFamily="Inter" fontSize="9.5" fontWeight="600" fill={C.inkSoft}>{c[1]}</text>
            </g>
          );
        })}
      </svg>
    </Wrap>
  );
}

export const CARD_BANNERS: Record<string, ComponentType> = {
  "keyword-rank-tracker": RankTrackerBanner,
  "competitor-rank-watch": CompetitorRankBanner,
  "seo-audit": SeoAuditBanner,
};
