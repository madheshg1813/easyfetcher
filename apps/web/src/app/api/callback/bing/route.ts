import { NextResponse } from "next/server";

// Bing Webmaster uses API key auth — OAuth callback no longer used
export async function GET() {
  return NextResponse.redirect(new URL("/dashboard/sources", process.env.NEXT_PUBLIC_APP_URL ?? "https://app.easyfetcher.com"));
}
