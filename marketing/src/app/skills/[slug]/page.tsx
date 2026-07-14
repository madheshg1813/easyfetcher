import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import SiteNav from "@/components/SiteNav";
import SiteFooter from "@/components/SiteFooter";
import SkillsTheme from "@/components/skills/SkillsTheme";
import SkillDetail from "@/components/skills/SkillDetail";
import { getSkill, getCategory, getDetail, getFaqs, isPublished, publishedSkills } from "@/lib/skills";

const SITE = "https://www.easyfetcher.com";

export function generateStaticParams() {
  return publishedSkills().map((s) => ({ slug: s.id }));
}

// generateStaticParams only runs at build time, but publishedAt dates roll over
// daily — so a skill that goes live after the last build is absent from the
// prerendered set. dynamicParams must stay true or those slugs hard-404 until a
// rebuild, even though /skills already lists them. Unpublished and unknown slugs
// are still gated below by the isPublished/notFound check, at request time.
export const dynamicParams = true;
export const revalidate = 3600;

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const skill = getSkill(slug);
  if (!skill || !isPublished(skill)) return { title: "Skill not found | Easy Fetcher" };
  const det = getDetail(skill.id);
  const url = `${SITE}/skills/${slug}`;
  const title = `Claude ${skill.name} Skill — Powered by Your Data | Easy Fetcher`;
  return {
    title,
    description: det.long,
    alternates: { canonical: url },
    openGraph: { title: `Claude ${skill.name} Skill`, description: det.long, url, type: "website" },
  };
}

export default async function SkillDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const skill = getSkill(slug);
  if (!skill || !isPublished(skill)) notFound();

  const cat = getCategory(skill.cat)!;
  const det = getDetail(skill.id);
  const url = `${SITE}/skills/${slug}`;

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Claude Skills", item: `${SITE}/skills` },
      { "@type": "ListItem", position: 2, name: cat.label, item: `${SITE}/skills#skills` },
      { "@type": "ListItem", position: 3, name: skill.name, item: url },
    ],
  };

  const productSchema = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: `Claude ${skill.name} Skill`,
    description: det.long,
    url,
    brand: { "@type": "Brand", name: "Easy Fetcher" },
    offers: { "@type": "Offer", price: "0", priceCurrency: "USD", availability: "https://schema.org/InStock" },
  };

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: getFaqs(skill.id).map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  };

  return (
    <>
      <SkillsTheme />
      {/* SiteNav/SiteFooter stay outside .ef-skills: the wrapper redefines
          Tailwind theme tokens (--radius-*, --shadow-*) and resets `a` colours,
          which silently restyled the shared nav — its dark CTA lost its white
          text and its corner radius. Neither component uses the skills theme. */}
      <SiteNav />

      <div className="ef-skills">
      <div className="wrap" style={{ paddingTop: 20 }}>
        <Link href="/skills" className="ef-crumb" style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 14, fontWeight: 600 }}>
          <ArrowLeft className="w-4 h-4" /> All Claude skills
        </Link>
      </div>

      <SkillDetail skill={skill} />
      </div>
      <SiteFooter />

      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(productSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
    </>
  );
}
