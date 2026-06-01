// This endpoint previously set a trial plan during onboarding.
// Since we no longer offer free trials, plan selection happens via Dodo Payments
// on the marketing pricing page. This route is kept as a stub to avoid 404s
// from any old clients that may call it.

import { NextResponse } from "next/server";

export async function POST() {
  return NextResponse.json(
    { ok: true, message: "Plan selection now happens via Dodo Payments checkout." },
    { status: 200 }
  );
}
