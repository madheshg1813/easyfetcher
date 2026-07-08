import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import SiteNav from "@/components/SiteNav";
import SiteFooter from "@/components/SiteFooter";
import BlogCover from "@/components/blog/BlogCover";
import PostBody from "@/components/blog/PostBody";
import PostSidebar from "@/components/blog/PostSidebar";
import BlogFaq from "@/components/blog/BlogFaq";
import AuthorAvatar from "@/components/blog/AuthorAvatar";
import { Linkedin } from "lucide-react";
import { IMAGES } from "@/lib/cloudinary";
import { getBlogPost, getBlogPosts } from "@/lib/sanity";
import { formatDate, getHeadings, getPostAssistant, type BlogPost, type BlogListItem } from "@/lib/blog";

export const revalidate = 3600;
export const dynamicParams = true;

const SITE = "https://www.easyfetcher.com";
const AUTHOR = {
  name: "Madhesh G",
  role: "Founder & Vibe Coder",
  bio: "Madhesh is a vibe coder who builds micro-SaaS products for marketers. He writes about SEO, AI assistants, and shipping quality tools that make marketing work faster and simpler.",
  image: IMAGES.authorMadhesh,
  linkedin: "https://www.linkedin.com/in/mobby7805/",
};

export async function generateStaticParams() {
  const posts = (await getBlogPosts()) as BlogListItem[];
  return posts.map((p) => ({ slug: p.slug.current }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const post = (await getBlogPost(slug)) as BlogPost | null;
  if (!post) return { title: "Article not found | Easy Fetcher" };
  const url = `${SITE}/blogs/${slug}`;
  return {
    title: `${post.title} | Easy Fetcher`,
    description: post.excerpt,
    alternates: { canonical: url },
    openGraph: { title: post.title, description: post.excerpt, url, type: "article" },
  };
}

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = (await getBlogPost(slug)) as BlogPost | null;
  if (!post) notFound();

  const url = `${SITE}/blogs/${slug}`;
  const headings = getHeadings(post.body);
  const assistant = getPostAssistant(post.title, post.category);

  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: post.excerpt,
    datePublished: post.publishedAt,
    dateModified: post.publishedAt,
    author: { "@type": "Person", name: AUTHOR.name, description: AUTHOR.bio, image: AUTHOR.image, sameAs: [AUTHOR.linkedin] },
    publisher: { "@type": "Organization", name: "Easy Fetcher", url: SITE },
    mainEntityOfPage: { "@type": "WebPage", "@id": url },
    url,
  };

  const faqSchema =
    post.faqs && post.faqs.length > 0
      ? {
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: post.faqs.map((f) => ({
            "@type": "Question",
            name: f.q,
            acceptedAnswer: { "@type": "Answer", text: f.a },
          })),
        }
      : null;

  return (
    <div className="min-h-screen bg-white text-gray-900" style={{ fontFamily: "'Inter', system-ui, sans-serif" }}>
      <SiteNav />

      <article className="max-w-6xl mx-auto px-4 sm:px-6 pt-10 pb-24">
        <Link href="/blogs" className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-[#0e1b2f] transition-colors mb-8">
          <ArrowLeft className="w-4 h-4" /> Blog
        </Link>

        <div className="grid lg:grid-cols-[1fr_320px] gap-10 lg:gap-14 items-start">
          {/* Main */}
          <div className="min-w-0">
            {post.category && (
              <span className="inline-block px-3 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-700 text-[11px] font-bold uppercase tracking-wider mb-5">
                {post.category}
              </span>
            )}
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-gray-900 tracking-tight leading-[1.1] mb-6">
              {post.title}
            </h1>

            <div className="flex items-center gap-3 mb-8">
              <AuthorAvatar src={AUTHOR.image} name={AUTHOR.name} className="w-10 h-10 rounded-full text-sm shrink-0" />
              <div>
                <p className="text-sm font-semibold text-gray-900">{AUTHOR.name}</p>
                <p className="text-xs text-gray-400">
                  {AUTHOR.role} · Updated on {formatDate(post.publishedAt)}
                </p>
              </div>
            </div>

            <div className="mb-8">
              <BlogCover title={post.title} category={post.category} coverImage={post.coverImage} coverLabel={post.coverLabel} coverLogo={post.coverLogo} size="hero" />
            </div>

            {/* TL;DR */}
            {post.excerpt && (
              <div className="rounded-xl border border-gray-100 bg-gray-50/70 px-5 py-4 mb-10">
                <span className="font-bold text-[#0e1b2f]">TL;DR:</span>{" "}
                <span className="text-gray-600">{post.excerpt}</span>
              </div>
            )}

            <PostBody body={post.body} />

            {post.faqs && post.faqs.length > 0 && <BlogFaq faqs={post.faqs} />}

            {/* Author bio */}
            <div className="mt-14 pt-8 border-t border-gray-100 flex gap-4">
              <AuthorAvatar src={AUTHOR.image} name={AUTHOR.name} className="w-16 h-16 rounded-full text-lg shrink-0" />
              <div>
                <p className="text-xs font-bold text-amber-500 uppercase tracking-wider mb-1">Written by</p>
                <p className="text-base font-bold text-gray-900">{AUTHOR.name}</p>
                <p className="text-sm text-gray-500 mb-2">{AUTHOR.role}</p>
                <p className="text-sm text-gray-600 leading-relaxed mb-3">{AUTHOR.bio}</p>
                <a
                  href={AUTHOR.linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-sm font-semibold text-blue-600 hover:text-blue-700 transition-colors"
                >
                  <Linkedin className="w-4 h-4" /> Connect on LinkedIn
                </a>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <aside className="lg:sticky lg:top-24 h-fit">
            <PostSidebar headings={headings} url={url} title={post.title} assistant={assistant} />
          </aside>
        </div>
      </article>

      <SiteFooter />

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }}
      />
      {faqSchema && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
        />
      )}
    </div>
  );
}
