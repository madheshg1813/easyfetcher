import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

// TEMP DEBUG ROUTE — DELETE AFTER FIXING
// Tests every step of /api/connect/confirm to identify the exact crash point
export async function GET() {
  const results: Record<string, unknown> = {};

  try {
    // Step 1: Basic Prisma connectivity
    results.step1_prisma = "testing...";
    const userCount = await prisma.user.count();
    results.step1_prisma = `OK (${userCount} users)`;
  } catch (e: any) {
    results.step1_prisma = `FAIL: ${e.message}`;
    return NextResponse.json(results);
  }

  try {
    // Step 2: Query PendingConnection table (uses Platform enum)
    results.step2_pending = "testing...";
    const pendingCount = await prisma.pendingConnection.count();
    results.step2_pending = `OK (${pendingCount} records)`;
  } catch (e: any) {
    results.step2_pending = `FAIL: ${e.message}`;
    return NextResponse.json(results);
  }

  try {
    // Step 3: Query Connection table (uses Platform enum)
    results.step3_connection = "testing...";
    const connCount = await prisma.connection.count();
    results.step3_connection = `OK (${connCount} records)`;
  } catch (e: any) {
    results.step3_connection = `FAIL: ${e.message}`;
    return NextResponse.json(results);
  }

  try {
    // Step 4: Check Prisma Platform enum values
    results.step4_enum = "checking...";
    // @ts-ignore
    const PrismaEnums = await import("@prisma/client");
    results.step4_enum = {
      Platform: PrismaEnums.Platform ?? "not exported as enum (expected for 6.x)",
    };
  } catch (e: any) {
    results.step4_enum = `FAIL: ${e.message}`;
  }

  results.env = {
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL ?? "NOT SET",
    NODE_ENV: process.env.NODE_ENV,
    DATABASE_URL_set: !!process.env.DATABASE_URL,
    DIRECT_URL_set: !!process.env.DIRECT_URL,
  };

  return NextResponse.json(results, { status: 200 });
}
