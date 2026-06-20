import { clerkClient } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { encrypt } from "@easyfetcher/db";
import { saveConnection } from "@/lib/save-connection";

const MS_TOKEN_URL = "https://login.live.com/oauth20_token.srf";
const BING_API = "https://ssl.bing.com/webmaster/api.svc/json";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");
  const state = searchParams.get("state");
  const error = searchParams.get("error");

  if (error || !code || !state) {
    const detail = encodeURIComponent(error ?? "missing_code_or_state");
    return NextResponse.redirect(new URL(`/dashboard/sources?error=oauth_cancelled&detail=${detail}`, request.url));
  }

  let userId: string;
  try {
    const decoded = JSON.parse(Buffer.from(state, "base64url").toString());
    userId = decoded.userId;
  } catch {
    return NextResponse.redirect(new URL("/dashboard/sources?error=invalid_state", request.url));
  }

  // Find or auto-create DB user
  let dbUser = await prisma.user.findUnique({ where: { clerkId: userId } });
  if (!dbUser) {
    try {
      const client = await clerkClient();
      const clerkUser = await client.users.getUser(userId);
      const email = clerkUser.emailAddresses?.[0]?.emailAddress ?? `${userId}@unknown.local`;
      const name = [clerkUser.firstName, clerkUser.lastName].filter(Boolean).join(" ") || null;
      dbUser = await prisma.user.upsert({
        where: { email },
        update: { clerkId: userId },
        create: { clerkId: userId, email, name },
      });
    } catch {
      return NextResponse.redirect(new URL("/dashboard/sources?error=user_not_found", request.url));
    }
  }

  // Exchange auth code for tokens
  const appBase = process.env.NEXT_PUBLIC_APP_URL ?? `${new URL(request.url).protocol}//${new URL(request.url).host}`;
  const redirectUri = `${appBase}/api/callback/bing`;

  let tokenRes: Response;
  try {
    tokenRes = await fetch(MS_TOKEN_URL, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        grant_type: "authorization_code",
        code,
        client_id: process.env.BING_CLIENT_ID!,
        client_secret: process.env.BING_CLIENT_SECRET!,
        redirect_uri: redirectUri,
        scope: "https://ssl.bing.com/webmaster/api",
      }),
    });
  } catch (err) {
    console.error("[callback/bing] token exchange network error:", err);
    return NextResponse.redirect(new URL("/dashboard/sources?error=token_exchange_failed", request.url));
  }

  if (!tokenRes.ok) {
    const body = await tokenRes.text().catch(() => "");
    console.error("[callback/bing] token exchange failed:", tokenRes.status, body);
    return NextResponse.redirect(new URL("/dashboard/sources?error=token_exchange_failed", request.url));
  }

  const tokens = await tokenRes.json() as {
    access_token: string;
    refresh_token?: string;
    expires_in?: number;
  };

  if (!tokens.access_token) {
    return NextResponse.redirect(new URL("/dashboard/sources?error=no_access_token", request.url));
  }

  const tokenExpiry = tokens.expires_in
    ? new Date(Date.now() + tokens.expires_in * 1000)
    : null;

  // Fetch the list of verified sites from Bing Webmaster
  let sites: { siteUrl: string; displayName: string }[] = [];
  try {
    const sitesRes = await fetch(`${BING_API}/GetUserSites`, {
      headers: { Authorization: `Bearer ${tokens.access_token}` },
    });
    if (sitesRes.ok) {
      const data = await sitesRes.json() as { d?: string[] };
      const raw = data.d ?? [];
      sites = raw.map((url) => ({
        siteUrl: url,
        displayName: url.replace(/^https?:\/\//, "").replace(/\/$/, ""),
      }));
    }
  } catch (err) {
    console.warn("[callback/bing] site list fetch failed:", err);
  }

  if (sites.length === 0) {
    // Fall back to a placeholder so the connection isn't lost
    sites = [{ siteUrl: "bing_webmaster", displayName: "Bing Webmaster Account" }];
  }

  const encryptedAccess = encrypt(tokens.access_token);
  const encryptedRefresh = tokens.refresh_token ? encrypt(tokens.refresh_token) : null;

  // Single site — save directly
  if (sites.length === 1) {
    try {
      await saveConnection(
        dbUser.id,
        null,
        "BING_WEBMASTER",
        encryptedAccess,
        encryptedRefresh,
        tokenExpiry,
        dbUser.email,
        sites[0].siteUrl,
        sites[0].displayName,
      );
      return NextResponse.redirect(new URL("/dashboard/sources?connected=BING_WEBMASTER", request.url));
    } catch (err) {
      console.error("[callback/bing] save failed:", err);
      return NextResponse.redirect(new URL("/dashboard/sources?error=save_failed", request.url));
    }
  }

  // Multiple sites — save pending and show picker
  try {
    const pending = await prisma.pendingConnection.create({
      data: {
        userId: dbUser.id,
        platform: "BING_WEBMASTER",
        accessToken: encryptedAccess,
        refreshToken: encryptedRefresh,
        tokenExpiry,
        sites,
        userEmail: dbUser.email,
        expiresAt: new Date(Date.now() + 15 * 60 * 1000),
      },
    });
    return NextResponse.redirect(new URL(`/dashboard/sources/pick-site?pendingId=${pending.id}`, request.url));
  } catch (err) {
    console.error("[callback/bing] pending save failed:", err);
    return NextResponse.redirect(new URL("/dashboard/sources?error=pending_failed", request.url));
  }
}
