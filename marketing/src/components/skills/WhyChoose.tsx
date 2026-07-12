// "Why choose Easy Fetcher" — a per-skill benefits grid rendered right after the
// detail hero. Each point is solution-based (a real job the skill does for you).
// Register points per skill id below; skills without an entry simply skip the section.

import Icon from "./Icon";
import { Eyebrow } from "./primitives";

export interface WhyPoint {
  icon: string;
  title: string;
  desc: string;
}

export const WHY_CHOOSE: Record<string, WhyPoint[]> = {
  "keyword-rank-tracker": [
    {
      icon: "message-square",
      title: "You choose the keywords",
      desc: "Drop your keyword list into Claude and it checks live positions on demand — you decide what to track and when, with no dashboard to maintain.",
    },
    {
      icon: "layout-grid",
      title: "Rankings, clicks & traffic together",
      desc: "Connect Search Console and GA4 and Claude shows each keyword’s live rank right beside its clicks and sessions — the whole picture in one answer.",
    },
    {
      icon: "file-text",
      title: "A client report in ~2 minutes",
      desc: "Ask “build a ranking report for acme.com” and get a written, share-ready recap of positions, movement and wins to send straight to the client.",
    },
    {
      icon: "sparkles",
      title: "Ask what to do about the drops",
      desc: "When a keyword slips, ask Claude why — and get a specific fix, from refreshing the page to adding internal links or matching search intent.",
    },
    {
      icon: "compass",
      title: "Any market you sell in",
      desc: "Check the same keywords in the US, UK, India or anywhere else — just tell Claude which country to look in and it pulls that SERP.",
    },
    {
      icon: "trending-up",
      title: "See the trend, not just today",
      desc: "Every position comes with its recent movement, so you know whether a keyword is climbing, sliding or holding before you decide to act.",
    },
  ],
};

export default function WhyChoose({ points }: { points: WhyPoint[] }) {
  return (
    <section style={{ background: "var(--bg-soft)", padding: "76px 0", borderTop: "1px solid var(--border)" }}>
      <div className="wrap">
        <div style={{ textAlign: "center", maxWidth: 640, margin: "0 auto 48px" }}>
          <div style={{ display: "flex", justifyContent: "center" }}><Eyebrow>Why Easy Fetcher</Eyebrow></div>
          <h2 style={{ fontSize: 34, fontWeight: 800, letterSpacing: "-0.025em", marginTop: 14, color: "var(--ink)" }}>
            Why choose Easy Fetcher
          </h2>
          <p style={{ fontSize: 17, lineHeight: 1.6, color: "var(--gray)", marginTop: 12 }}>
            Add your keywords, ask Claude, and get live rankings — with the clicks, traffic and next steps that tell you what to actually do.
          </p>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(290px, 1fr))", gap: "40px 36px" }}>
          {points.map((p, i) => (
            <div key={i} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <span style={{
                width: 48, height: 48, borderRadius: 13, display: "grid", placeItems: "center",
                background: "var(--amber-soft)", border: "1px solid color-mix(in oklch, var(--amber) 22%, white)",
              }}>
                <Icon name={p.icon} size={23} style={{ color: "var(--amber-strong)" }} />
              </span>
              <h3 style={{ fontSize: 18, fontWeight: 700, letterSpacing: "-0.015em", color: "var(--ink)", marginTop: 4 }}>{p.title}</h3>
              <p style={{ fontSize: 14.5, lineHeight: 1.6, color: "var(--gray)", margin: 0, maxWidth: 340 }}>{p.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
