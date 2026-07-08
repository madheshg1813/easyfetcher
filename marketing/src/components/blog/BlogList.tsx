"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { Search, ArrowRight } from "lucide-react";
import BlogCover from "./BlogCover";
import { formatDate, type BlogListItem } from "@/lib/blog";

export default function BlogList({ posts }: { posts: BlogListItem[] }) {
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return posts;
    return posts.filter(
      (p) =>
        p.title.toLowerCase().includes(q) ||
        p.excerpt?.toLowerCase().includes(q) ||
        p.category?.toLowerCase().includes(q)
    );
  }, [posts, query]);

  const [featured, ...rest] = filtered;

  return (
    <>
      {/* Search */}
      <div className="max-w-xl mx-auto mb-14">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search articles…"
            className="w-full pl-12 pr-4 py-3.5 rounded-xl border border-gray-200 bg-white text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-[#0e1b2f]/40 focus:ring-2 focus:ring-[#0e1b2f]/10 transition-all shadow-sm"
          />
        </div>
      </div>

      {filtered.length === 0 && (
        <p className="text-center text-gray-400 py-16">No articles found for &ldquo;{query}&rdquo;.</p>
      )}

      {/* Featured */}
      {featured && (
        <Link
          href={`/blogs/${featured.slug.current}`}
          className="group block max-w-5xl mx-auto mb-16 rounded-3xl border border-gray-100 bg-white shadow-sm hover:shadow-xl transition-all overflow-hidden"
        >
          <div className="grid md:grid-cols-2 gap-0 items-stretch">
            <BlogCover title={featured.title} category={featured.category} coverImage={featured.coverImage} coverLabel={featured.coverLabel} coverLogo={featured.coverLogo} size="feature" />
            <div className="p-7 sm:p-10 flex flex-col justify-center">
              {featured.category && (
                <span className="inline-block self-start px-3 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-700 text-[11px] font-bold uppercase tracking-wider mb-4">
                  {featured.category}
                </span>
              )}
              <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight leading-tight mb-3 group-hover:text-[#1c3050] transition-colors">
                {featured.title}
              </h2>
              <p className="text-gray-500 leading-relaxed mb-5 line-clamp-3">{featured.excerpt}</p>
              <div className="text-sm text-gray-400 mb-4">{formatDate(featured.publishedAt)}</div>
              <span className="inline-flex items-center gap-1.5 text-[#0e1b2f] font-bold text-sm group-hover:gap-2.5 transition-all">
                Read Blog <ArrowRight className="w-4 h-4" />
              </span>
            </div>
          </div>
        </Link>
      )}

      {/* Grid */}
      {rest.length > 0 && (
        <div className="max-w-6xl mx-auto">
          <h3 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight text-center mb-10">
            Explore more content
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {rest.map((post) => (
              <Link
                key={post._id}
                href={`/blogs/${post.slug.current}`}
                className="group flex flex-col rounded-2xl border border-gray-100 bg-white shadow-sm hover:shadow-lg hover:border-[#0e1b2f]/15 transition-all overflow-hidden"
              >
                <BlogCover title={post.title} category={post.category} coverImage={post.coverImage} coverLabel={post.coverLabel} coverLogo={post.coverLogo} size="card" />
                <div className="p-5 flex flex-col flex-1">
                  {post.category && (
                    <span className="inline-block self-start px-2.5 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-700 text-[10px] font-bold uppercase tracking-wider mb-3">
                      {post.category}
                    </span>
                  )}
                  <h4 className="text-base font-bold text-gray-900 leading-snug tracking-tight mb-2 group-hover:text-[#1c3050] transition-colors">
                    {post.title}
                  </h4>
                  <p className="text-sm text-gray-500 leading-relaxed line-clamp-2 flex-1">{post.excerpt}</p>
                  <div className="text-xs text-gray-400 mt-4">{formatDate(post.publishedAt)}</div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </>
  );
}
