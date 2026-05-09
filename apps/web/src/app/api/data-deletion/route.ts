import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";

function parseSignedRequest(signedRequest: string): { user_id?: string } | null {
  try {
    const [encodedSig, payload] = signedRequest.split(".");
    const secret = process.env.META_APP_SECRET;
    if (!secret) return null;

    const expectedSig = crypto
      .createHmac("sha256", secret)
      .update(payload)
      .digest("base64")
      .replace(/\+/g, "-")
      .replace(/\//g, "_")
      .replace(/=+$/, "");

    if (encodedSig !== expectedSig) return null;

    const data = JSON.parse(Buffer.from(payload, "base64url").toString("utf8"));
    return data;
  } catch {
    return null;
  }
}

export async function GET() {
  return NextResponse.json({
    message:
      "To request deletion of your data, email privacy@easyfetcher.com with your account email address. We will process your request within 30 days.",
    contact: "privacy@easyfetcher.com",
  });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.formData().catch(() => null);
    const signedRequest = body?.get("signed_request") as string | null;

    let userId = "unknown";
    if (signedRequest) {
      const parsed = parseSignedRequest(signedRequest);
      if (parsed?.user_id) userId = parsed.user_id;
    }

    const confirmationCode = `DEL-${userId}-${Date.now()}`;
    const statusUrl = `${process.env.NEXT_PUBLIC_APP_URL ?? "https://hub-beta.easyfetcher.com"}/data-deletion-status?code=${confirmationCode}`;

    return NextResponse.json({
      url: statusUrl,
      confirmation_code: confirmationCode,
    });
  } catch {
    return NextResponse.json({ url: "", confirmation_code: "error" }, { status: 200 });
  }
}
