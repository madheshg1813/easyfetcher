// ─── Dodo Payments API client (server-side only) ─────────────────────────────
// Docs: https://docs.dodopayments.com/api-reference

const DODO_API_BASE =
  process.env.DODO_API_MODE === "test"
    ? "https://test.dodopayments.com"
    : "https://live.dodopayments.com";

function apiKey(): string {
  const key = process.env.DODO_API_KEY;
  if (!key) throw new Error("DODO_API_KEY is not set");
  return key;
}

async function dodoFetch(path: string, init: RequestInit): Promise<unknown> {
  const res = await fetch(`${DODO_API_BASE}${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${apiKey()}`,
      "Content-Type": "application/json",
      ...init.headers,
    },
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Dodo API ${init.method} ${path} failed (${res.status}): ${body}`);
  }
  return res.json();
}

interface CheckoutSessionParams {
  productId: string;
  email: string;
  name?: string;
  returnUrl: string;
  trialDays?: number;
}

/** Creates a hosted checkout session; returns the URL to redirect the user to. */
export async function createCheckoutSession(params: CheckoutSessionParams): Promise<string> {
  const body: Record<string, unknown> = {
    product_cart: [{ product_id: params.productId, quantity: 1 }],
    customer: { email: params.email, name: params.name ?? params.email },
    return_url: params.returnUrl,
  };

  if (params.trialDays && params.trialDays > 0) {
    body.subscription_data = { trial_period_days: params.trialDays };
  }

  const data = (await dodoFetch("/checkouts", {
    method: "POST",
    body: JSON.stringify(body),
  })) as { checkout_url?: string };

  if (!data.checkout_url) throw new Error("Dodo API did not return a checkout_url");
  return data.checkout_url;
}

/** Schedules cancellation at the end of the current period (trial or billing cycle). */
export async function cancelSubscriptionAtPeriodEnd(dodoSubId: string): Promise<void> {
  await dodoFetch(`/subscriptions/${dodoSubId}`, {
    method: "PATCH",
    body: JSON.stringify({ cancel_at_next_billing_date: true }),
  });
}
