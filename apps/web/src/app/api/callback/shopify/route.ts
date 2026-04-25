import crypto from "crypto";
import { clerkClient } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { encrypt } from "@easyfetcher/db";

function verifyShopifyHmac(params: URLSearchParams): boolean {
  const hmac = params.get("hmac");
  if (!hmac || !process.env.SHOPIFY_CLIENT_SECRET) return false;

  const message = Array.from(params.entries())
    .filter(([key]) => key !== "hmac")
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([key, val]) => `${key}=${val}`)
    .join("&");

  const digest = crypto
    .createHmac("sha256", process.env.SHOPIFY_CLIENT_SECRET)
    .update(message)
    .digest("hex");

  try {
    return crypto.timingSafeEqual(Buffer.from(digest, "hex"), Buffer.from(hmac, "hex"));
  } catch {
    return false;
  }
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");
  const shop = searchParams.get("shop");
  const state = searchParams.get("state");
  const error = searchParams.get("error");

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

  if (error || !code || !shop || !state) {
    return NextResponse.redirect(`${baseUrl}/dashboard/sources?error=oauth_cancelled`);
  }

  if (!verifyShopifyHmac(searchParams)) {
    return NextResponse.redirect(`${baseUrl}/dashboard/sources?error=invalid_hmac`);
  }

  let userId: string;
  let workspaceId: string | null = null;
  try {
    const decoded = JSON.parse(Buffer.from(state, "base64url").toString());
    userId = decoded.userId;
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
      dbUser = await prisma.user.upsert({
        where: { email },
        update: { clerkId: userId },
        create: { clerkId: userId, email, name },
      });
    } catch {
      return NextResponse.redirect(`${baseUrl}/dashboard/sources?error=user_not_found`);
    }
  }

  // Exchange code for permanent access token
  let accessToken: string;
  try {
    const tokenRes = await fetch(`https://${shop}/admin/oauth/access_token`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        client_id: process.env.SHOPIFY_CLIENT_ID,
        client_secret: process.env.SHOPIFY_CLIENT_SECRET,
        code,
      }),
    });
    if (!tokenRes.ok) throw new Error(`HTTP ${tokenRes.status}`);
    const tokenData = await tokenRes.json();
    accessToken = tokenData.access_token;
    if (!accessToken) throw new Error("No access_token");
  } catch (err) {
    console.error("[callback/shopify] token exchange failed:", err);
    return NextResponse.redirect(`${baseUrl}/dashboard/sources?error=token_exchange_failed`);
  }

  // Get shop name
  let shopName = shop;
  try {
    const shopRes = await fetch(`https://${shop}/admin/api/2024-01/shop.json`, {
      headers: { "X-Shopify-Access-Token": accessToken },
    });
    if (shopRes.ok) {
      const shopData = await shopRes.json();
      shopName = shopData.shop?.name ?? shop;
    }
  } catch { /* non-critical */ }

  // Resolve workspace
  if (!workspaceId) {
    const ws =
      (await prisma.workspace.findFirst({ where: { userId: dbUser.id, isDefault: true } })) ??
      (await prisma.workspace.findFirst({ where: { userId: dbUser.id } }));
    workspaceId = ws?.id ?? null;
  }

  // Shopify tokens are permanent — no expiry
  await prisma.connection.upsert({
    where: {
      workspaceId_platform_siteUrl: {
        workspaceId: workspaceId!,
        platform: "SHOPIFY",
        siteUrl: shop,
      },
    },
    create: {
      userId: dbUser.id,
      workspaceId,
      platform: "SHOPIFY",
      accessToken: encrypt(accessToken),
      status: "CONNECTED",
      siteUrl: shop,
      label: shopName,
      metadata: { shop, shopName },
    },
    update: {
      accessToken: encrypt(accessToken),
      status: "CONNECTED",
      label: shopName,
      metadata: { shop, shopName },
    },
  });

  await prisma.activityLog.create({
    data: {
      userId: dbUser.id,
      type: "CONNECTED",
      message: `Connected Shopify (${shopName})`,
      metadata: { platform: "SHOPIFY", siteUrl: shop, workspaceId },
    },
  });

  return NextResponse.redirect(`${baseUrl}/dashboard/sources?connected=SHOPIFY`);
}
