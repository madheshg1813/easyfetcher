import type { MetadataRoute } from "next";
import { getBlogPosts } from "@/lib/sanity";
import type { BlogListItem } from "@/lib/blog";
import { publishedSkills } from "@/lib/skills";

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = "https://www.easyfetcher.com";

  const posts = (await getBlogPosts().catch(() => [])) as BlogListItem[];
  const blogEntries: MetadataRoute.Sitemap = posts.map((p) => ({
    url: `${baseUrl}/blogs/${p.slug.current}`,
    lastModified: p.publishedAt ? new Date(p.publishedAt) : new Date(),
    changeFrequency: "monthly",
    priority: 0.6,
  }));

  const skillEntries: MetadataRoute.Sitemap = publishedSkills().map((s) => ({
    url: `${baseUrl}/skills/${s.id}`,
    lastModified: s.publishedAt ? new Date(s.publishedAt) : new Date(),
    changeFrequency: "monthly",
    priority: 0.6,
  }));

  return [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 1.0,
    },
    {
      url: `${baseUrl}/pricing`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/blogs`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.7,
    },
    {
      url: `${baseUrl}/skills`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.8,
    },
    ...skillEntries,
    ...blogEntries,
    {
      url: `${baseUrl}/privacy`,
      lastModified: new Date(),
      changeFrequency: "yearly",
      priority: 0.3,
    },
    {
      url: `${baseUrl}/terms`,
      lastModified: new Date(),
      changeFrequency: "yearly",
      priority: 0.3,
    },
  ];
}
