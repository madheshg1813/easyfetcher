import { NextRequest, NextResponse } from "next/server";

function getBase(request: NextRequest) {
  const forwarded = request.headers.get("x-forwarded-host");
  const proto = request.headers.get("x-forwarded-proto") ?? "https";
  if (forwarded) return `${proto}://${forwarded}`;
  return process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
}

export async function GET(request: NextRequest) {
  const base = getBase(request);
  return NextResponse.json({
    issuer: base,
    authorization_endpoint: `${base}/api/oauth/authorize`,
    token_endpoint: `${base}/api/oauth/token`,
    registration_endpoint: `${base}/api/oauth/register`,
    scopes_supported: ["data:read"],
    response_types_supported: ["code"],
    grant_types_supported: ["authorization_code"],
    code_challenge_methods_supported: ["S256"],
    token_endpoint_auth_methods_supported: ["none"],
  });
}
