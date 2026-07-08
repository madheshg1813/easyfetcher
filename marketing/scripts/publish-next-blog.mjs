// Publishes the next queued blog post to Sanity.
// Run daily by .github/workflows/daily-blog.yml, or manually:
//   SANITY_API_TOKEN=xxx node scripts/publish-next-blog.mjs
//
// Normal run: publishes the first draft (sorted by filename) whose slug does not
// yet exist in Sanity. Idempotent.
//
// Republish one post (e.g. after editing a draft):
//   SANITY_API_TOKEN=xxx FORCE_SLUG=what-are-claude-skills node scripts/publish-next-blog.mjs

import { createClient } from "@sanity/client";
import { readdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { markdownToPortableText } from "./lib/md-to-portable-text.mjs";

const __dirname = dirname(fileURLToPath(import.meta.url));
const QUEUE_DIR = join(__dirname, "..", "content", "blog-queue");

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || "ry0w69he";
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || "production";
const token = process.env.SANITY_API_TOKEN;
const forceSlug = process.env.FORCE_SLUG;

if (!token) {
  console.error("✗ SANITY_API_TOKEN is not set. Aborting.");
  process.exit(1);
}

const client = createClient({ projectId, dataset, apiVersion: "2024-01-01", token, useCdn: false });

const rkey = () => Math.random().toString(36).slice(2, 12);

function buildDoc(post, publishedAt) {
  return {
    _id: `blogPost.${post.slug}`,
    _type: "blogPost",
    title: post.title,
    slug: { _type: "slug", current: post.slug },
    excerpt: post.excerpt,
    category: post.category ?? "Product",
    coverLabel: post.cover?.label,
    coverLogo: post.cover?.logo,
    publishedAt,
    body: markdownToPortableText(post.body),
    faqs: (post.faqs ?? []).map((f) => ({ _type: "faq", _key: rkey(), q: f.q, a: f.a })),
  };
}

async function loadQueue() {
  const files = readdirSync(QUEUE_DIR).filter((f) => f.endsWith(".mjs")).sort();
  const posts = [];
  for (const file of files) {
    const mod = await import(join(QUEUE_DIR, file));
    if (mod.default?.slug) posts.push({ file, post: mod.default });
  }
  return posts;
}

async function main() {
  const queue = await loadQueue();
  if (queue.length === 0) {
    console.log("Queue is empty — nothing to publish.");
    return;
  }

  // Republish mode
  if (forceSlug) {
    const match = queue.find((q) => q.post.slug === forceSlug);
    if (!match) {
      console.error(`✗ No draft with slug "${forceSlug}" in the queue.`);
      process.exit(1);
    }
    const existing = await client.fetch(`*[_id == $id][0]{publishedAt}`, { id: `blogPost.${forceSlug}` });
    const publishedAt = existing?.publishedAt ?? new Date().toISOString();
    await client.createOrReplace(buildDoc(match.post, publishedAt));
    console.log(`✓ Republished: "${match.post.title}" (${forceSlug})`);
    return;
  }

  // Normal mode — publish first unpublished
  const existingSlugs = new Set(await client.fetch(`*[_type == "blogPost"].slug.current`));
  for (const { post } of queue) {
    if (existingSlugs.has(post.slug)) continue;
    await client.createIfNotExists(buildDoc(post, new Date().toISOString()));
    console.log(`✓ Published: "${post.title}" (${post.slug})`);
    return;
  }
  console.log("All queued drafts are already published. Add more to content/blog-queue.");
}

main().catch((err) => {
  console.error("✗ Publish failed:", err.message);
  process.exit(1);
});
