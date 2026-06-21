// ─── Dodo Payments — Product IDs ─────────────────────────────────────────────

export const DODO_PRODUCTS = {
  STARTER_YEARLY:  "pdt_0Ng5wo22oONBlqDIQvQQH",
  PRO_YEARLY:      "pdt_0Ng5xPsUKdHXhvmQOsEz9",
  AGENCY_YEARLY:   "pdt_0Ng5xi9BNGdxE9t2akkwK",
  STARTER_MONTHLY: "pdt_0Ng5y8DYr4SO7bAbztKe1",
  PRO_MONTHLY:     "pdt_0Ng5yT8aBWnSvfhryKLOC",
  AGENCY_MONTHLY:  "pdt_0Ng5ykFTysYI4D73Jx37I",
  // TODO: replace with the real $4 one-time Try Plan product ID from Dodo.
  // Until set, the Try Plan CTA routes users to signup (where the $4 plan
  // can be selected during onboarding).
  TRY_PLAN:        "",
} as const;

const APP_URL = "https://app.easyfetcher.com";
const SIGNUP_URL = `${APP_URL}/signup`;
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

// ─── Try Plan (one-time $4 / 15 days) ────────────────────────────────────────

export interface TryPlanInfo {
  readonly name: string;
  readonly price: number;        // one-time charge in USD
  readonly days: number;         // validity window
  readonly productId: string;    // empty until the Dodo product is created
  readonly description: string;
  readonly features: readonly string[];
}

export const TRY_PLAN: TryPlanInfo = {
  name: "Try Plan",
  price: 4,
  days: 15,
  productId: DODO_PRODUCTS.TRY_PLAN,
  description: "Not sure yet? Try the full product for the price of a coffee.",
  features: [
    "25 credits total",
    "75 AI queries total",
    "All features from the Agency plan",
  ],
};

/**
 * CTA target for the Try Plan. Uses the direct Dodo checkout when the product
 * ID is set; otherwise falls back to signup so the link is never broken.
 */
export function getTryPlanUrl(): string {
  return TRY_PLAN.productId ? getDodoCheckoutUrl(TRY_PLAN.productId) : SIGNUP_URL;
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

// Feature set shared across every paid plan.
const COMMON_FEATURES = [
  "All Connectors",
  "AI Skills",
  "Prompt Library Access",
  "Keywords Tracking",
  "Backlink Tracking",
  "Competitor Research",
  "SEO Audit",
  "Technical Audit",
  "Unlimited Clients",
] as const;

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
      ...COMMON_FEATURES,
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
      ...COMMON_FEATURES,
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
      ...COMMON_FEATURES,
      "Dedicated Slack support",
    ],
  },
];
