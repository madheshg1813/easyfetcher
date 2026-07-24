import type { CSSProperties } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { CARD_BANNERS } from "@/components/skills/cardBanners";

// The card banners read these tokens (defined inside .ef-skills on the skills
// pages). MCP pages aren't wrapped in .ef-skills, so provide them locally.
const BANNER_VARS = {
  "--bg-soft": "oklch(0.984 0.003 247.858)",
  "--bg-soft-2": "oklch(0.968 0.007 247.896)",
  "--border": "oklch(0.929 0.013 255.508)",
} as CSSProperties;

export interface McpSkill {
  id: string; // maps to the card banner art
  name: string;
  body: string;
  href: string;
}

// "Ready-made skills that run on this MCP" — a card grid that reuses each
// skill's real hub banner as the preview image. Shared across MCP pages.
export default function McpSkillCards({
  eyebrow = "Ready-made",
  title,
  intro,
  skills,
}: {
  eyebrow?: string;
  title: string;
  intro: string;
  skills: McpSkill[];
}) {
  return (
    <section className="py-14 sm:py-16 px-4 sm:px-6 bg-white">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-10">
          <p className="text-sm font-semibold text-amber-500 uppercase tracking-wider mb-3">{eyebrow}</p>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 tracking-tight mb-4 leading-tight">{title}</h2>
          <p className="text-base sm:text-lg text-gray-500 max-w-2xl mx-auto">{intro}</p>
        </div>
        <div className="grid sm:grid-cols-2 gap-5">
          {skills.map((s) => {
            const Banner = CARD_BANNERS[s.id];
            return (
              <Link key={s.href} href={s.href} className="group rounded-2xl border border-gray-100/80 bg-white overflow-hidden hover:border-amber-200 hover:shadow-xl hover:shadow-amber-100/40 transition-all duration-300 hover:-translate-y-0.5">
                {Banner && (
                  <div style={BANNER_VARS} className="border-b border-gray-100">
                    <Banner />
                  </div>
                )}
                <div className="p-6">
                  <h3 className="text-lg font-bold text-gray-900 mb-2 flex items-center gap-2">
                    {s.name}
                    <ArrowRight className="w-4 h-4 text-gray-300 group-hover:text-amber-500 group-hover:translate-x-0.5 transition-all" />
                  </h3>
                  <p className="text-sm sm:text-[15px] text-gray-500 leading-relaxed">{s.body}</p>
                </div>
              </Link>
            );
          })}
        </div>
        <div className="mt-6 text-center">
          <Link href="/skills" className="inline-flex items-center gap-2 text-sm font-bold text-amber-600 hover:text-amber-700">
            Browse every SEO skill <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}
