import { clerkClient } from "@clerk/nextjs/server";
import { google } from "googleapis";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { encrypt } from "@easyfetcher/db";
import type { Platform } from "@easyfetcher/db";

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
      dbUser = await prisma.user.create({ data: { clerkId: userId, email, name } });
    } catch {
      return NextResponse.redirect(`${baseUrl}/dashboard/sources?error=user_not_found`);
    }
  }

  // Exchange code for tokens
  const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URI
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

  // Get user email
  let userEmail: string | null = null;
  try {
    const oauth2 = google.oauth2({ version: "v2", auth: oauth2Client });
    const userInfo = await oauth2.userinfo.get();
    userEmail = userInfo.data.email ?? null;
  } catch { /* non-critical */ }

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
      }));
    }
    if (platform === "GA4") {
      const analyticsAdmin = google.analyticsadmin({ version: "v1beta", auth: oauth2Client });
      const res = await analyticsAdmin.properties.list({ filter: "parent:accounts/-" });
      sites = (res.data.properties ?? []).map((p) => ({
        siteUrl: p.name,           // e.g. "properties/123456"
        displayName: p.displayName,
      }));
    }
    if (platform === "GOOGLE_ADS") {
      // No picker needed for Ads — auto-connect with placeholder
      sites = [{ siteUrl: "google_ads", displayName: "Google Ads Account" }];
    }
    if (platform === "GOOGLE_MY_BUSINESS") {
      try {
        const mybusiness = google.mybusinessaccountmanagement({ version: "v1", auth: oauth2Client });
        const res = await mybusiness.accounts.list();
        sites = (res.data.accounts ?? []).map((a) => ({
          siteUrl: a.name ?? "",        // e.g. "accounts/123456789"
          displayName: a.accountName ?? a.name ?? "My Business",
        }));
      } catch (gmbErr) {
        console.warn("GMB accounts.list failed, using placeholder:", gmbErr);
      }
      if (sites.length === 0) {
        sites = [{ siteUrl: "gmb_account", displayName: "Google My Business Account" }];
      }
    }
  } catch (err) {
    console.warn(`Site list fetch failed for ${platform}:`, err);
    return NextResponse.redirect(`${baseUrl}/dashboard/sources?error=site_fetch_failed`);
  }

  if (sites.length === 0) {
    return NextResponse.redirect(`${baseUrl}/dashboard/sources?error=no_sites_found`);
  }

  // Save tokens in PendingConnection (expires in 15 min)
  const pending = await prisma.pendingConnection.create({
    data: {
      userId: dbUser.id,
      workspaceId,
      platform,
      accessToken: encrypt(tokens.access_token!),
      refreshToken: tokens.refresh_token ? encrypt(tokens.refresh_token) : null,
      tokenExpiry: tokens.expiry_date ? new Date(tokens.expiry_date) : null,
      sites,
      userEmail,
      expiresAt: new Date(Date.now() + 15 * 60 * 1000),
    },
  });

  // If only one site, skip the picker and auto-confirm
  if (sites.length === 1) {
    return NextResponse.redirect(
      `${baseUrl}/api/connect/confirm?pendingId=${pending.id}&siteUrl=${encodeURIComponent(sites[0].siteUrl)}`
    );
  }

  // Multiple sites — show picker
  return NextResponse.redirect(`${baseUrl}/dashboard/sources/pick-site?pendingId=${pending.id}`);
}
