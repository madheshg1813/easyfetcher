import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import type { Plan } from "@easyfetcher/db";

const TRIAL_PLANS: Plan[] = ["STARTER", "PRO", "AGENCY"];

export async function POST(request: NextRequest) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json();
  const plan: Plan = body?.plan;

  if (!TRIAL_PLANS.includes(plan)) {
    return NextResponse.json({ error: "Invalid plan. Must be STARTER, PRO, or AGENCY." }, { status: 400 });
  }

  const dbUser = await prisma.user.findUnique({ where: { clerkId: userId } });
  if (!dbUser) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  await prisma.user.update({
    where: { clerkId: userId },
    data: { trialPlan: plan },
  });

  return NextResponse.json({ ok: true });
}
