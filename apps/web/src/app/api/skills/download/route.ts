import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import type { Plan } from "@easyfetcher/db";
import { SKILL_TEMPLATES } from "@/lib/skills/templates";
import { generateSkillFile } from "@/lib/skills/generator";

const PLAN_ORDER: Plan[] = ["FREE", "STARTER", "PRO", "AGENCY", "ENTERPRISE"];
const MCP_URL = process.env.NEXT_PUBLIC_APP_URL
  ? `${process.env.NEXT_PUBLIC_APP_URL}/api/mcp`
  : "https://app.easyfetcher.com/api/mcp";

export async function GET(request: NextRequest) {
  // ── Auth ────────────────────────────────────────────────────────────────
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const dbUser = await prisma.user.findUnique({ where: { clerkId: userId } });
  if (!dbUser) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  // ── Get skill ID ────────────────────────────────────────────────────────
  const skillId = request.nextUrl.searchParams.get("id");
  if (!skillId) {
    return NextResponse.json({ error: "Missing skill ID" }, { status: 400 });
  }

  const template = SKILL_TEMPLATES.find((t) => t.id === skillId);
  if (!template) {
    return NextResponse.json({ error: "Skill not found" }, { status: 404 });
  }

  // ── Generate the skill file ─────────────────────────────────────────────
  const content = generateSkillFile(template, {
    mcpUrl: MCP_URL,
    apiKey: dbUser.apiKey,
  });

  // ── Return as downloadable file ─────────────────────────────────────────
  const filename = `${template.id}.md`;

  return new NextResponse(content, {
    status: 200,
    headers: {
      "Content-Type": "text/markdown; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });
}
