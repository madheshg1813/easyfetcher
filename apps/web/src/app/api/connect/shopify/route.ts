import { auth, currentUser } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { checkConnectionAllowed } from "@/lib/plan-check";
import type { Plan } from "@easyfetcher/db";

const SHOPIFY_SCOPES = "read_orders,read_products,read_customers,read_inventory,read_analytics";

export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const rawShop = searchParams.get("shop");
    const workspaceId = searchParams.get("workspaceId");
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

    if (!rawShop) {
      return NextResponse.redirect(`${baseUrl}/dashboard/sources?error=missing_shop`);
    }

    // Normalize to myshopify.com domain
    let shopDomain = rawShop.replace(/^https?:\/\//, "").replace(/\/$/, "");
    if (!shopDomain.includes(".")) {
      shopDomain = `${shopDomain}.myshopify.com`;
    }

    // Auto-create user if webhook hasn't fired yet
    let dbUser = await prisma.user.findUnique({ where: { clerkId: userId } });
    if (!dbUser) {
      const clerkUser = await currentUser();
      const email = clerkUser?.emailAddresses?.[0]?.emailAddress ?? `${userId}@unknown.local`;
      const name = [clerkUser?.firstName, clerkUser?.lastName].filter(Boolean).join(" ") || null;
      dbUser = await prisma.user.upsert({
        where: { email },
        update: { clerkId: userId },
        create: { clerkId: userId, email, name },
      });
    }

    // Resolve active workspace
    let resolvedWorkspaceId = workspaceId;
    if (!resolvedWorkspaceId) {
      const ws =
        (await prisma.workspace.findFirst({ where: { userId: dbUser.id, isDefault: true } })) ??
        (await prisma.workspace.findFirst({ where: { userId: dbUser.id } }));
      resolvedWorkspaceId = ws?.id ?? null;
    }

    if (resolvedWorkspaceId) {
      const workspace = await prisma.workspace.findFirst({
        where: { id: resolvedWorkspaceId, userId: dbUser.id },
        include: { _count: { select: { connections: { where: { status: "CONNECTED" } } } } },
      });

      if (!workspace) {
        return NextResponse.redirect(`${baseUrl}/dashboard/sources`);
      }

      const check = checkConnectionAllowed(dbUser.plan as Plan, "SHOPIFY", workspace._count.connections);
      if (!check.allowed) {
        const url = new URL(`${baseUrl}/dashboard/sources`);
        url.searchParams.set("error", "plan_limit");
        url.searchParams.set("requiredPlan", check.requiredPlan);
        return NextResponse.redirect(url.toString());
      }
    }

    const state = Buffer.from(
      JSON.stringify({ userId, workspaceId: resolvedWorkspaceId, shop: shopDomain })
    ).toString("base64url");

    const redirectUri = `${baseUrl}/api/callback/shopify`;
    const authUrl =
      `https://${shopDomain}/admin/oauth/authorize` +
      `?client_id=${process.env.SHOPIFY_CLIENT_ID}` +
      `&scope=${SHOPIFY_SCOPES}` +
      `&redirect_uri=${encodeURIComponent(redirectUri)}` +
      `&state=${state}`;

    return NextResponse.redirect(authUrl);
  } catch (err) {
    console.error("[connect/shopify] error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
