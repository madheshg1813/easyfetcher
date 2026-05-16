import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const user = await prisma.user.findUnique({ where: { clerkId: userId } });
  if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

  const list = await prisma.keywordList.findFirst({ where: { id, userId: user.id } });
  if (!list) return NextResponse.json({ error: "Not found" }, { status: 404 });

  await prisma.keywordList.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
