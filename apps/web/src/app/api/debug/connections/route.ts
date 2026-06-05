import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

// Debug endpoint — shows the DB state for a user by API key
// Usage: /api/debug/connections?apiKey=ef_xxx
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const apiKey = searchParams.get("apiKey");

  if (!apiKey) {
    return NextResponse.json({ error: "Pass ?apiKey=ef_xxx" }, { status: 400 });
  }

  const user = await prisma.user.findFirst({
    where: { apiKey },
    include: {
      workspaces: {
        include: {
          connections: true,
        },
      },
      connections: true, // user-level connections (workspaceId = null)
    },
  });

  if (!user) {
    return NextResponse.json({ error: "User not found for this API key" }, { status: 404 });
  }

  return NextResponse.json({
    userId: user.id,
    plan: user.plan,
    activeWorkspaceId: user.activeWorkspaceId,
    workspaces: user.workspaces.map((ws) => ({
      id: ws.id,
      name: ws.name,
      isDefault: ws.isDefault,
      connections: ws.connections.map((c) => ({
        id: c.id,
        platform: c.platform,
        siteUrl: c.siteUrl,
        label: c.label,
        status: c.status,
        workspaceId: c.workspaceId,
      })),
    })),
    connectionsWithoutWorkspace: user.connections
      .filter((c) => !c.workspaceId)
      .map((c) => ({
        id: c.id,
        platform: c.platform,
        siteUrl: c.siteUrl,
        label: c.label,
        status: c.status,
      })),
  });
}
