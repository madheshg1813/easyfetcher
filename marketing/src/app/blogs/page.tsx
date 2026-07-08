import type { Metadata } from "next";
import SiteNav from "@/components/SiteNav";
import SiteFooter from "@/components/SiteFooter";
import BlogList from "@/components/blog/BlogList";
import { getBlogPosts } from "@/lib/sanity";
import type { BlogListItem } from "@/lib/blog";

export const metadata: Metadata = {
  title: "Blog – SEO, AI & Marketing Guides | Easy Fetcher",
  description:
    "Guides, playbooks and tips on SEO, AI assistants, and marketing analytics — from the team building Easy Fetcher for Claude, ChatGPT and Perplexity.",
  alternates: { canonical: "https://www.easyfetcher.com/blogs" },
};

// Revalidated on-demand via Sanity webhook; hourly fallback.
export const revalidate = 3600;

export default async function BlogsPage() {
  const posts = (await getBlogPosts()) as BlogListItem[];

  return (
    <div className="min-h-screen bg-white text-gray-900" style={{ fontFamily: "'Inter', system-ui, sans-serif" }}>
      <SiteNav />

      {/* Hero */}
      <section className="pt-14 sm:pt-20 pb-10 px-4 sm:px-6 text-center" style={{ background: "linear-gradient(180deg, #fffbeb 0%, #ffffff 100%)" }}>
        <div className="max-w-2xl mx-auto">
          <span className="inline-block px-4 py-1.5 rounded-full bg-white border border-gray-200 text-gray-600 text-xs font-semibold shadow-sm mb-6">
            Easy Fetcher Blog
          </span>
          <h1 className="text-5xl sm:text-6xl font-extrabold text-gray-900 tracking-tight mb-4">Blog</h1>
          <p className="text-base sm:text-lg text-gray-500 leading-relaxed">
            Guides, playbooks and tips on SEO, AI assistants and marketing analytics — for every workflow.
          </p>
        </div>
      </section>

      {/* List */}
      <section className="pb-24 px-4 sm:px-6">
        {posts.length === 0 ? (
          <p className="text-center text-gray-400 py-16">No articles published yet — check back soon.</p>
        ) : (
          <BlogList posts={posts} />
        )}
      </section>

      <SiteFooter />
    </div>
  );
}
