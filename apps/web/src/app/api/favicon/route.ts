import { NextRequest, NextResponse } from "next/server";

// Fetches the best favicon for a given URL and returns its data URL or external URL
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const siteUrl = searchParams.get("url");

  if (!siteUrl) return NextResponse.json({ error: "url required" }, { status: 400 });

  try {
    // Normalize URL
    let normalized = siteUrl.trim();
    if (!normalized.startsWith("http://") && !normalized.startsWith("https://")) {
      normalized = "https://" + normalized;
    }
    const parsed = new URL(normalized);
    const origin = parsed.origin;

    // Try Google's favicon service first (most reliable, handles all sizes)
    const googleFavicon = `https://www.google.com/s2/favicons?domain=${parsed.hostname}&sz=64`;

    // Verify it returns a real image (not a generic placeholder)
    const res = await fetch(googleFavicon, { signal: AbortSignal.timeout(4000) });
    if (res.ok) {
      const contentType = res.headers.get("content-type") ?? "";
      if (contentType.startsWith("image/")) {
        return NextResponse.json({ faviconUrl: googleFavicon, origin });
      }
    }

    // Fallback: try /favicon.ico directly
    const icoUrl = `${origin}/favicon.ico`;
    const icoRes = await fetch(icoUrl, { signal: AbortSignal.timeout(3000) });
    if (icoRes.ok) {
      return NextResponse.json({ faviconUrl: icoUrl, origin });
    }

    return NextResponse.json({ faviconUrl: null, origin });
  } catch {
    return NextResponse.json({ faviconUrl: null, origin: null });
  }
}
