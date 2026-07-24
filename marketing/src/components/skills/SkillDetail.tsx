"use client";

import Link from "next/link";
import Image from "next/image";
import { SIGNUP_URL } from "@/lib/constants";
import { SOURCES, getCategory, getDetail, getFaqs, relatedSkills, type Skill, type SourceId } from "@/lib/skills";
import Icon from "./Icon";
import { Button, Eyebrow } from "./primitives";
import { SkillMedia } from "./Thumbnail";
import { SkillCard } from "./SkillCard";
import OutputPreview from "./OutputPreview";
import SetupSteps from "./SetupSteps";
import Testimonials from "./Testimonials";
import SkillsFaq from "./SkillsFaq";
import { HERO_MOCKS, OUTPUT_MOCKS } from "./mocks";
import WhyChoose, { WHY_CHOOSE } from "./WhyChoose";

// Logo per data source for the hero preheader chips. Driven by each skill's
// own `sources`, so the badge always reflects the data the skill actually uses
// (e.g. GA4 for AI Traffic Report — not Search Console). serp has no logo file.
const SOURCE_LOGO: Partial<Record<SourceId, string>> = {
  gsc: "/connectors/gsc.svg",
  ga4: "/connectors/google-analytics.svg",
  psi: "/connectors/pagespeed.svg",
};

function SourcePreheader({ skill }: { skill: Skill }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16, flexWrap: "wrap" }}>
      {skill.sources.map((s) => {
        const logo = SOURCE_LOGO[s];
        return (
          <span key={s} style={{
            display: "inline-flex", alignItems: "center", gap: 7,
            padding: "5px 12px 5px 9px", borderRadius: 999,
            background: "#fff", border: "1px solid var(--border)",
            fontSize: 12.5, fontWeight: 700, letterSpacing: "-0.01em", color: "var(--ink-2)",
          }}>
            {logo && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={logo} alt="" width={16} height={16} style={{ width: 16, height: 16, objectFit: "contain" }} />
            )}
            {SOURCES[s].label}
          </span>
        );
      })}
    </div>
  );
}

function Breadcrumb({ skill }: { skill: Skill }) {
  const cat = getCategory(skill.cat)!;
  return (
    <nav aria-label="Breadcrumb" style={{ display: "flex", alignItems: "center", gap: 9, fontSize: 13.5, flexWrap: "wrap" }}>
      <Link href="/skills" className="ef-crumb">Claude Skills</Link>
      <Icon name="chevron-right" size={14} style={{ color: "var(--gray-3)" }} />
      <Link href="/skills#skills" className="ef-crumb">{cat.label}</Link>
      <Icon name="chevron-right" size={14} style={{ color: "var(--gray-3)" }} />
      <span style={{ color: "var(--ink)", fontWeight: 600 }}>{skill.name}</span>
    </nav>
  );
}

export default function SkillDetail({ skill }: { skill: Skill }) {
  const det = getDetail(skill.id);
  const related = relatedSkills(skill);
  const whyPoints = WHY_CHOOSE[skill.id];
  const OutputMock = OUTPUT_MOCKS[skill.id];

  // "See it in action" — rendered right after the hero when it's a large custom
  // mock (e.g. the SEO audit), otherwise in its default spot after the setup steps.
  const outputSection = (
    <section style={{ background: "var(--bg-soft)", padding: "76px 0", borderTop: "1px solid var(--border)" }}>
      <div className="wrap">
        <div style={{ textAlign: "center", maxWidth: 640, margin: "0 auto 40px" }}>
          <div style={{ display: "flex", justifyContent: "center" }}><Eyebrow>What you get</Eyebrow></div>
          <h2 style={{ fontSize: 34, fontWeight: 800, letterSpacing: "-0.025em", marginTop: 14, color: "var(--ink)" }}>See it in action</h2>
          <p style={{ fontSize: 17, lineHeight: 1.6, color: "var(--gray)", marginTop: 12 }}>
            Here&apos;s a real output from the {skill.name} skill — pulled live from {skill.sources.map((s) => SOURCES[s].label).join(" & ")} and written in plain English.
          </p>
        </div>
        {OutputMock ? <OutputMock /> : <OutputPreview skill={skill} />}
      </div>
    </section>
  );

  return (
    <>
      {/* HERO */}
      <section style={{ background: "linear-gradient(180deg, var(--amber-tint) 0%, #fff 70%)", paddingTop: 28, paddingBottom: 56 }}>
        <div className="wrap">
          <div style={{ marginBottom: 26 }}><Breadcrumb skill={skill} /></div>
          <div className="ef-detail-hero" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 48, alignItems: "center" }}>
            <div>
              <SourcePreheader skill={skill} />
              <h1 style={{ fontSize: 46, lineHeight: 1.12, fontWeight: 800, letterSpacing: "-0.03em", color: "var(--ink)" }}>
                {skill.name}{" "}
                <span style={{ whiteSpace: "nowrap" }}>
                  with{" "}
                  <Image
                    src="/connectors/claude-icon.png"
                    alt="Claude"
                    width={40}
                    height={40}
                    style={{ display: "inline-block", verticalAlign: "-0.12em", width: "0.85em", height: "0.85em" }}
                  />{" "}
                  Claude
                </span>
              </h1>
              <p style={{ fontSize: 18, lineHeight: 1.6, color: "var(--gray)", marginTop: 18, maxWidth: 520 }}>{det.long}</p>
              <div style={{ display: "flex", gap: 12, marginTop: 26, flexWrap: "wrap" }}>
                <Link href={SIGNUP_URL}><Button size="lg" leading={<Icon name="user-plus" size={17} />}>Sign Up Free</Button></Link>
                <Link href="/#how-it-works"><Button size="lg" variant="outline" leading={<Icon name="book-open" size={17} style={{ color: "var(--amber-strong)" }} />}>View Documentation</Button></Link>
              </div>
            </div>
            <div>
              {HERO_MOCKS[skill.id] ? (
                (() => { const Mock = HERO_MOCKS[skill.id]; return <Mock />; })()
              ) : (
                <div style={{ boxShadow: "var(--shadow-lg)", borderRadius: 16 }}>
                  <SkillMedia skill={skill} rounded thumbnailOnly={!!OutputMock} />
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* SEE IT IN ACTION — right after the hero for large custom mocks */}
      {OutputMock && outputSection}

      {/* WHY CHOOSE — solution-based benefits (per-skill) */}
      {whyPoints && <WhyChoose points={whyPoints} />}

      {/* HOW TO SET UP (5 steps) */}
      <SetupSteps skill={skill} />

      {/* SEE IT IN ACTION — default position (standard output preview) */}
      {!OutputMock && outputSection}

      {/* SECTION 4 — RELATED */}
      <section style={{ background: "#fff", padding: "76px 0", borderTop: "1px solid var(--border)" }}>
        <div className="wrap">
          <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: 20, flexWrap: "wrap", marginBottom: 28 }}>
            <div>
              <Eyebrow>Related skills</Eyebrow>
              <h2 style={{ fontSize: 30, fontWeight: 800, letterSpacing: "-0.025em", marginTop: 14, color: "var(--ink)" }}>You might also want</h2>
            </div>
            <Link href="/skills#skills" className="ef-viewlink" style={{ fontSize: 14.5 }}>Browse all skills <Icon name="arrow-up-right" size={15} /></Link>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 20 }}>
            {related.map((s) => <SkillCard key={s.id} skill={s} />)}
          </div>
        </div>
      </section>

      {/* CLIENT TESTIMONIALS */}
      <Testimonials />

      {/* FAQ — skill-specific long-tail questions, 4 + 4 columns */}
      <SkillsFaq faqs={getFaqs(skill.id)} twoCol />

      {/* CTA band */}
      <section style={{ background: "var(--ink)", color: "#fff", padding: "64px 0" }}>
        <div className="wrap" style={{ textAlign: "center" }}>
          <h2 style={{ fontSize: 34, fontWeight: 800, letterSpacing: "-0.025em" }}>Connect your data, run {skill.name} in seconds</h2>
          <p style={{ fontSize: 17, color: "rgba(255,255,255,.66)", marginTop: 12, maxWidth: 560, marginLeft: "auto", marginRight: "auto" }}>
            Free to download and use with your own EasyFetcher data sources.
          </p>
          <div style={{ display: "flex", gap: 12, justifyContent: "center", marginTop: 26, flexWrap: "wrap" }}>
            <Link href={SIGNUP_URL}><Button size="lg" variant="amber" leading={<Icon name="download" size={17} />}>Download Skill</Button></Link>
            <Link href="/skills"><Button size="lg" variant="outline" style={{ background: "transparent", color: "#fff", borderColor: "rgba(255,255,255,.3)" }}>Explore more skills</Button></Link>
          </div>
        </div>
      </section>
    </>
  );
}
