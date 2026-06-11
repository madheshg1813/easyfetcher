import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { cancelSubscriptionAtPeriodEnd } from "@/lib/billing/dodo";

// POST /api/billing/cancel
// Schedules cancellation at the end of the current period. During a trial this
// means the card is never charged; access continues until the trial/period ends.
export async function POST() {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const dbUser = await prisma.user.findUnique({
    where: { clerkId: userId },
    include: { subscription: true },
  });

  const sub = dbUser?.subscription;
  if (!sub || sub.status !== "active") {
    return NextResponse.json({ error: "No active subscription" }, { status: 400 });
  }
  if (sub.cancelAtPeriodEnd) {
    return NextResponse.json({ ok: true, alreadyCancelled: true });
  }

  try {
    await cancelSubscriptionAtPeriodEnd(sub.dodoSubId);
  } catch (err) {
    console.error("Failed to cancel Dodo subscription:", err);
    return NextResponse.json({ error: "Failed to cancel subscription" }, { status: 500 });
  }

  await prisma.subscription.update({
    where: { id: sub.id },
    data: { cancelAtPeriodEnd: true },
  });

  return NextResponse.json({ ok: true });
}
