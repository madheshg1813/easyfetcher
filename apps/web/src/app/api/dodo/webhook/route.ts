import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import crypto from "crypto";

function verifySignature(payload: string, signature: string, secret: string): boolean {
  try {
    const hmac = crypto.createHmac("sha256", secret).update(payload).digest("hex");
    return crypto.timingSafeEqual(Buffer.from(hmac), Buffer.from(signature));
  } catch {
    return false;
  }
}

export async function POST(request: NextRequest) {
  const body = await request.text();
  const signature = request.headers.get("webhook-signature") ?? "";
  const secret = process.env.DODO_WEBHOOK_SECRET ?? "";

  if (secret && !verifySignature(body, signature, secret)) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  const event = JSON.parse(body) as {
    type: string;
    data: {
      subscription_id?: string;
      customer_id?: string;
      product_id?: string;
      status?: string;
      current_period_end?: string;
      metadata?: { userId?: string };
    };
  };

  const { type, data } = event;
  const userId = data.metadata?.userId;

  if (!userId) return NextResponse.json({ received: true });

  if (type === "subscription.active" || type === "subscription.created") {
    await prisma.user.update({ where: { id: userId }, data: { plan: "PRO" } });

    await prisma.subscription.upsert({
      where: { userId },
      create: {
        userId,
        dodoCustomerId: data.customer_id ?? "",
        dodoProductId: data.product_id ?? "",
        dodoSubId: data.subscription_id ?? "",
        status: data.status ?? "active",
        currentPeriodEnd: data.current_period_end ? new Date(data.current_period_end) : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      },
      update: {
        dodoCustomerId: data.customer_id ?? "",
        dodoProductId: data.product_id ?? "",
        dodoSubId: data.subscription_id ?? "",
        status: data.status ?? "active",
        currentPeriodEnd: data.current_period_end ? new Date(data.current_period_end) : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      },
    });
  }

  if (type === "subscription.cancelled" || type === "subscription.expired") {
    await prisma.user.update({ where: { id: userId }, data: { plan: "FREE" } });
    await prisma.subscription.updateMany({
      where: { userId },
      data: { status: type === "subscription.cancelled" ? "cancelled" : "expired" },
    });
  }

  if (type === "subscription.renewed") {
    await prisma.subscription.updateMany({
      where: { userId },
      data: {
        status: "active",
        currentPeriodEnd: data.current_period_end ? new Date(data.current_period_end) : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      },
    });
  }

  return NextResponse.json({ received: true });
}
