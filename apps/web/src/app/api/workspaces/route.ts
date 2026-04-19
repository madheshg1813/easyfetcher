import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { canCreateWorkspace } from "@/lib/plan-check";
import type { Plan } from "@easyfetcher/db";

function toSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_|_$/g, "")
    .slice(0, 30) || "workspace";
}

export async function GET() {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const dbUser = await prisma.user.findUnique({
    where: { clerkId: userId },
    include: { workspaces: { orderBy: { sortOrder: "asc" } } },
  });
  if (!dbUser) return NextResponse.json({ error: "User not found" }, { status: 404 });

  return NextResponse.json({ workspaces: dbUser.workspaces, activeWorkspaceId: dbUser.activeWorkspaceId });
}

export async function POST(request: NextRequest) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const dbUser = await prisma.user.findUnique({
    where: { clerkId: userId },
    include: { workspaces: true },
  });
  if (!dbUser) return NextResponse.json({ error: "User not found" }, { status: 404 });

  if (!canCreateWorkspace(dbUser.plan as Plan, dbUser.workspaces.length)) {
    return NextResponse.json({ error: "workspace_limit_reached" }, { status: 403 });
  }

  const { name } = await request.json();
  if (!name || typeof name !== "string" || name.trim().length === 0) {
    return NextResponse.json({ error: "Name is required" }, { status: 400 });
  }

  const trimmed = name.trim();
  let slug = toSlug(trimmed);

  // Ensure slug is unique per user
  const existing = dbUser.workspaces.map((w) => w.slug);
  let counter = 1;
  let candidateSlug = slug;
  while (existing.includes(candidateSlug)) {
    candidateSlug = `${slug}_${counter++}`;
  }
  slug = candidateSlug;

  const workspace = await prisma.workspace.create({
    data: {
      userId: dbUser.id,
      name: trimmed,
      slug,
      isDefault: false,
      sortOrder: dbUser.workspaces.length,
    },
  });

  // Set as active
  await prisma.user.update({ where: { id: dbUser.id }, data: { activeWorkspaceId: workspace.id } });

  return NextResponse.json({ workspace });
}
