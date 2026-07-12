import type { ReactNode } from "react";
import { SOURCES, getDetail, type Skill } from "@/lib/skills";
import Icon from "./Icon";

// "See it in action" — a Claude chat-output preview card. Uses a per-skill
// `sample` table when present, otherwise a clean checklist of the skill's outputs.

function StatusPill({ dir, change }: { dir: "up" | "down" | "flat"; change: string }) {
  const map: Record<string, { bg: string; fg: string; arrow: string }> = {
    up: { bg: "rgba(22,163,74,.12)", fg: "#15803d", arrow: "▲" },
    down: { bg: "rgba(220,38,38,.12)", fg: "#b91c1c", arrow: "▼" },
    flat: { bg: "var(--bg-soft-2)", fg: "var(--gray)", arrow: "→" },
  };
  const m = map[dir] || map.flat;
  const label = dir === "flat" ? "No change" : `${change}`;
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 5, padding: "3px 9px", borderRadius: 999,
      background: m.bg, color: m.fg, fontSize: 12.5, fontWeight: 700, whiteSpace: "nowrap",
    }}>
      <span style={{ fontSize: 10 }}>{m.arrow}</span>{label}
    </span>
  );
}

function OutputBadge({ text }: { text: string }) {
  return (
    <div style={{
      display: "inline-flex", alignItems: "center", gap: 8, marginTop: 16,
      padding: "8px 14px", borderRadius: 999, background: "rgba(22,163,74,.1)",
      border: "1px solid rgba(22,163,74,.25)", color: "#15803d", fontSize: 13.5, fontWeight: 600,
    }}>
      <Icon name="check-circle-2" size={16} /> {text}
    </div>
  );
}

function OutputWindow({ skill, children, badge }: { skill: Skill; children: ReactNode; badge?: string }) {
  const sources = skill.sources.map((s) => SOURCES[s].label).join(" + ");
  return (
    <div style={{ background: "#fff", border: "1px solid var(--border)", borderRadius: 16, boxShadow: "var(--shadow-lg)", overflow: "hidden", maxWidth: 860, margin: "0 auto" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "12px 16px", background: "var(--ink)", borderBottom: "1px solid rgba(0,0,0,.2)" }}>
        <div style={{ display: "flex", gap: 7 }}>
          {["#ff5f57", "#febc2e", "#28c840"].map((c) => <span key={c} style={{ width: 11, height: 11, borderRadius: 999, background: c, opacity: 0.9 }} />)}
        </div>
        <span style={{ marginLeft: 6, display: "inline-flex", alignItems: "center", gap: 7, color: "rgba(255,255,255,.85)", fontSize: 13, fontWeight: 600 }}>
          <Icon name="sparkles" size={14} style={{ color: "var(--amber)" }} /> Claude
        </span>
        <span style={{ marginLeft: "auto", display: "inline-flex", alignItems: "center", gap: 6, color: "rgba(255,255,255,.5)", fontSize: 12 }}>
          <Icon name="database" size={13} /> {sources}
        </span>
      </div>
      <div style={{ padding: "22px 24px 26px" }}>
        <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 18 }}>
          <span style={{ background: "var(--bg-soft)", border: "1px solid var(--border)", borderRadius: "12px 12px 4px 12px", padding: "9px 13px", fontSize: 13.5, color: "var(--ink-2)", fontWeight: 500 }}>
            run {skill.name}
          </span>
        </div>
        <div style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
          <span style={{ width: 30, height: 30, flex: "none", borderRadius: 8, display: "grid", placeItems: "center", background: "var(--ink)" }}>
            <Icon name="radar" size={16} style={{ color: "var(--amber)" }} />
          </span>
          <div style={{ flex: 1, minWidth: 0 }}>{children}{badge && <OutputBadge text={badge} />}</div>
        </div>
      </div>
    </div>
  );
}

export default function OutputPreview({ skill }: { skill: Skill }) {
  const det = getDetail(skill.id);
  const sample = det.sample;

  if (sample && sample.rows) {
    return (
      <OutputWindow skill={skill} badge={sample.badge}>
        <div style={{ border: "1px solid var(--border)", borderRadius: 12, overflow: "hidden" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13.5 }}>
            <thead>
              <tr style={{ background: "var(--bg-soft)" }}>
                {sample.columns.map((c, i) => (
                  <th key={i} style={{ textAlign: i === 0 ? "left" : "center", padding: "11px 14px", fontSize: 11.5, fontWeight: 700, letterSpacing: ".03em", textTransform: "uppercase", color: "var(--gray-2)", borderBottom: "1px solid var(--border)", whiteSpace: "nowrap" }}>{c}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {sample.rows.map((r, i) => (
                <tr key={i} style={{ borderBottom: i < sample.rows.length - 1 ? "1px solid var(--border-soft)" : "none" }}>
                  <td style={{ padding: "11px 14px", fontWeight: 600, color: "var(--ink)" }}>{r.kw}</td>
                  <td style={{ padding: "11px 14px", textAlign: "center", color: "var(--ink-2)", fontWeight: 700 }}>{r.tw}</td>
                  <td style={{ padding: "11px 14px", textAlign: "center", color: "var(--gray-2)" }}>{r.lw}</td>
                  <td style={{ padding: "11px 14px", textAlign: "center", color: "var(--gray)", fontWeight: 600 }}>{r.dir === "flat" ? "—" : r.change}</td>
                  <td style={{ padding: "11px 14px", textAlign: "center" }}><StatusPill dir={r.dir} change={r.change} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p style={{ marginTop: 16, fontSize: 14.5, lineHeight: 1.6, color: "var(--gray)" }}>{sample.summary}</p>
      </OutputWindow>
    );
  }

  const outputs = det.outputs || [];
  return (
    <OutputWindow skill={skill} badge="Ready to paste into your client report">
      <p style={{ fontSize: 14.5, lineHeight: 1.6, color: "var(--gray)", marginTop: 2 }}>
        Done — I pulled your live data and put together the {skill.name.toLowerCase()}. Here&apos;s what&apos;s included:
      </p>
      <div style={{ display: "flex", flexDirection: "column", gap: 11, marginTop: 14 }}>
        {outputs.map((o, i) => (
          <div key={i} style={{ display: "flex", gap: 11, alignItems: "flex-start", background: "var(--bg-soft)", border: "1px solid var(--border)", borderRadius: 10, padding: "11px 13px" }}>
            <Icon name="check" size={16} style={{ color: "var(--amber-strong)", marginTop: 2, flex: "none" }} />
            <span style={{ fontSize: 14, color: "var(--ink-2)", lineHeight: 1.45 }}>{o}</span>
          </div>
        ))}
      </div>
    </OutputWindow>
  );
}
