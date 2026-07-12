import type { Skill, CategoryId } from "@/lib/skills";
import Icon from "./Icon";
import { CARD_BANNERS } from "./cardBanners";

// Minimal illustrative previews per category (no real screenshots) — clean SVG
// mock-ups in EasyFetcher's slate + amber palette.
const TH = {
  ink: "#1e2433",
  ink2: "#3a4256",
  line: "#e2e8f0",
  line2: "#eef2f7",
  amber: "#f0900e",
  amberS: "#fbbf24",
  slate: "#94a3b8",
  panel: "#ffffff",
};

export function Thumbnail({ cat }: { cat: CategoryId }) {
  const common = { width: "100%", height: "100%", display: "block" } as const;
  let art: React.ReactNode = null;

  if (cat === "rankings") {
    art = (
      <svg viewBox="0 0 320 168" style={common} preserveAspectRatio="xMidYMid meet">
        <rect x="16" y="16" width="180" height="136" rx="10" fill={TH.panel} stroke={TH.line} />
        <text x="30" y="38" fontFamily="Inter" fontSize="9" fontWeight="700" fill={TH.ink}>Visibility</text>
        <text x="30" y="52" fontFamily="Inter" fontSize="15" fontWeight="800" fill={TH.ink}>+24%</text>
        <polyline points="30,120 56,108 82,114 108,92 134,96 160,70 182,60" fill="none" stroke={TH.amber} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M30,120 56,108 82,114 108,92 134,96 160,70 182,60 182,138 30,138 Z" fill={TH.amber} opacity="0.08" />
        <circle cx="182" cy="60" r="3.2" fill={TH.amber} />
        <rect x="204" y="16" width="100" height="136" rx="10" fill={TH.panel} stroke={TH.line} />
        {[0, 1, 2, 3].map((i) => (
          <g key={i} transform={`translate(216, ${34 + i * 26})`}>
            <text x="0" y="0" fontFamily="Inter" fontSize="8" fontWeight="700" fill={TH.amber}>{i + 1}</text>
            <rect x="14" y="-7" width="48" height="6" rx="3" fill={i === 0 ? TH.ink : TH.line} />
            <rect x="68" y="-7" width="18" height="6" rx="3" fill={TH.line2} />
          </g>
        ))}
      </svg>
    );
  } else if (cat === "audits") {
    art = (
      <svg viewBox="0 0 320 168" style={common} preserveAspectRatio="xMidYMid meet">
        <rect x="16" y="16" width="120" height="136" rx="10" fill={TH.panel} stroke={TH.line} />
        <circle cx="76" cy="72" r="34" fill="none" stroke={TH.line} strokeWidth="9" />
        <circle cx="76" cy="72" r="34" fill="none" stroke={TH.amber} strokeWidth="9" strokeLinecap="round" strokeDasharray="213" strokeDashoffset="55" transform="rotate(-90 76 72)" />
        <text x="76" y="70" fontFamily="Inter" fontSize="17" fontWeight="800" fill={TH.ink} textAnchor="middle">82</text>
        <text x="76" y="84" fontFamily="Inter" fontSize="7.5" fontWeight="600" fill={TH.slate} textAnchor="middle">SCORE</text>
        <rect x="144" y="16" width="160" height="136" rx="10" fill={TH.panel} stroke={TH.line} />
        {[0, 1, 2, 3].map((i) => (
          <g key={i} transform={`translate(158, ${38 + i * 26})`}>
            <rect x="0" y="-9" width="13" height="13" rx="4" fill={i < 2 ? "#16a34a" : i === 2 ? TH.amberS : "#ef4444"} opacity="0.16" />
            <path d={i < 2 ? "M3,-3 l3,3 l4,-6" : "M3,-5 l6,6 M9,-5 l-6,6"} fill="none" stroke={i < 2 ? "#16a34a" : i === 2 ? "#d97706" : "#ef4444"} strokeWidth="1.6" strokeLinecap="round" />
            <rect x="22" y="-8" width={[92, 74, 84, 60][i]} height="6" rx="3" fill={TH.ink} opacity="0.8" />
            <rect x="22" y="0" width={[60, 48, 40, 36][i]} height="4" rx="2" fill={TH.line} />
          </g>
        ))}
      </svg>
    );
  } else if (cat === "reporting") {
    art = (
      <svg viewBox="0 0 320 168" style={common} preserveAspectRatio="xMidYMid meet">
        <rect x="92" y="14" width="136" height="142" rx="10" fill={TH.panel} stroke={TH.line} />
        <rect x="108" y="30" width="70" height="8" rx="4" fill={TH.ink} />
        <rect x="108" y="44" width="104" height="4" rx="2" fill={TH.line} />
        <g transform="translate(108,62)">
          {[42, 30, 52, 24].map((h, i) => (
            <g key={i} transform={`translate(${i * 28},0)`}>
              <rect x="0" y={56 - h} width="16" height={h} rx="3" fill={i === 2 ? TH.amber : TH.line} />
            </g>
          ))}
        </g>
        <rect x="108" y="128" width="104" height="5" rx="2.5" fill={TH.line} />
        <rect x="108" y="139" width="76" height="5" rx="2.5" fill={TH.line2} />
        <g transform="translate(20,40)">
          <rect x="0" y="0" width="58" height="34" rx="8" fill={TH.amber} opacity="0.1" />
          <text x="12" y="18" fontFamily="Inter" fontSize="13" fontWeight="800" fill="#d97706">12.4k</text>
          <text x="12" y="29" fontFamily="Inter" fontSize="7" fontWeight="600" fill={TH.slate}>CLICKS</text>
        </g>
        <g transform="translate(20,84)">
          <rect x="0" y="0" width="58" height="34" rx="8" fill={TH.panel} stroke={TH.line} />
          <text x="12" y="18" fontFamily="Inter" fontSize="13" fontWeight="800" fill={TH.ink}>3.1%</text>
          <text x="12" y="29" fontFamily="Inter" fontSize="7" fontWeight="600" fill={TH.slate}>CTR</text>
        </g>
      </svg>
    );
  } else if (cat === "research") {
    art = (
      <svg viewBox="0 0 320 168" style={common} preserveAspectRatio="xMidYMid meet">
        <rect x="16" y="16" width="288" height="136" rx="10" fill={TH.panel} stroke={TH.line} />
        <text x="32" y="40" fontFamily="Inter" fontSize="9" fontWeight="700" fill={TH.ink}>Keyword gaps</text>
        <g fontFamily="Inter" fontSize="8" fontWeight="600">
          {[{ k: 62, m: 90 }, { k: 40, m: 78 }, { k: 50, m: 60 }, { k: 24, m: 96 }].map((r, i) => (
            <g key={i} transform={`translate(32,${54 + i * 22})`}>
              <rect x="0" y="0" width="56" height="9" rx="4.5" fill={TH.line2} />
              <rect x="0" y="0" width={r.k * 0.56} height="9" rx="4.5" fill={TH.slate} />
              <rect x="148" y="0" width="108" height="9" rx="4.5" fill={TH.line2} />
              <rect x="148" y="0" width={r.m * 1.08} height="9" rx="4.5" fill={TH.amber} opacity={i === 3 ? 1 : 0.55} />
            </g>
          ))}
        </g>
        <text x="32" y="148" fontFamily="Inter" fontSize="7.5" fontWeight="600" fill={TH.slate}>You</text>
        <text x="148" y="148" fontFamily="Inter" fontSize="7.5" fontWeight="600" fill="#d97706">Competitor — opportunity</text>
      </svg>
    );
  } else {
    // ai-search
    art = (
      <svg viewBox="0 0 320 168" style={common} preserveAspectRatio="xMidYMid meet">
        <rect x="16" y="16" width="288" height="136" rx="10" fill={TH.panel} stroke={TH.line} />
        <g transform="translate(32,30)">
          <rect x="0" y="0" width="14" height="14" rx="7" fill={TH.ink} />
          <rect x="22" y="2" width="150" height="10" rx="5" fill={TH.line} />
        </g>
        <g transform="translate(32,54)">
          <rect x="0" y="0" width="244" height="58" rx="9" fill="#fffaf0" stroke="#fde9c8" />
          <rect x="14" y="13" width="180" height="6" rx="3" fill={TH.ink2} />
          <rect x="14" y="25" width="210" height="6" rx="3" fill={TH.line} />
          <g transform="translate(14,40)">
            <rect x="0" y="0" width="58" height="13" rx="6.5" fill={TH.amber} opacity="0.16" />
            <circle cx="9" cy="6.5" r="3.5" fill={TH.amber} />
            <text x="18" y="9.5" fontFamily="Inter" fontSize="7.5" fontWeight="700" fill="#d97706">easyfetcher.com</text>
          </g>
        </g>
        <text x="32" y="138" fontFamily="Inter" fontSize="8" fontWeight="600" fill={TH.slate}>Cited 14× this week</text>
      </svg>
    );
  }

  return (
    <div style={{
      aspectRatio: "320 / 168", width: "100%",
      background: "linear-gradient(160deg, var(--bg-soft) 0%, var(--bg-soft-2) 100%)",
      borderBottom: "1px solid var(--border)", overflow: "hidden",
    }}>{art}</div>
  );
}

// The per-skill demo slot: a skill-specific banner when one exists, otherwise
// the generic category illustration. Pass `thumbnailOnly` to force the generic
// illustration (e.g. in the hero when the full mock renders elsewhere on the page).
export function SkillMedia({ skill, rounded = false, showBadge = true, thumbnailOnly = false }: { skill: Skill; rounded?: boolean; showBadge?: boolean; thumbnailOnly?: boolean }) {
  const Banner = thumbnailOnly ? undefined : CARD_BANNERS[skill.id];
  return (
    <div style={{ position: "relative", borderRadius: rounded ? 14 : 0, overflow: "hidden", border: rounded ? "1px solid var(--border)" : "none" }}>
      {Banner ? <Banner /> : <Thumbnail cat={skill.cat} />}
      {showBadge && (
        <span style={{
          position: "absolute", bottom: 10, right: 10, display: "inline-flex", alignItems: "center", gap: 6,
          padding: "5px 10px", borderRadius: 999, background: "rgba(15,23,42,.78)", color: "#fff",
          fontSize: 11.5, fontWeight: 600, letterSpacing: "-.01em", backdropFilter: "blur(4px)",
        }}>
          <Icon name="image" size={12} style={{ color: "var(--yellow)" }} /> Preview
        </span>
      )}
    </div>
  );
}
