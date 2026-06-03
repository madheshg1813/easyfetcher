import { clerkClient } from "@clerk/nextjs/server";
import { google } from "googleapis";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { encrypt } from "@easyfetcher/db";
import type { Platform } from "@easyfetcher/db";

// ─── Shared helper: save a single connection from a pending record ────────────
export async function saveConnection(
  dbUserId: string,
  workspaceId: string | null,
  platform: Platform,
  accessToken: string,   // already encrypted
  refreshToken: string | null,
  tokenExpiry: Date | null,
  userEmail: string | null,
  siteUrl: string,
  label: string,
) {
  if (workspaceId) {
    await prisma.connection.upsert({
      where: {
        workspaceId_platform_siteUrl: { workspaceId, platform, siteUrl },
      },
      create: {
        userId: dbUserId,
        workspaceId,
        platform,
        accessToken,
        refreshToken,
        expiresAt: tokenExpiry,
        status: "CONNECTED",
        siteUrl,
        label,
        metadata: { email: userEmail },
      },
      update: {
        accessToken,
        refreshToken: refreshToken ?? undefined,
        expiresAt: tokenExpiry,
        status: "CONNECTED",
        label,
        metadata: { email: userEmail },
      },
    });
  } else {
    // workspaceId is null — can't use compound unique key, fall back to find+upsert
    const existing = await prisma.connection.findFirst({
      where: { userId: dbUserId, platform, siteUrl, workspaceId: null },
    });
    if (existing) {
      await prisma.connection.update({
        where: { id: existing.id },
        data: {
          accessToken,
          refreshToken: refreshToken ?? undefined,
          expiresAt: tokenExpiry,
          status: "CONNECTED",
          label,
          metadata: { email: userEmail },
        },
      });
    } else {
      await prisma.connection.create({
        data: {
          userId: dbUserId,
          workspaceId: null,
          platform,
          accessToken,
          refreshToken,
          expiresAt: tokenExpiry,
          status: "CONNECTED",
          siteUrl,
          label,
          metadata: { email: userEmail },
        },
      });
    }
  }

  await prisma.activityLog.create({
    data: {
      userId: dbUserId,
      type: "CONNECTED",
      message: `Connected ${platform} (${label})`,
      metadata: { platform, siteUrl, workspaceId },
    },
  });
}

// ─── Main callback handler ────────────────────────────────────────────────────
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");
  const state = searchParams.get("state");
  const error = searchParams.get("error");

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

  if (error || !code || !state) {
    return NextResponse.redirect(`${baseUrl}/dashboard/sources?error=oauth_cancelled`);
  }

  let userId: string;
  let platform: Platform;
  let workspaceId: string | null = null;
  try {
    const decoded = JSON.parse(Buffer.from(state, "base64url").toString());
    userId = decoded.userId;
    platform = decoded.platform;
    workspaceId = decoded.workspaceId ?? null;
  } catch {
    return NextResponse.redirect(`${baseUrl}/dashboard/sources?error=invalid_state`);
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
      return NextResponse.redirect(`${baseUrl}/dashboard/sources?error=user_not_found`);
    }
  }

  // Resolve workspace
  if (!workspaceId) {
    const ws =
      (await prisma.workspace.findFirst({ where: { userId: dbUser.id, isDefault: true } })) ??
      (await prisma.workspace.findFirst({ where: { userId: dbUser.id } }));
    workspaceId = ws?.id ?? null;
  }

  // Exchange code for tokens
  const redirectUri = `${baseUrl}/api/callback/google`;
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
    return NextResponse.redirect(`${baseUrl}/dashboard/sources?error=token_exchange_failed`);
  }

  const tokens = (tokenData?.tokens ?? tokenData) as {
    access_token?: string | null;
    refresh_token?: string | null;
    expiry_date?: number | null;
  };

  if (!tokens?.access_token) {
    return NextResponse.redirect(`${baseUrl}/dashboard/sources?error=no_access_token`);
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
    const url = new URL(`${baseUrl}/dashboard/sources`);
    url.searchParams.set("error", "site_fetch_failed");
    url.searchParams.set("detail", msg.slice(0, 200));
    return NextResponse.redirect(url.toString());
  }

  if (sites.length === 0) {
    return NextResponse.redirect(`${baseUrl}/dashboard/sources?error=no_sites_found&platform=${platform}`);
  }

  // ── Single site: write Connection directly here — no confirm redirect needed ─
  if (sites.length === 1) {
    try {
      const site = sites[0];
      const siteUrl = site.siteUrl as string;
      const label = (site.displayName ?? siteUrl) as string;

      await saveConnection(
        dbUser.id,
        workspaceId,
        platform,
        encryptedAccess,
        encryptedRefresh,
        tokenExpiry,
        userEmail,
        siteUrl,
        label,
      );

      return NextResponse.redirect(`${baseUrl}/dashboard/sources?connected=${platform}`);
    } catch (err: any) {
      console.error("[callback/google] single-site save failed:", err);
      const detail = encodeURIComponent((err?.message ?? String(err)).slice(0, 200));
      return NextResponse.redirect(`${baseUrl}/dashboard/sources?error=save_failed&detail=${detail}`);
    }
  }

  // ── Multiple sites: save pending record and show picker ──────────────────────
  try {
    const pending = await prisma.pendingConnection.create({
      data: {
        userId: dbUser.id,
        workspaceId,
        platform,
        accessToken: encryptedAccess,
        refreshToken: encryptedRefresh,
        tokenExpiry,
        sites,
        userEmail,
        expiresAt: new Date(Date.now() + 15 * 60 * 1000),
      },
    });
    return NextResponse.redirect(`${baseUrl}/dashboard/sources/pick-site?pendingId=${pending.id}`);
  } catch (err: any) {
    console.error("[callback/google] pending save failed:", err);
    const detail = encodeURIComponent((err?.message ?? String(err)).slice(0, 200));
    return NextResponse.redirect(`${baseUrl}/dashboard/sources?error=pending_failed&detail=${detail}`);
  }
}
