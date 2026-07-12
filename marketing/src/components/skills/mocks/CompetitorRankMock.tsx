// Hero mock for the Competitor Rank Watch skill page — ported from the Claude
// artifact (competitor-rank-watch.html). Compact dashboard: player legend,
// summary stats, and a rank-by-keyword table comparing you vs 3 rivals.
// Static (no interactivity) so it costs nothing at runtime.

const M = {
  ink: "#14181f",
  inkSoft: "#4b5563",
  inkMute: "#8a94a3",
  line: "#eceef1",
  lineSoft: "#f4f5f7",
  paper: "#ffffff",
  green: "#1a9e5f",
  greenSoft: "#e7f6ee",
  red: "#e0523d",
  redSoft: "#fbeae7",
  slateSoft: "#eef1f6",
  you: "#f28c1e",
  c1: "#3b6fe0",
  c2: "#7c5cd6",
  c3: "#12a5a5",
};

const PLAYERS = [
  { name: "rankwatch.io", short: "YOU", color: M.you, you: true },
  { name: "semrush", color: M.c1 },
  { name: "ahrefs", color: M.c2 },
  { name: "moz", color: M.c3 },
];

const ROWS: { kw: string; ranks: (number | null)[] }[] = [
  { kw: "Keyword Rank Tracker", ranks: [4, 2, 6, 9] },
  { kw: "Best SEO Tools", ranks: [1, 3, 5, 8] },
  { kw: "Backlink Checker", ranks: [7, 4, 3, 11] },
  { kw: "Keyword Research Tool", ranks: [2, 6, 4, 5] },
  { kw: "SEO Rank Checker", ranks: [9, 5, 6, null] },
];

function standing(ranks: (number | null)[]) {
  const you = ranks[0];
  const compBest = Math.min(...(ranks.slice(1).filter((v) => v !== null) as number[]));
  if (you !== null && you < compBest) return { cls: "lead" as const, text: "Leading ▲" };
  if (you === null || you > compBest) return { cls: "behind" as const, text: "Behind ▼" };
  return { cls: "tie" as const, text: "Tied" };
}

export default function CompetitorRankMock() {
  const colors = [M.you, M.c1, M.c2, M.c3];
  const th = { fontSize: 8.5, fontWeight: 800, letterSpacing: "-.01em", padding: "0 4px 8px", textAlign: "center" as const };
  const stat = { border: `1px solid ${M.line}`, borderRadius: 11, padding: "10px 12px", background: M.paper };
  const statLabel = { fontSize: 8, fontWeight: 700, letterSpacing: ".05em", color: M.inkMute, textTransform: "uppercase" as const };

  return (
    <div style={{
      background: M.paper, border: `1px solid ${M.line}`, borderRadius: 16,
      boxShadow: "var(--shadow-lg)", padding: "18px 18px 16px", maxWidth: 560, marginLeft: "auto",
      color: M.ink,
    }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 10, flexWrap: "wrap" }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ fontSize: 15.5, fontWeight: 800, letterSpacing: "-.02em" }}>Competitor Rank Watch</span>
            <span style={{
              display: "inline-flex", alignItems: "center", gap: 4, fontSize: 9, fontWeight: 700,
              padding: "3px 7px", borderRadius: 20, background: "#e9effc", color: "#2f5fd0",
            }}>
              <span style={{ width: 7, height: 7, borderRadius: "50%", background: "#2f5fd0", display: "inline-block" }} />
              Live SERP API
            </span>
          </div>
          <p style={{ color: M.inkMute, fontSize: 10.5, marginTop: 4 }}>
            <b style={{ color: M.inkSoft, fontWeight: 600 }}>rankwatch.io</b> vs. 3 competitors · 5 keywords · United States
          </p>
        </div>
      </div>

      {/* Player legend */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 12 }}>
        {PLAYERS.map((p) => (
          <span key={p.name} style={{
            display: "inline-flex", alignItems: "center", gap: 6, fontSize: 10.5, fontWeight: p.you ? 700 : 600,
            padding: "4px 9px", border: `1px solid ${p.you ? M.you : M.line}`, borderRadius: 20,
            background: p.you ? "#fff4e6" : M.paper, color: M.inkSoft,
          }}>
            <span style={{ width: 8, height: 8, borderRadius: "50%", background: p.color }} />
            {p.name}{p.short && <span style={{ fontSize: 8.5, fontWeight: 800, color: M.you, letterSpacing: ".04em" }}>{p.short}</span>}
          </span>
        ))}
      </div>

      {/* Summary strip */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8, margin: "14px 0 12px" }}>
        <div style={stat}>
          <div style={statLabel}>You Lead</div>
          <div style={{ fontSize: 18, fontWeight: 800, letterSpacing: "-.02em", marginTop: 3 }}>2 <span style={{ fontSize: 11, color: M.inkMute, fontWeight: 600 }}>/ 5</span></div>
          <div style={{ fontSize: 9.5, marginTop: 1, fontWeight: 600, color: M.green }}>▲ 1 vs last week</div>
        </div>
        <div style={stat}>
          <div style={statLabel}>Avg. Rank (You)</div>
          <div style={{ fontSize: 18, fontWeight: 800, letterSpacing: "-.02em", marginTop: 3 }}>5.4</div>
          <div style={{ fontSize: 9.5, marginTop: 1, fontWeight: 600, color: M.green }}>▲ 1.2 improved</div>
        </div>
        <div style={stat}>
          <div style={statLabel}>Overtake Alerts</div>
          <div style={{ fontSize: 18, fontWeight: 800, letterSpacing: "-.02em", marginTop: 3, color: M.red }}>1</div>
          <div style={{ fontSize: 9.5, marginTop: 1, fontWeight: 600, color: M.red }}>ahrefs passed you</div>
        </div>
      </div>

      {/* Table */}
      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr>
            <th style={{ ...th, textAlign: "left", color: M.inkMute, fontSize: 8, letterSpacing: ".04em" }}>KEYWORD</th>
            {PLAYERS.map((p, i) => (
              <th key={p.name} style={{ ...th, color: colors[i] }}>{p.you ? "You" : p.name}</th>
            ))}
            <th style={{ ...th, color: M.inkMute, fontSize: 8, letterSpacing: ".04em" }}>STANDING</th>
          </tr>
        </thead>
        <tbody>
          {ROWS.map((r, ri) => {
            const valid = r.ranks.map((v, i) => ({ v, i })).filter((o) => o.v !== null) as { v: number; i: number }[];
            const best = Math.min(...valid.map((o) => o.v));
            const winnerIdx = valid.find((o) => o.v === best)!.i;
            const st = standing(r.ranks);
            const stTone = st.cls === "lead" ? [M.greenSoft, M.green] : st.cls === "behind" ? [M.redSoft, M.red] : [M.slateSoft, M.inkMute];
            const border = ri < ROWS.length - 1 ? `1px solid ${M.lineSoft}` : "none";
            return (
              <tr key={r.kw}>
                <td style={{ padding: "8px 4px", borderBottom: border }}>
                  <span style={{ fontSize: 10.5, fontWeight: 700 }}>{r.kw}</span>
                </td>
                {r.ranks.map((v, i) => (
                  <td key={i} style={{ padding: "8px 4px", textAlign: "center", borderBottom: border }}>
                    {v === null ? (
                      <span style={{ fontSize: 12, color: M.inkMute, fontWeight: 600 }}>—</span>
                    ) : (
                      <span style={{
                        display: "inline-flex", alignItems: "center", justifyContent: "center",
                        minWidth: 30, height: 26, borderRadius: 8, fontSize: 12.5, fontWeight: 800,
                        background: i === winnerIdx ? M.greenSoft : M.slateSoft,
                        color: i === winnerIdx ? M.green : M.inkSoft,
                        boxShadow: i === winnerIdx ? "inset 0 0 0 1.5px rgba(26,158,95,.35)" : "none",
                      }}>#{v}</span>
                    )}
                  </td>
                ))}
                <td style={{ padding: "8px 4px", textAlign: "center", borderBottom: border }}>
                  <span style={{
                    display: "inline-flex", alignItems: "center", gap: 3, fontSize: 9.5, fontWeight: 700,
                    padding: "3px 8px", borderRadius: 20, background: stTone[0], color: stTone[1], whiteSpace: "nowrap",
                  }}>{st.text}</span>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      {/* Footer meta */}
      <div style={{ marginTop: 10, fontSize: 9.5, color: M.inkMute }}>
        Competitor positions checked via external SERP API · Checked daily · Mock preview data
      </div>
    </div>
  );
}
