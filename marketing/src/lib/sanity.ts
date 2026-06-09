import { createClient } from "next-sanity";
import imageUrlBuilder from "@sanity/image-url";

export const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET!,
  apiVersion: "2024-01-01",
  useCdn: false, // must be false for on-demand revalidation to work
});

const builder = imageUrlBuilder(client);

export function urlFor(source: Parameters<typeof builder.image>[0]) {
  return builder.image(source);
}

export async function getBlogPosts() {
  return client.fetch(
    `*[_type == "blogPost"] | order(publishedAt desc) {
      _id, title, slug, excerpt, publishedAt, category, coverImage
    }`,
    {},
    { next: { tags: ["blog"] } }
  );
}

export async function getBlogPost(slug: string) {
  return client.fetch(
    `*[_type == "blogPost" && slug.current == $slug][0] {
      _id, title, slug, excerpt, publishedAt, category, coverImage, body
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
