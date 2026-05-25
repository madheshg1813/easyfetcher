import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

function toSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_|_$/g, "")
    .slice(0, 30) || "workspace";
}

export async function POST(request: NextRequest) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { workspaceName, websiteUrl, faviconUrl } = await request.json();

  if (!workspaceName?.trim()) {
    return NextResponse.json({ error: "Workspace name required" }, { status: 400 });
  }

  let dbUser = await prisma.user.findUnique({
    where: { clerkId: userId },
    include: { workspaces: true },
  });

  if (!dbUser) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  const slug = toSlug(workspaceName.trim());

  // Update or create the default workspace with branding
  if (dbUser.workspaces.length > 0) {
    const defaultWs = dbUser.workspaces.find((w) => w.isDefault) ?? dbUser.workspaces[0];
    await prisma.workspace.update({
      where: { id: defaultWs.id },
      data: {
        name: workspaceName.trim(),
        websiteUrl: websiteUrl?.trim() || null,
        faviconUrl: faviconUrl || null,
      },
    });
  } else {
    const ws = await prisma.workspace.create({
      data: {
        userId: dbUser.id,
        name: workspaceName.trim(),
        slug,
        websiteUrl: websiteUrl?.trim() || null,
        faviconUrl: faviconUrl || null,
        isDefault: true,
        sortOrder: 0,
      },
    });
    await prisma.user.update({ where: { id: dbUser.id }, data: { activeWorkspaceId: ws.id } });
  }

  // Mark user as onboarded
  await prisma.user.update({ where: { clerkId: userId }, data: { onboarded: true } });

  return NextResponse.json({ ok: true });
}
