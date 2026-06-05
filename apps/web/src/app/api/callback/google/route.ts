import { clerkClient } from "@clerk/nextjs/server";
import { google } from "googleapis";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { encrypt } from "@easyfetcher/db";
import type { Platform } from "@easyfetcher/db";
import { saveConnection } from "@/lib/save-connection";

// ─── Main callback handler ────────────────────────────────────────────────────
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");
  const state = searchParams.get("state");
  const error = searchParams.get("error");

  if (error || !code || !state) {
    return NextResponse.redirect(new URL("/dashboard/sources?error=oauth_cancelled", request.url));
  }

  let userId: string;
  let platform: Platform;
  try {
    const decoded = JSON.parse(Buffer.from(state, "base64url").toString());
    userId = decoded.userId;
    platform = decoded.platform;
  } catch {
    return NextResponse.redirect(new URL("/dashboard/sources?error=invalid_state", request.url));
  }

  // Find DB user — auto-create if webhook hasn't fired yet
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

  // Exchange code for tokens
  // IMPORTANT: must use NEXT_PUBLIC_APP_URL (same as connect/google used) — request.url
  // may differ on Vercel preview deployments, causing redirect_uri_mismatch from Google.
  const appBase = process.env.NEXT_PUBLIC_APP_URL ?? `${new URL(request.url).protocol}//${new URL(request.url).host}`;
  const redirectUri = `${appBase}/api/callback/google`;
  const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    redirectUri
  );

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let tokenData: any;
  try {
    tokenData = await oauth2Client.getToken(code);
  } catch (err) {
    console.error("Google token exchange failed:", err);
    return NextResponse.redirect(new URL("/dashboard/sources?error=token_exchange_failed", request.url));
  }

  const tokens = (tokenData?.tokens ?? tokenData) as {
    access_token?: string | null;
    refresh_token?: string | null;
    expiry_date?: number | null;
  };

  if (!tokens?.access_token) {
    return NextResponse.redirect(new URL("/dashboard/sources?error=no_access_token", request.url));
  }

  oauth2Client.setCredentials(tokens);

  // Get user email (non-critical)
  let userEmail: string | null = null;
  try {
    const oauth2 = google.oauth2({ version: "v2", auth: oauth2Client });
    const userInfo = await oauth2.userinfo.get();
    userEmail = userInfo.data.email ?? null;
  } catch { /* non-critical */ }

  // Encrypt tokens once
  const encryptedAccess = encrypt(tokens.access_token!);
  const encryptedRefresh = tokens.refresh_token ? encrypt(tokens.refresh_token) : null;
  const tokenExpiry = tokens.expiry_date ? new Date(tokens.expiry_date) : null;

  // Fetch available sites/properties for the picker
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let sites: any[] = [];
  try {
    if (platform === "GSC") {
      const sc = google.webmasters({ version: "v3", auth: oauth2Client });
      const res = await sc.sites.list();
      sites = (res.data.siteEntry ?? []).map((s) => ({
        siteUrl: s.siteUrl,
        permissionLevel: s.permissionLevel,
        displayName: s.siteUrl
          ?.replace("sc-domain:", "")
          .replace("https://", "")
          .replace("http://", "")
          .replace(/\/$/, ""),
      }));
    }
    if (platform === "GA4") {
      const analyticsAdmin = google.analyticsadmin({ version: "v1beta", auth: oauth2Client });
      const accountsRes = await analyticsAdmin.accounts.list();
      const accounts = accountsRes.data.accounts ?? [];
      for (const account of accounts) {
        if (!account.name) continue;
        const propsRes = await analyticsAdmin.properties.list({
          filter: `parent:${account.name}`,
          pageSize: 200,
        });
        const props = (propsRes.data.properties ?? [])
          .filter((p) => p.name)
          .map((p) => ({
            siteUrl: p.name!,
            displayName: p.displayName ?? p.name ?? "GA4 Property",
          }));
        sites.push(...props);
      }
    }
    if (platform === "GOOGLE_ADS") {
      sites = [{ siteUrl: "google_ads", displayName: "Google Ads Account" }];
    }
    if (platform === "GOOGLE_MY_BUSINESS") {
      try {
        const mybusiness = google.mybusinessaccountmanagement({ version: "v1", auth: oauth2Client });
        const res = await mybusiness.accounts.list();
        sites = (res.data.accounts ?? []).map((a) => ({
          siteUrl: a.name ?? "",
          displayName: a.accountName ?? a.name ?? "My Business",
        }));
      } catch (gmbErr) {
        console.warn("GMB accounts.list failed, using placeholder:", gmbErr);
      }
      if (sites.length === 0) {
        sites = [{ siteUrl: "gmb_account", displayName: "Google My Business Account" }];
      }
    }
    if (platform === "YOUTUBE") {
      try {
        const youtube = google.youtube({ version: "v3", auth: oauth2Client });
        const res = await youtube.channels.list({ part: ["snippet"], mine: true, maxResults: 50 });
        sites = (res.data.items ?? []).map((ch) => ({
          siteUrl: ch.id ?? "",
          displayName: ch.snippet?.title ?? ch.id ?? "YouTube Channel",
        }));
      } catch (ytErr) {
        console.warn("YouTube channels.list failed, using placeholder:", ytErr);
      }
      if (sites.length === 0) {
        sites = [{ siteUrl: "youtube_channel", displayName: "YouTube Channel" }];
      }
    }
    if (platform === "YOUTUBE_ADS") {
      sites = [{ siteUrl: "youtube_ads", displayName: "YouTube Ads Account" }];
    }
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error(`[callback/google] site list fetch failed for ${platform}:`, msg);
    const url = new URL("/dashboard/sources", request.url);
    url.searchParams.set("error", "site_fetch_failed");
    url.searchParams.set("detail", msg.slice(0, 200));
    return NextResponse.redirect(url);
  }

  if (sites.length === 0) {
    return NextResponse.redirect(new URL(`/dashboard/sources?error=no_sites_found&platform=${platform}`, request.url));
  }

  // ── Single site: write Connection directly here — no confirm redirect needed ─
  if (sites.length === 1) {
    try {
      const site = sites[0];
      const siteUrl = site.siteUrl as string;
      const label = (site.displayName ?? siteUrl) as string;

      await saveConnection(
        dbUser.id,
        null,
        platform,
        encryptedAccess,
        encryptedRefresh,
        tokenExpiry,
        userEmail,
        siteUrl,
        label,
      );

      return NextResponse.redirect(new URL(`/dashboard/sources?connected=${platform}`, request.url));
    } catch (err: any) {
      console.error("[callback/google] single-site save failed:", err);
      const detail = encodeURIComponent((err?.message ?? String(err)).slice(0, 200));
      return NextResponse.redirect(new URL(`/dashboard/sources?error=save_failed&detail=${detail}`, request.url));
    }
  }

  // ── Multiple sites: save pending record and show picker ──────────────────────
  try {
    const pending = await prisma.pendingConnection.create({
      data: {
        userId: dbUser.id,
        platform,
        accessToken: encryptedAccess,
        refreshToken: encryptedRefresh,
        tokenExpiry,
        sites,
        userEmail,
        expiresAt: new Date(Date.now() + 15 * 60 * 1000),
      },
    });
    return NextResponse.redirect(new URL(`/dashboard/sources/pick-site?pendingId=${pending.id}`, request.url));
  } catch (err: any) {
    console.error("[callback/google] pending save failed:", err);
    const detail = encodeURIComponent((err?.message ?? String(err)).slice(0, 200));
    return NextResponse.redirect(new URL(`/dashboard/sources?error=pending_failed&detail=${detail}`, request.url));
  }
}
