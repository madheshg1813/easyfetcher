import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function POST(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const dbUser = await prisma.user.findUnique({ where: { clerkId: userId } });
  if (!dbUser) return NextResponse.json({ error: "User not found" }, { status: 404 });

  const workspace = await prisma.workspace.findFirst({ where: { id, userId: dbUser.id } });
  if (!workspace) return NextResponse.json({ error: "Not found" }, { status: 404 });

  await prisma.user.update({ where: { id: dbUser.id }, data: { activeWorkspaceId: id } });

  return NextResponse.json({ ok: true });
}
