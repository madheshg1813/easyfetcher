import type { Metadata } from "next";
import SiteNav from "@/components/SiteNav";
import SiteFooter from "@/components/SiteFooter";
import SkillsTheme from "@/components/skills/SkillsTheme";
import SkillsHero from "@/components/skills/SkillsHero";
import SkillsExplorer from "@/components/skills/SkillsExplorer";
import SetupSteps from "@/components/skills/SetupSteps";
import Testimonials from "@/components/skills/Testimonials";
import SkillsFaq from "@/components/skills/SkillsFaq";
import { FAQS, publishedSkills, publishedCategories } from "@/lib/skills";

const SITE = "https://www.easyfetcher.com";

// Rebuild daily (see .github/workflows/daily-skills.yml) so newly-due skills appear.
export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Claude SEO Skills — Ready-to-Use, Powered by Your Data | Easy Fetcher",
  description:
    "Download ready-to-use Claude skills for SEO reporting, audits, rank tracking, competitor research and AI-traffic analysis — wired straight into your connected marketing data.",
  alternates: { canonical: `${SITE}/skills` },
  openGraph: {
    title: "Claude SEO Skills — Powered by Your Marketing Data",
    description:
      "Free Claude skills for SEO reporting, audits, rankings, research and AI search — running on your Search Console, GA4 and PageSpeed data.",
    url: `${SITE}/skills`,
    type: "website",
  },
};

const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: FAQS.map((f) => ({
    "@type": "Question",
    name: f.q,
    acceptedAnswer: { "@type": "Answer", text: f.a },
  })),
};

export default function SkillsPage() {
  const skills = publishedSkills();
  const categories = publishedCategories();
  return (
    <>
      <SkillsTheme />
      {/* SiteNav/SiteFooter stay outside .ef-skills — see the note in
          skills/[slug]/page.tsx. */}
      <SiteNav />
      <div className="ef-skills">
        <SkillsHero count={skills.length} />
        <SkillsExplorer skills={skills} categories={categories} />
        <SetupSteps />
        <Testimonials />
        <SkillsFaq />
      </div>
      <SiteFooter />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
    </>
  );
}
