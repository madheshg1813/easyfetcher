import { auth, currentUser } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import DodoPayments from "dodopayments";
import { prisma } from "@/lib/db";

const dodo = new DodoPayments({
  bearerToken: process.env.DODO_API_KEY!,
  environment: (process.env.DODO_ENV ?? "test_mode") as "test_mode" | "live_mode",
});

export async function POST(request: NextRequest) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const baseUrl = new URL(request.url).origin;

  let dbUser = await prisma.user.findUnique({ where: { clerkId: userId } });
  if (!dbUser) {
    const clerkUser = await currentUser();
    const email = clerkUser?.emailAddresses?.[0]?.emailAddress ?? `${userId}@unknown.local`;
    const name = [clerkUser?.firstName, clerkUser?.lastName].filter(Boolean).join(" ") || null;
    dbUser = await prisma.user.create({ data: { clerkId: userId, email, name } });
  }

  if (dbUser.plan !== "FREE") {
    return NextResponse.json({ error: "Already on a paid plan" }, { status: 400 });
  }

  const body = await request.json().catch(() => ({})) as { billing?: string };
  const isAnnual = body.billing === "annual";

  const productId = isAnnual
    ? process.env.DODO_PRO_ANNUAL_PRODUCT_ID
    : process.env.DODO_PRO_MONTHLY_PRODUCT_ID;

  if (!productId) return NextResponse.json({ error: "Dodo Payments not configured" }, { status: 500 });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const subscription = await dodo.subscriptions.create({
    billing: { city: "", country: "US" as any, state: "", street: "", zipcode: "00000" },
    customer: { email: dbUser.email, name: dbUser.name ?? dbUser.email },
    product_id: productId,
    quantity: 1,
    payment_link: true,
    return_url: `${baseUrl}/dashboard/plan?success=true`,
    metadata: { userId: dbUser.id, billing: isAnnual ? "annual" : "monthly" },
  });

  const url = (subscription as unknown as { payment_link: string }).payment_link;
  return NextResponse.json({ url });
}
