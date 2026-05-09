import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    message: "To request deletion of your data, email privacy@easyfetcher.com with your account email address. We will process your request within 30 days.",
    contact: "privacy@easyfetcher.com",
  });
}

export async function POST() {
  return NextResponse.json({ status: "received" });
}
