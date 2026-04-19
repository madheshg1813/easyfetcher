import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

// OAuth Token Endpoint
// Claude exchanges the authorization code for an access token
export async function POST(request: NextRequest) {
  let body: Record<string, string>;
  const contentType = request.headers.get("content-type") ?? "";

  if (contentType.includes("application/x-www-form-urlencoded")) {
    const text = await request.text();
    body = Object.fromEntries(new URLSearchParams(text));
  } else {
    body = await request.json();
  }

  const { grant_type, code, redirect_uri, client_id } = body;

  if (grant_type !== "authorization_code" || !code || !client_id) {
    return NextResponse.json({ error: "invalid_request" }, { status: 400 });
  }

  // Find and validate the code
  const oauthCode = await prisma.oAuthCode.findUnique({
    where: { code },
    include: { user: true },
  });

  if (!oauthCode) {
    return NextResponse.json({ error: "invalid_grant" }, { status: 400 });
  }
  if (oauthCode.used) {
    return NextResponse.json({ error: "invalid_grant", error_description: "Code already used" }, { status: 400 });
  }
  if (oauthCode.expiresAt < new Date()) {
    return NextResponse.json({ error: "invalid_grant", error_description: "Code expired" }, { status: 400 });
  }
  if (oauthCode.clientId !== client_id) {
    return NextResponse.json({ error: "invalid_client" }, { status: 401 });
  }
  if (redirect_uri && oauthCode.redirectUri !== redirect_uri) {
    return NextResponse.json({ error: "invalid_grant", error_description: "redirect_uri mismatch" }, { status: 400 });
  }

  // Mark code as used
  await prisma.oAuthCode.update({ where: { code }, data: { used: true } });

  // The user's API key IS the access token — simple and no extra storage needed
  const user = oauthCode.user;

  return NextResponse.json({
    access_token: user.apiKey,
    token_type: "Bearer",
    scope: "data:read",
    // No expiry — API key is long-lived (user can rotate it from dashboard)
  });
}
