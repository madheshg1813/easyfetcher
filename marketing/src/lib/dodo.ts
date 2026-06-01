// ─── Dodo Payments — Product IDs ─────────────────────────────────────────────

export const DODO_PRODUCTS = {
  STARTER_YEARLY:  "pdt_0Ng5wo22oONBlqDIQvQQH",
  PRO_YEARLY:      "pdt_0Ng5xPsUKdHXhvmQOsEz9",
  AGENCY_YEARLY:   "pdt_0Ng5xi9BNGdxE9t2akkwK",
  STARTER_MONTHLY: "pdt_0Ng5y8DYr4SO7bAbztKe1",
  PRO_MONTHLY:     "pdt_0Ng5yT8aBWnSvfhryKLOC",
  AGENCY_MONTHLY:  "pdt_0Ng5ykFTysYI4D73Jx37I",
} as const;

const APP_URL = "https://app.easyfetcher.com";
const DODO_BASE = "https://checkout.dodopayments.com/buy";

/**
 * Builds a Dodo Payments hosted checkout URL.
 * After successful payment, Dodo redirects to /signup so the user can create
 * their account (which the webhook will then link to the subscription).
 */
export function getDodoCheckoutUrl(productId: string): string {
  const redirectUrl = encodeURIComponent(`${APP_URL}/signup`);
  return `${DODO_BASE}/${productId}?quantity=1&redirect_url=${redirectUrl}`;
}

// ─── Plan metadata ─────────────────────────────────────────────────────────────

export interface PlanInfo {
  readonly id: "STARTER" | "PRO" | "AGENCY";
  readonly name: string;
  readonly yearlyPrice: number;
  readonly monthlyPrice: number;
  readonly yearlyTotal: number;
  readonly yearlyProductId: string;
  readonly monthlyProductId: string;
  readonly highlight?: boolean;
  readonly description: string;
  readonly features: readonly string[];
}

export const PLANS: readonly PlanInfo[] = [
  {
    id: "STARTER",
    name: "Starter",
    yearlyPrice: 9,
    monthlyPrice: 14,
    yearlyTotal: 108,
    yearlyProductId: DODO_PRODUCTS.STARTER_YEARLY,
    monthlyProductId: DODO_PRODUCTS.STARTER_MONTHLY,
    description: "Perfect for solo marketers and indie makers.",
    features: [
      "50 credits / month",
      "GSC, GA4 & Google My Business",
      "All Claude Skills included",
      "1 workspace · up to 5 sites",
      "Email support",
    ],
  },
  {
    id: "PRO",
    name: "Pro",
    yearlyPrice: 24,
    monthlyPrice: 29,
    yearlyTotal: 288,
    yearlyProductId: DODO_PRODUCTS.PRO_YEARLY,
    monthlyProductId: DODO_PRODUCTS.PRO_MONTHLY,
    highlight: true,
    description: "For freelancers managing multiple clients.",
    features: [
      "125 credits / month",
      "All connectors — 10+ platforms",
      "All Claude Skills included",
      "3 workspaces · unlimited sites",
      "OAuth calls always free",
      "Priority email support",
    ],
  },
  {
    id: "AGENCY",
    name: "Agency",
    yearlyPrice: 49,
    monthlyPrice: 59,
    yearlyTotal: 588,
    yearlyProductId: DODO_PRODUCTS.AGENCY_YEARLY,
    monthlyProductId: DODO_PRODUCTS.AGENCY_MONTHLY,
    description: "For agencies running at scale.",
    features: [
      "275 credits / month",
      "All connectors — 10+ platforms",
      "All Claude Skills included",
      "15 workspaces · unlimited sites",
      "Dedicated Slack support",
      "1 year data retention",
    ],
  },
];
