import { auth, currentUser } from "@clerk/nextjs/server";
import { google } from "googleapis";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { checkConnectionAllowed } from "@/lib/plan-check";
import type { Platform, Plan } from "@easyfetcher/db";

// Only request the exact scope for the platform being connected
const PLATFORM_SCOPES: Record<string, string[]> = {
  GSC: [
    "https://www.googleapis.com/auth/webmasters.readonly",
    "openid",
    "email",
  ],
  GA4: [
    "https://www.googleapis.com/auth/analytics.readonly",
    "openid",
    "email",
  ],
  GOOGLE_ADS: [
    "https://www.googleapis.com/auth/adwords",
    "openid",
    "email",
  ],
  GOOGLE_MY_BUSINESS: [
    "https://www.googleapis.com/auth/business.manage",
    "openid",
    "email",
  ],
};

export async function GET(request: NextRequest) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const platform = (searchParams.get("platform") ?? "GSC") as Platform;
  const workspaceId = searchParams.get("workspaceId");

  // Validate platform is a Google platform
  const googlePlatforms: Platform[] = ["GSC", "GA4", "GOOGLE_ADS", "GOOGLE_MY_BUSINESS"];
  if (!googlePlatforms.includes(platform)) {
    return NextResponse.json({ error: "Invalid platform for Google OAuth" }, { status: 400 });
  }

  // Auto-create user if webhook hasn't fired yet (local dev)
  let dbUser = await prisma.user.findUnique({ where: { clerkId: userId } });
  if (!dbUser) {
    const clerkUser = await currentUser();
    const email = clerkUser?.emailAddresses?.[0]?.emailAddress ?? `${userId}@unknown.local`;
    const name = [clerkUser?.firstName, clerkUser?.lastName].filter(Boolean).join(" ") || null;
    dbUser = await prisma.user.create({ data: { clerkId: userId, email, name } });
  }

  // Resolve active workspace
  let resolvedWorkspaceId = workspaceId;
  if (!resolvedWorkspaceId) {
    const ws = await prisma.workspace.findFirst({
      where: { userId: dbUser.id, isDefault: true },
    }) ?? await prisma.workspace.findFirst({ where: { userId: dbUser.id } });
    resolvedWorkspaceId = ws?.id ?? null;
  }

  // Verify workspace belongs to this user
  if (resolvedWorkspaceId) {
    const workspace = await prisma.workspace.findFirst({
      where: { id: resolvedWorkspaceId, userId: dbUser.id },
      include: { _count: { select: { connections: { where: { status: "CONNECTED" } } } } },
    });

    if (!workspace) {
      const base = process.env.NEXT_PUBLIC_APP_URL ?? `${new URL(request.url).protocol}//${new URL(request.url).host}`;
      return NextResponse.redirect(new URL("/dashboard/sources", base));
    }

    const check = checkConnectionAllowed(dbUser.plan as Plan, platform, workspace._count.connections);
    if (!check.allowed) {
      const base = process.env.NEXT_PUBLIC_APP_URL ?? `${new URL(request.url).protocol}//${new URL(request.url).host}`;
      const url = new URL("/dashboard/sources", base);
      url.searchParams.set("error", "plan_limit");
      url.searchParams.set("requiredPlan", check.requiredPlan);
      return NextResponse.redirect(url);
    }
  }

  const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URI
  );

  // Encode userId + platform + workspaceId in state
  const state = Buffer.from(JSON.stringify({ userId, platform, workspaceId: resolvedWorkspaceId })).toString("base64url");

  const authUrl = oauth2Client.generateAuthUrl({
    access_type: "offline",
    scope: PLATFORM_SCOPES[platform],
    state,
    prompt: "consent",
  });

  return NextResponse.redirect(authUrl);
}
