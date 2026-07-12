import Link from "next/link";
import { SIGNUP_URL } from "@/lib/constants";
import { type SourceId } from "@/lib/skills";
import Icon from "./Icon";
import { Pill, SourceChip, Button } from "./primitives";

function HeroMock() {
  return (
    <div style={{
      background: "#fff", border: "1px solid var(--border)", borderRadius: 18,
      boxShadow: "var(--shadow-lg)", overflow: "hidden", maxWidth: 520, marginLeft: "auto",
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "13px 16px", borderBottom: "1px solid var(--border)", background: "var(--bg-soft)" }}>
        <span style={{ width: 26, height: 26, borderRadius: 7, background: "var(--ink)", display: "grid", placeItems: "center" }}>
          <Icon name="radar" size={14} style={{ color: "var(--amber)" }} />
        </span>
        <span style={{ fontWeight: 700, fontSize: 13.5 }}>SEO Report Generator</span>
        <span style={{ marginLeft: "auto", display: "inline-flex", alignItems: "center", gap: 6, fontSize: 12, fontWeight: 600, color: "#16a34a" }}>
          <span style={{ width: 7, height: 7, borderRadius: 999, background: "#16a34a" }} /> Connected
        </span>
      </div>
      <div style={{ padding: 18, display: "flex", flexDirection: "column", gap: 14 }}>
        <div style={{ alignSelf: "flex-end", maxWidth: "85%", background: "var(--ink)", color: "#fff", padding: "10px 14px", borderRadius: "14px 14px 4px 14px", fontSize: 13.5, lineHeight: 1.45 }}>
          Generate May&apos;s SEO report for acme.com
        </div>
        <div style={{ alignSelf: "flex-start", maxWidth: "94%", background: "var(--bg-soft)", border: "1px solid var(--border)", padding: "13px 14px", borderRadius: "14px 14px 14px 4px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 11 }}>
            <span style={{ fontSize: 12, fontWeight: 700, color: "var(--gray)" }}>Pulling Search Console + GA4…</span>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8, marginBottom: 12 }}>
            {[["Clicks", "12.4k", "+18%"], ["Avg. pos.", "8.2", "+1.4"], ["Conv.", "312", "+9%"]].map((m, i) => (
              <div key={i} style={{ background: "#fff", border: "1px solid var(--border)", borderRadius: 10, padding: "9px 10px" }}>
                <div style={{ fontSize: 9.5, fontWeight: 600, color: "var(--gray-2)", textTransform: "uppercase", letterSpacing: ".04em" }}>{m[0]}</div>
                <div style={{ fontSize: 17, fontWeight: 800, color: "var(--ink)", marginTop: 2 }}>{m[1]}</div>
                <div style={{ fontSize: 10.5, fontWeight: 600, color: "#16a34a" }}>{m[2]}</div>
              </div>
            ))}
          </div>
          <svg viewBox="0 0 320 80" style={{ width: "100%", height: 70, display: "block" }}>
            <defs><linearGradient id="hg" x1="0" x2="0" y1="0" y2="1"><stop offset="0%" stopColor="#f0900e" stopOpacity=".22" /><stop offset="100%" stopColor="#f0900e" stopOpacity="0" /></linearGradient></defs>
            <path d="M0,62 C40,52 70,58 110,40 C150,24 190,34 230,22 C270,12 300,20 320,10 L320,80 L0,80 Z" fill="url(#hg)" />
            <path d="M0,62 C40,52 70,58 110,40 C150,24 190,34 230,22 C270,12 300,20 320,10" fill="none" stroke="var(--amber)" strokeWidth="2.4" />
          </svg>
          <div style={{ marginTop: 4, fontSize: 12.5, lineHeight: 1.5, color: "var(--gray)" }}>
            Organic clicks rose <b style={{ color: "var(--ink)" }}>18%</b> MoM, led by 6 newly-ranked cluster pages. Full PDF ready to share.
          </div>
        </div>
      </div>
    </div>
  );
}

export default function SkillsHero({ count }: { count: number }) {
  const sources: SourceId[] = ["gsc", "ga4", "psi"];
  return (
    <section style={{ background: "linear-gradient(180deg, var(--amber-tint) 0%, #fff 62%)", paddingTop: 72, paddingBottom: 56, overflow: "hidden" }}>
      <div className="wrap ef-hero" style={{ display: "grid", gridTemplateColumns: "1.05fr 0.95fr", gap: 56, alignItems: "center" }}>
        <div>
          <Pill tone="amber"><span style={{ width: 7, height: 7, borderRadius: 999, background: "var(--amber)", display: "inline-block" }} /> {count} ready-to-use skills · always free</Pill>
          <h1 style={{ fontSize: 56, lineHeight: 1.04, fontWeight: 800, letterSpacing: "-0.03em", marginTop: 20, marginBottom: 0, color: "var(--ink)" }}>
            Claude SEO Skills,<br />powered by your<br /><span style={{ color: "var(--amber-strong)" }}>marketing data.</span>
          </h1>
          <p style={{ fontSize: 18.5, lineHeight: 1.6, color: "var(--gray)", marginTop: 22, maxWidth: 520 }}>
            Download ready-to-use Claude skills for SEO reporting, audits, rankings, competitor research, backlinks and AI-traffic analysis — wired straight into your connected data.
          </p>
          <div style={{ display: "flex", gap: 14, marginTop: 30, flexWrap: "wrap" }}>
            <a href="#skills">
              <Button size="lg" trailing={<Icon name="arrow-down" size={17} />}>Browse Skills</Button>
            </a>
            <Link href={SIGNUP_URL}>
              <Button size="lg" variant="outline" leading={<Icon name="plug-zap" size={17} style={{ color: "var(--amber-strong)" }} />}>
                Connect Data Sources
              </Button>
            </Link>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 26, flexWrap: "wrap" }}>
            <span style={{ fontSize: 12.5, fontWeight: 600, color: "var(--gray-2)", letterSpacing: ".02em" }}>WORKS WITH</span>
            {sources.map((s) => <SourceChip key={s} id={s} />)}
          </div>
        </div>
        <div>
          <HeroMock />
        </div>
      </div>
    </section>
  );
}
