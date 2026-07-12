import type { ReactNode } from "react";
import Link from "next/link";
import { SIGNUP_URL } from "@/lib/constants";
import { SOURCES, type Skill } from "@/lib/skills";
import Icon from "./Icon";
import { Eyebrow } from "./primitives";
import StepArt from "./StepArt";

interface Step {
  title: string;
  desc: ReactNode;
  cta?: { label: string; href: string };
}

// "How it works" — clean step cards, each with its own illustration. Content is
// honest about the on-demand flow (you ask Claude; nothing runs automatically).
// Pass `skill` on detail pages for skill-specific copy; omit it (hub) for the
// generic version.
export default function SetupSteps({ skill }: { skill?: Skill }) {
  const name = skill?.name ?? "SEO Audit";
  const primary = skill ? SOURCES[skill.sources[0]].label : "Search Console, GA4 or PageSpeed";

  const steps: Step[] = [
    {
      title: "Sign up free",
      desc: "Create your EasyFetcher account in seconds — no credit card required.",
      cta: { label: "Create your account", href: SIGNUP_URL },
    },
    {
      title: "Connect your data",
      desc: skill
        ? `Link your ${primary} — plus Search Console or GA4 if you want clicks and traffic too — inside EasyFetcher. Under two minutes.`
        : `Link ${primary} — whichever sources the skills you want use — inside EasyFetcher. Under two minutes.`,
    },
    {
      title: "Download the skill",
      desc: skill
        ? `Grab it straight from the hub — hit Download on the ${name} card. It's free.`
        : "Every skill on this page is free — hit Download on any card that fits the job.",
      cta: skill
        ? { label: "Go to the skills hub", href: "/skills#skills" }
        : { label: "Browse the skills", href: "#skills" },
    },
    {
      title: "Add it to Claude",
      desc: (
        <>
          Add the skill to Claude in one click. New to Claude Skills?{" "}
          <Link href="/skills#faq" className="ef-inlinelink">Learn how to add a skill</Link>.
        </>
      ),
    },
    {
      title: "Ask Claude for your report",
      desc: skill
        ? `Paste your keywords and say “run ${name}” — Claude checks your live rankings and writes them up.`
        : `Just say “run ${name}” — or any skill you added — and Claude pulls your live data and writes it up.`,
    },
  ];

  return (
    <section style={{ background: "#fff", padding: "76px 0", borderTop: "1px solid var(--border)" }}>
      <div className="wrap" style={{ maxWidth: 980 }}>
        <div style={{ textAlign: "center", maxWidth: 620, margin: "0 auto 44px" }}>
          <div style={{ display: "flex", justifyContent: "center" }}><Eyebrow>How it works</Eyebrow></div>
          <h2 style={{ fontSize: 34, fontWeight: 800, letterSpacing: "-0.025em", marginTop: 14, color: "var(--ink)" }}>
            Up and running in 5 steps
          </h2>
          <p style={{ fontSize: 17, lineHeight: 1.6, color: "var(--gray)", marginTop: 12 }}>
            From sign-up to your first ranking report in a few minutes — no spreadsheets, no setup headaches.
          </p>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {steps.map((s, i) => (
            <div key={i} className="ef-setupcard" style={{
              display: "grid", gridTemplateColumns: "1fr 260px", gap: 30, alignItems: "center",
              background: "#fff", border: "1px solid var(--border)", borderRadius: 18,
              padding: "24px 26px", boxShadow: "var(--shadow-sm)",
            }}>
              <div className="ef-setupcard-text">
                <div style={{ display: "flex", alignItems: "center", gap: 13 }}>
                  <span style={{
                    width: 34, height: 34, flex: "none", borderRadius: 999, display: "grid", placeItems: "center",
                    background: "var(--ink)", color: "#fff", fontWeight: 800, fontSize: 15,
                  }}>{i + 1}</span>
                  <h3 style={{ fontSize: 19, fontWeight: 700, letterSpacing: "-0.015em", color: "var(--ink)" }}>{s.title}</h3>
                </div>
                <p style={{ fontSize: 15, lineHeight: 1.6, color: "var(--gray)", margin: "12px 0 0", maxWidth: 440 }}>{s.desc}</p>
                {s.cta && (
                  <Link href={s.cta.href} className="ef-steplink" style={{ marginTop: 14 }}>
                    {s.cta.label} <Icon name="arrow-right" size={14} />
                  </Link>
                )}
              </div>
              <div className="ef-setupcard-art">
                <StepArt step={i} skillName={name} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
