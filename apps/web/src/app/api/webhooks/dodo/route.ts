import { Webhook } from "svix";
import { headers } from "next/headers";
import { prisma } from "@/lib/db";
import type { Plan } from "@easyfetcher/db";

// ─── Product ID → Plan mapping ────────────────────────────────────────────────
const PRODUCT_PLAN_MAP: Record<string, Plan> = {
  pdt_0Ng5wo22oONBlqDIQvQQH: "STARTER", // Starter Yearly
  pdt_0Ng5y8DYr4SO7bAbztKe1: "STARTER", // Starter Monthly
  pdt_0Ng5xPsUKdHXhvmQOsEz9: "PRO",     // Pro Yearly
  pdt_0Ng5yT8aBWnSvfhryKLOC: "PRO",     // Pro Monthly
  pdt_0Ng5xi9BNGdxE9t2akkwK: "AGENCY",  // Agency Yearly
  pdt_0Ng5ykFTysYI4D73Jx37I: "AGENCY",  // Agency Monthly
};

type DodoEvent = {
  type: string;
  data: {
    subscription_id?: string;
    payment_id?: string;
    customer?: {
      customer_id: string;
      email?: string;
    };
    product_id?: string;
    status?: string;
    next_billing_date?: string;
  };
};

export async function POST(req: Request) {
  const webhookSecret = process.env.DODO_WEBHOOK_SECRET;

  if (!webhookSecret) {
    console.error("DODO_WEBHOOK_SECRET is not set");
    return new Response("Webhook secret not configured", { status: 500 });
  }

  // ── Verify signature using Svix (Dodo uses Svix under the hood) ────────────
  const headerPayload = await headers();
  const svixId        = headerPayload.get("svix-id");
  const svixTimestamp = headerPayload.get("svix-timestamp");
  const svixSignature = headerPayload.get("svix-signature");

  if (!svixId || !svixTimestamp || !svixSignature) {
    return new Response("Missing svix headers", { status: 400 });
  }

  const rawBody = await req.text();
  const wh = new Webhook(webhookSecret);

  let event: DodoEvent;
  try {
    event = wh.verify(rawBody, {
      "svix-id":        svixId,
      "svix-timestamp": svixTimestamp,
      "svix-signature": svixSignature,
    }) as DodoEvent;
  } catch (err) {
    console.error("Dodo webhook signature verification failed:", err);
    return new Response("Invalid signature", { status: 401 });
  }

  const { type, data } = event;
  console.log(`📦 Dodo webhook: ${type}`);

  // ── subscription.active or payment.succeeded → activate plan ──────────────
  if (type === "subscription.active" || type === "payment.succeeded") {
    const productId     = data.product_id;
    const customerId    = data.customer?.customer_id;
    const customerEmail = data.customer?.email;
    const subId         = data.subscription_id ?? data.payment_id ?? "";
    const plan          = productId ? PRODUCT_PLAN_MAP[productId] : undefined;

    if (!productId || !customerId || !plan) {
      console.warn("Dodo webhook: missing product_id, customer_id, or unknown plan", {
        productId, customerId, plan,
      });
      return new Response("OK", { status: 200 });
    }

    const user = customerEmail
      ? await prisma.user.findUnique({ where: { email: customerEmail } })
      : null;

    if (!user) {
      console.warn("Dodo webhook: no user found for email", customerEmail);
      return new Response("OK", { status: 200 });
    }

    const periodEnd = data.next_billing_date
      ? new Date(data.next_billing_date)
      : new Date(Date.now() + 31 * 24 * 60 * 60 * 1000);

    await prisma.$transaction([
      prisma.subscription.upsert({
        where: { userId: user.id },
        create: {
          userId:          user.id,
          dodoCustomerId:  customerId,
          dodoProductId:   productId,
          dodoSubId:       subId,
          status:          "active",
          currentPeriodEnd: periodEnd,
        },
        update: {
          dodoCustomerId:  customerId,
          dodoProductId:   productId,
          dodoSubId:       subId,
          status:          "active",
          currentPeriodEnd: periodEnd,
        },
      }),
      prisma.user.update({
        where: { id: user.id },
        data:  { plan },
      }),
    ]);

    console.log(`✅ Plan activated: ${customerEmail} → ${plan}`);
  }

  // ── subscription.cancelled / expired → downgrade to FREE ──────────────────
  if (type === "subscription.cancelled" || type === "subscription.expired") {
    const subId = data.subscription_id;
    if (!subId) return new Response("OK", { status: 200 });

    const subscription = await prisma.subscription.findUnique({
      where: { dodoSubId: subId },
    });

    if (subscription) {
      await prisma.$transaction([
        prisma.subscription.update({
          where: { dodoSubId: subId },
          data:  { status: type === "subscription.cancelled" ? "cancelled" : "expired" },
        }),
        prisma.user.update({
          where: { id: subscription.userId },
          data:  { plan: "FREE" },
        }),
      ]);
      console.log(`🔴 Subscription ${type}: userId=${subscription.userId} → FREE`);
    }
  }

  return new Response("OK", { status: 200 });
}
