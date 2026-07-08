import { createClient } from "next-sanity";
import imageUrlBuilder from "@sanity/image-url";

export const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET!,
  apiVersion: "2024-01-01",
  useCdn: false, // must be false for on-demand revalidation to work
  // Server-side only. This project requires auth to read; the token never
  // reaches the browser (client is used in server components / build only).
  token: process.env.SANITY_API_READ_TOKEN,
  perspective: "published", // never surface drafts on the public site
});

const builder = imageUrlBuilder(client);

export function urlFor(source: Parameters<typeof builder.image>[0]) {
  return builder.image(source);
}

export async function getBlogPosts() {
  return client.fetch(
    `*[_type == "blogPost"] | order(publishedAt desc) {
      _id, title, slug, excerpt, publishedAt, category, coverImage, coverLabel, coverLogo
    }`,
    {},
    { next: { tags: ["blog"] } }
  );
}

export async function getBlogPost(slug: string) {
  return client.fetch(
    `*[_type == "blogPost" && slug.current == $slug][0] {
      _id, title, slug, excerpt, publishedAt, category, coverImage, coverLabel, coverLogo, body, faqs
    }`,
    { slug },
    { next: { tags: ["blog"] } }
  );
}

export async function getLandingPage(slug: string) {
  return client.fetch(
    `*[_type == "landingPage" && slug.current == $slug][0]`,
    { slug },
    { next: { tags: ["landing-page"] } }
  );
}
