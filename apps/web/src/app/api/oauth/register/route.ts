import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import crypto from "crypto";

// Dynamic Client Registration (RFC 7591)
// Claude calls this automatically when you add a custom connector
export async function POST(request: NextRequest) {
  const body = await request.json();
  const redirectUris: string[] = body.redirect_uris ?? [];

  const clientId = `ef_client_${crypto.randomBytes(12).toString("hex")}`;

  await prisma.oAuthClient.create({
    data: {
      clientId,
      redirectUris,
      clientName: body.client_name ?? "Claude",
    },
  });

  return NextResponse.json(
    {
      client_id: clientId,
      redirect_uris: redirectUris,
      client_name: body.client_name ?? "Claude",
      token_endpoint_auth_method: "none",
      grant_types: ["authorization_code"],
      response_types: ["code"],
    },
    { status: 201 }
  );
}
