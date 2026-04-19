import { Webhook } from "svix";
import { headers } from "next/headers";
import type { WebhookEvent } from "@clerk/nextjs/server";
import { prisma } from "@/lib/db";

export async function POST(req: Request) {
  const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET;

  if (!WEBHOOK_SECRET) {
    console.error("CLERK_WEBHOOK_SECRET is not set");
    return new Response("Webhook secret not configured", { status: 500 });
  }

  // Get svix headers
  const headerPayload = await headers();
  const svixId = headerPayload.get("svix-id");
  const svixTimestamp = headerPayload.get("svix-timestamp");
  const svixSignature = headerPayload.get("svix-signature");

  if (!svixId || !svixTimestamp || !svixSignature) {
    return new Response("Missing svix headers", { status: 400 });
  }

  // Verify webhook signature
  const payload = await req.json();
  const body = JSON.stringify(payload);
  const wh = new Webhook(WEBHOOK_SECRET);

  let evt: WebhookEvent;

  try {
    evt = wh.verify(body, {
      "svix-id": svixId,
      "svix-timestamp": svixTimestamp,
      "svix-signature": svixSignature,
    }) as WebhookEvent;
  } catch (err) {
    console.error("Webhook verification failed:", err);
    return new Response("Webhook verification failed", { status: 400 });
  }

  // Handle events
  const eventType = evt.type;

  if (eventType === "user.created") {
    const { id, email_addresses, first_name, last_name } = evt.data;

    const primaryEmail = email_addresses.find(
      (e) => e.id === evt.data.primary_email_address_id
    );
    const email = primaryEmail?.email_address ?? email_addresses[0]?.email_address;

    if (!email) {
      console.error("No email found for user", id);
      return new Response("No email found", { status: 400 });
    }

    const name = [first_name, last_name].filter(Boolean).join(" ") || null;

    try {
      await prisma.user.create({
        data: {
          clerkId: id,
          email,
          name,
        },
      });
      console.log(`✅ User created in DB: ${email} (${id})`);
    } catch (err) {
      console.error("Failed to create user in DB:", err);
      return new Response("Failed to create user", { status: 500 });
    }
  }

  if (eventType === "user.updated") {
    const { id, email_addresses, first_name, last_name } = evt.data;

    const primaryEmail = email_addresses.find(
      (e) => e.id === evt.data.primary_email_address_id
    );
    const email = primaryEmail?.email_address ?? email_addresses[0]?.email_address;
    const name = [first_name, last_name].filter(Boolean).join(" ") || null;

    try {
      await prisma.user.update({
        where: { clerkId: id },
        data: { email: email!, name },
      });
    } catch (err) {
      // User might not exist in DB yet (race condition) — ignore
      console.warn("user.updated: user not found in DB", id, err);
    }
  }

  if (eventType === "user.deleted") {
    const { id } = evt.data;
    if (id) {
      try {
        await prisma.user.delete({ where: { clerkId: id } });
        console.log(`🗑️ User deleted from DB: ${id}`);
      } catch (err) {
        console.warn("user.deleted: user not found in DB", id, err);
      }
    }
  }

  return new Response("OK", { status: 200 });
}
