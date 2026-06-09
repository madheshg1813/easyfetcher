import { revalidateTag } from "next/cache";
import { type NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const secret = req.nextUrl.searchParams.get("secret");

  if (secret !== process.env.SANITY_REVALIDATE_SECRET) {
    return NextResponse.json({ message: "Invalid secret" }, { status: 401 });
  }

  const body = await req.json().catch(() => null);
  const documentType = body?._type as string | undefined;

  // Map Sanity document types to cache tags
  const tagMap: Record<string, string[]> = {
    blogPost: ["blog"],
    landingPage: ["landing-page"],
  };

  const tags = documentType ? (tagMap[documentType] ?? ["all"]) : ["all"];

  tags.forEach((tag) => revalidateTag(tag));

  return NextResponse.json({ revalidated: true, tags });
}
