import { auth, currentUser } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import crypto from "crypto";

// OAuth Authorization Endpoint
// Claude redirects the user here to login and approve access
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const clientId = searchParams.get("client_id");
  const redirectUri = searchParams.get("redirect_uri");
  const state = searchParams.get("state");
  const responseType = searchParams.get("response_type");

  const base = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

  if (responseType !== "code" || !clientId || !redirectUri) {
    return NextResponse.json({ error: "invalid_request" }, { status: 400 });
  }

  // Verify client exists
  const client = await prisma.oAuthClient.findUnique({ where: { clientId } });
  if (!client) {
    return NextResponse.json({ error: "invalid_client" }, { status: 401 });
  }

  // Verify redirect_uri is registered
  if (!client.redirectUris.includes(redirectUri)) {
    return NextResponse.json({ error: "invalid_redirect_uri" }, { status: 400 });
  }

  // Check if user is already logged in via Clerk
  const { userId } = await auth();

  if (!userId) {
    // Not logged in — redirect to login, preserving all OAuth params
    const loginUrl = new URL("/login", base);
    loginUrl.searchParams.set(
      "redirect_url",
      `${base}/api/oauth/authorize?${searchParams.toString()}`
    );
    return NextResponse.redirect(loginUrl);
  }

  // Find the DB user — auto-provision on first OAuth if not yet in DB
  let dbUser = await prisma.user.findUnique({ where: { clerkId: userId } });
  if (!dbUser) {
    const clerkUser = await currentUser();
    if (!clerkUser) return NextResponse.json({ error: "user_not_found" }, { status: 404 });
    const email = clerkUser.emailAddresses[0]?.emailAddress;
    if (!email) return NextResponse.json({ error: "user_not_found" }, { status: 404 });

    // User may exist with same email but different clerkId (e.g. different Clerk app instance)
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      // Link this Clerk session to the existing account
      dbUser = await prisma.user.update({ where: { id: existing.id }, data: { clerkId: userId } });
    } else {
      dbUser = await prisma.user.create({
        data: { clerkId: userId, email, name: clerkUser.fullName ?? null },
      });
    }
  }

  // Issue a one-time authorization code (expires in 10 minutes)
  const code = crypto.randomBytes(24).toString("hex");
  await prisma.oAuthCode.create({
    data: {
      code,
      clientId,
      userId: dbUser.id,
      redirectUri,
      expiresAt: new Date(Date.now() + 10 * 60 * 1000),
    },
  });

  // Redirect back to Claude with the code
  const callbackUrl = new URL(redirectUri);
  callbackUrl.searchParams.set("code", code);
  if (state) callbackUrl.searchParams.set("state", state);

  return NextResponse.redirect(callbackUrl);
}
