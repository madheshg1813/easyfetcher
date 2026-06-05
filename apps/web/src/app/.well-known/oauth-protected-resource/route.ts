import { NextRequest, NextResponse } from "next/server";

function getBase(request: NextRequest) {
  return process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
}

export async function GET(request: NextRequest) {
  const base = getBase(request);
  return NextResponse.json({
    resource: base,
    authorization_servers: [base],
    bearer_methods_supported: ["header"],
    scopes_supported: ["data:read"],
  });
}
