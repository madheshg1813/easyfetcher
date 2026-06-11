import { auth, currentUser } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { checkConnectionAllowed } from "@/lib/plan-check";
import type { Plan } from "@easyfetcher/db";

const MS_AUTHORIZE = "https://login.microsoftonline.com/consumers/oauth2/v2.0/authorize";
// offline_access gives us a refresh token so we can renew without re-prompting the user
const BING_SCOPES = "https://ssl.bing.com/webmaster/api offline_access";

export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    if (!process.env.BING_CLIENT_ID) {
      return NextResponse.json({ error: "Bing OAuth not configured yet" }, { status: 503 });
    }

    let dbUser = await prisma.user.findUnique({
      where: { clerkId: userId },
      include: { _count: { select: { connections: { where: { status: "CONNECTED" } } } } },
    });
    if (!dbUser) {
      const clerkUser = await currentUser();
      const email = clerkUser?.emailAddresses?.[0]?.emailAddress ?? `${userId}@unknown.local`;
      const name = [clerkUser?.firstName, clerkUser?.lastName].filter(Boolean).join(" ") || null;
      dbUser = await prisma.user.upsert({
        where: { email },
        update: { clerkId: userId },
        create: { clerkId: userId, email, name },
        include: { _count: { select: { connections: { where: { status: "CONNECTED" } } } } },
      });
    }

    const check = checkConnectionAllowed(dbUser.plan as Plan, "BING_WEBMASTER", dbUser._count.connections);
    if (!check.allowed) {
      const base = process.env.NEXT_PUBLIC_APP_URL ?? `${new URL(request.url).protocol}//${new URL(request.url).host}`;
      const url = new URL("/dashboard/sources", base);
      url.searchParams.set("error", "plan_limit");
      url.searchParams.set("requiredPlan", check.requiredPlan);
      return NextResponse.redirect(url);
    }

    const redirectUri = `${process.env.NEXT_PUBLIC_APP_URL}/api/callback/bing`;
    const state = Buffer.from(JSON.stringify({ userId, platform: "BING_WEBMASTER" })).toString("base64url");

    const params = new URLSearchParams({
      client_id: process.env.BING_CLIENT_ID!,
      response_type: "code",
      redirect_uri: redirectUri,
      scope: BING_SCOPES,
      state,
      response_mode: "query",
      prompt: "consent",
    });

    return NextResponse.redirect(`${MS_AUTHORIZE}?${params.toString()}`);
  } catch (err) {
    console.error("[connect/bing] unhandled error:", err);
    return NextResponse.json(
      { error: "Internal server error", detail: err instanceof Error ? err.message : String(err) },
      { status: 500 }
    );
  }
}
