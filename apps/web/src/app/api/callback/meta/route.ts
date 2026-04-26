import { clerkClient } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { encrypt } from "@easyfetcher/db";
import type { Platform } from "@easyfetcher/db";

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const { searchParams } = requestUrl;
  const code = searchParams.get("code");
  const state = searchParams.get("state");
  const error = searchParams.get("error");
  const baseUrl = requestUrl.origin;

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

  const appId = process.env.META_APP_ID;
  const appSecret = process.env.META_APP_SECRET;
  const redirectUri = `${baseUrl}/api/callback/meta`;

  if (!appId || !appSecret) {
    return NextResponse.redirect(`${baseUrl}/dashboard/sources?error=meta_config_missing`);
  }

  // Exchange code for access token
  let tokenData: Record<string, unknown>;
  try {
    const tokenUrl = `https://graph.facebook.com/v19.0/oauth/access_token?client_id=${appId}&redirect_uri=${encodeURIComponent(redirectUri)}&client_secret=${appSecret}&code=${code}`;
    const res = await fetch(tokenUrl);
    tokenData = (await res.json()) as Record<string, unknown>;
  } catch (err) {
    console.error("Meta token exchange failed:", err);
    return NextResponse.redirect(`${baseUrl}/dashboard/sources?error=token_exchange_failed`);
  }

  if (tokenData.error || !tokenData.access_token) {
    console.error("Meta token response:", tokenData);
    return NextResponse.redirect(`${baseUrl}/dashboard/sources?error=no_access_token`);
  }

  // Exchange short-lived token for long-lived token (~60 days)
  let accessToken = tokenData.access_token as string;
  try {
    const llTokenUrl = `https://graph.facebook.com/v19.0/oauth/access_token?grant_type=fb_exchange_token&client_id=${appId}&client_secret=${appSecret}&fb_exchange_token=${accessToken}`;
    const llRes = await fetch(llTokenUrl);
    const llData = (await llRes.json()) as Record<string, unknown>;
    if (typeof llData.access_token === "string") accessToken = llData.access_token;
  } catch (err) {
    console.warn("Could not exchange for long-lived token:", err);
  }

  interface AdAccount { accountId: string; name: string; currency: string; timezone: string }
  interface Page { id: string; name: string; accessToken: string }
  interface IgAccount { id: string; username: string; name: string; pageId: string }

  let adAccounts: AdAccount[] = [];
  let pages: Page[] = [];
  let instagramAccounts: IgAccount[] = [];

  try {
    const adAccountsRes = await fetch(`https://graph.facebook.com/v19.0/me/adaccounts?fields=name,account_id,currency,timezone_name&access_token=${accessToken}`);
    const adAccountsData = (await adAccountsRes.json()) as { data?: Array<Record<string, string>> };
    if (adAccountsData.data) {
      adAccounts = adAccountsData.data.map((acc) => ({
        accountId: acc.account_id,
        name: acc.name,
        currency: acc.currency,
        timezone: acc.timezone_name,
      }));
    }

    const pagesRes = await fetch(`https://graph.facebook.com/v19.0/me/accounts?fields=name,id,access_token&access_token=${accessToken}`);
    const pagesData = (await pagesRes.json()) as { data?: Array<Record<string, string>> };
    if (pagesData.data) {
      pages = pagesData.data.map((page) => ({ id: page.id, name: page.name, accessToken: page.access_token }));
    }

    for (const page of pages) {
      try {
        const igRes = await fetch(`https://graph.facebook.com/v19.0/${page.id}?fields=instagram_business_account&access_token=${page.accessToken || accessToken}`);
        const igData = (await igRes.json()) as { instagram_business_account?: { id: string } };
        if (igData.instagram_business_account) {
          const igAccRes = await fetch(`https://graph.facebook.com/v19.0/${igData.instagram_business_account.id}?fields=username,name&access_token=${accessToken}`);
          const igAccData = (await igAccRes.json()) as { id: string; username: string; name: string };
          instagramAccounts.push({ id: igAccData.id, username: igAccData.username, name: igAccData.name, pageId: page.id });
        }
      } catch { /* non-critical */ }
    }
  } catch (err) {
    console.warn("Meta data fetch failed:", err);
    return NextResponse.redirect(`${baseUrl}/dashboard/sources?error=data_fetch_failed`);
  }

  interface SiteEntry { siteUrl: string; displayName: string; metadata: Record<string, unknown> }
  let sites: SiteEntry[] = [];

  if (platform === "META_ADS") {
    if (adAccounts.length === 0) return NextResponse.redirect(`${baseUrl}/dashboard/sources?error=no_ad_accounts`);
    sites = adAccounts.map((acc) => ({
      siteUrl: `act_${acc.accountId}`,
      displayName: acc.name,
      metadata: { currency: acc.currency, timezone: acc.timezone },
    }));
  } else if (platform === "INSTAGRAM") {
    if (instagramAccounts.length === 0) return NextResponse.redirect(`${baseUrl}/dashboard/sources?error=no_instagram_accounts`);
    sites = instagramAccounts.map((acc) => ({
      siteUrl: acc.id,
      displayName: `@${acc.username}`,
      metadata: { pageId: acc.pageId },
    }));
  }

  if (sites.length === 0) return NextResponse.redirect(`${baseUrl}/dashboard/sources?error=no_sites_found`);

  const pending = await prisma.pendingConnection.create({
    data: {
      userId: dbUser.id,
      workspaceId,
      platform,
      accessToken: encrypt(accessToken),
      refreshToken: null,
      tokenExpiry: null,
      sites: sites as unknown as object[],
      userEmail: null,
      expiresAt: new Date(Date.now() + 15 * 60 * 1000),
    },
  });

  if (sites.length === 1) {
    return NextResponse.redirect(`${baseUrl}/api/connect/confirm?pendingId=${pending.id}&siteUrl=${encodeURIComponent(sites[0].siteUrl)}`);
  }

  return NextResponse.redirect(`${baseUrl}/dashboard/sources/pick-site?pendingId=${pending.id}`);
}
