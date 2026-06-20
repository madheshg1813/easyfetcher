import { auth, currentUser } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { encrypt } from "@easyfetcher/db";
import { checkConnectionAllowed } from "@/lib/plan-check";
import { saveConnection } from "@/lib/save-connection";
import type { Plan } from "@easyfetcher/db";

const BING_API = "https://ssl.bing.com/webmaster/api.svc/json";

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await request.json();
    const apiKey = (body.apiKey ?? "").trim();
    if (!apiKey) return NextResponse.json({ error: "API key is required" }, { status: 400 });

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
      return NextResponse.json({ error: "plan_limit", requiredPlan: check.requiredPlan }, { status: 403 });
    }

    // Validate key by fetching sites
    const sitesRes = await fetch(`${BING_API}/GetUserSites?apikey=${encodeURIComponent(apiKey)}`);
    if (!sitesRes.ok) {
      return NextResponse.json({ error: "Invalid API key — make sure you copied it correctly from Bing Webmaster Settings → API access." }, { status: 400 });
    }

    const sitesData = await sitesRes.json() as { d?: string[] };
    const sites = sitesData.d ?? [];

    const encryptedKey = encrypt(apiKey);
    const siteUrl = sites[0] ?? "bing_webmaster";
    const label = sites[0]
      ? sites[0].replace(/^https?:\/\//, "").replace(/\/$/, "")
      : "Bing Webmaster Account";

    await saveConnection(
      dbUser.id,
      null,
      "BING_WEBMASTER",
      encryptedKey,
      null,
      null,
      dbUser.email,
      siteUrl,
      label,
    );

    return NextResponse.json({ success: true, label });
  } catch (err) {
    console.error("[connect/bing] error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
