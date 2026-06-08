import { NextRequest, NextResponse } from "next/server";

const APP_BASE = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

export async function GET(request: NextRequest) {
  const forwarded = request.headers.get("x-forwarded-host");
  const proto = request.headers.get("x-forwarded-proto") ?? "https";
  // resource must match the host this endpoint was reached on (could be mcp.easyfetcher.com)
  const resource = forwarded ? `${proto}://${forwarded}` : APP_BASE;

  return NextResponse.json({
    resource,
    authorization_servers: [APP_BASE],
    bearer_methods_supported: ["header"],
    scopes_supported: ["data:read"],
  });
}
