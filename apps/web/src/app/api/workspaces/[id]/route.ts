import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const { name } = await request.json();

  const dbUser = await prisma.user.findUnique({ where: { clerkId: userId } });
  if (!dbUser) return NextResponse.json({ error: "User not found" }, { status: 404 });

  const workspace = await prisma.workspace.findFirst({ where: { id, userId: dbUser.id } });
  if (!workspace) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const updated = await prisma.workspace.update({
    where: { id },
    data: { name: name.trim() },
    // Note: slug is intentionally NOT updated to keep MCP tool names stable
  });

  return NextResponse.json({ workspace: updated });
}

export async function DELETE(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;

  const dbUser = await prisma.user.findUnique({
    where: { clerkId: userId },
    include: { workspaces: true },
  });
  if (!dbUser) return NextResponse.json({ error: "User not found" }, { status: 404 });

  const workspace = await prisma.workspace.findFirst({ where: { id, userId: dbUser.id } });
  if (!workspace) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (workspace.isDefault) return NextResponse.json({ error: "Cannot delete default workspace" }, { status: 400 });

  await prisma.workspace.delete({ where: { id } });

  // Switch active workspace to default if deleted the active one
  if (dbUser.activeWorkspaceId === id) {
    const defaultWs = dbUser.workspaces.find((w) => w.isDefault && w.id !== id);
    if (defaultWs) {
      await prisma.user.update({ where: { id: dbUser.id }, data: { activeWorkspaceId: defaultWs.id } });
    }
  }

  return NextResponse.json({ ok: true });
}
