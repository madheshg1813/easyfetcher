import { auth, currentUser } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { createCheckoutSession } from "@/lib/billing/dodo";
import { isKnownProductId } from "@/lib/billing/plans";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://app.easyfetcher.com";

// POST /api/billing/checkout  { productId, next? }
// Creates a Dodo checkout session and returns the hosted URL.
export async function POST(req: Request) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  let body: { productId?: string; next?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const { productId } = body;
  if (!productId || !isKnownProductId(productId)) {
    return NextResponse.json({ error: "Unknown product" }, { status: 400 });
  }

  // Only allow redirects back into our own app (prevents open redirects)
  const rawNext = body.next ?? "";
  const returnUrl = rawNext.startsWith(`${APP_URL}/`) ? rawNext : `${APP_URL}/dashboard/sources`;

  const clerkUser = await currentUser();
  const email = clerkUser?.emailAddresses[0]?.emailAddress;
  if (!email) return NextResponse.json({ error: "No email on account" }, { status: 400 });

  const name =
    [clerkUser?.firstName, clerkUser?.lastName].filter(Boolean).join(" ") || email;

  // Prevent double-purchasing the Try plan
  const dbUser = await prisma.user.findUnique({
    where: { clerkId: userId },
    select: { plan: true },
  });
  if (dbUser?.plan === "TRY" || (dbUser?.plan !== "FREE" && dbUser?.plan !== undefined)) {
    const { TRY_PLAN_PRODUCT_ID } = await import("@/lib/billing/plans");
    if (productId === TRY_PLAN_PRODUCT_ID && dbUser.plan === "TRY") {
      return NextResponse.json({ error: "You already have an active Try plan" }, { status: 400 });
    }
  }

  try {
    // No trial days — payment is charged immediately for all plans
    const checkoutUrl = await createCheckoutSession({
      productId,
      email,
      name,
      returnUrl,
    });
    return NextResponse.json({ url: checkoutUrl });
  } catch (err) {
    console.error("Failed to create Dodo checkout session:", err);
    return NextResponse.json({ error: "Failed to create checkout session" }, { status: 500 });
  }
}
