import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import crypto from "crypto";

function maskKey(key: string): string {
  return key.slice(0, 8) + "••••••••••••••••••••••";
}

export async function GET() {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const dbUser = await prisma.user.findUnique({ where: { clerkId: userId } });
  if (!dbUser) return NextResponse.json({ error: "User not found" }, { status: 404 });

  return NextResponse.json({ maskedKey: maskKey(dbUser.apiKey) });
}

export async function POST(request: Request) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json() as { action?: string };
  if (body.action !== "rotate") {
    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  }

  const dbUser = await prisma.user.findUnique({ where: { clerkId: userId } });
  if (!dbUser) return NextResponse.json({ error: "User not found" }, { status: 404 });

  // Generate new API key (ef_ prefix + 32 random hex chars)
  const newKey = `ef_${crypto.randomBytes(16).toString("hex")}`;

  await prisma.user.update({
    where: { clerkId: userId },
    data: { apiKey: newKey },
  });

  // Log activity
  await prisma.activityLog.create({
    data: {
      userId: dbUser.id,
      type: "KEY_ROTATED",
      message: "API key rotated",
    },
  });

  // Return full key ONCE — client should show it temporarily
  return NextResponse.json({ newKey, maskedKey: maskKey(newKey) });
}
