// Shared helpers for the blog pages.

export interface BlogListItem {
  _id: string;
  title: string;
  slug: { current: string };
  excerpt: string;
  publishedAt: string;
  category?: string;
  coverImage?: unknown;
  coverLabel?: string;
  coverLogo?: string;
}

export interface PortableBlock {
  _type: string;
  _key: string;
  style?: string;
  children?: { text?: string }[];
  [key: string]: unknown;
}

export interface Faq {
  q: string;
  a: string;
}

export interface BlogPost extends BlogListItem {
  body?: PortableBlock[];
  faqs?: Faq[];
}

export function formatDate(iso?: string): string {
  if (!iso) return "";
  return new Date(iso).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

// Deterministic id for a heading so the table of contents can link to it.
export function headingId(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export interface Heading {
  id: string;
  text: string;
}

// Choose which assistant the "Connect … Now" CTA should promote, based on what
// the article is about. Defaults to Claude.
export function getPostAssistant(title: string, category?: string): { name: string; connectLabel: string } {
  const hay = `${title} ${category ?? ""}`.toLowerCase();
  if (hay.includes("chatgpt") || hay.includes("openai") || /\bgpt\b/.test(hay))
    return { name: "ChatGPT", connectLabel: "Connect ChatGPT Now" };
  if (hay.includes("perplexity")) return { name: "Perplexity", connectLabel: "Connect Perplexity Now" };
  if (hay.includes("gemini")) return { name: "Gemini", connectLabel: "Connect Gemini Now" };
  if (hay.includes("grok")) return { name: "Grok", connectLabel: "Connect Grok Now" };
  return { name: "Claude", connectLabel: "Connect Claude Now" };
}

// Pull the h2 headings out of a Portable Text body for the "In this page" TOC.
export function getHeadings(body?: PortableBlock[]): Heading[] {
  if (!body) return [];
  return body
    .filter((b) => b._type === "block" && b.style === "h2")
    .map((b) => {
      const text = (b.children ?? []).map((c) => c.text ?? "").join("");
      return { id: headingId(text), text };
    })
    .filter((h) => h.text);
}
