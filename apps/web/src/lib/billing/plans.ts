// ─── Single source of truth for plans + Dodo product IDs ─────────────────────
import type { Plan } from "@easyfetcher/db";

export const TRIAL_DAYS = 7;

export interface PlanConfig {
  id: Exclude<Plan, "FREE" | "ENTERPRISE">;
  name: string;
  yearlyPrice: number;   // effective $/mo when billed yearly
  monthlyPrice: number;  // $/mo when billed monthly
  credits: number;
  highlight?: boolean;
  yearlyProductId: string;
  monthlyProductId: string;
  features: string[];
}

export const PLANS: PlanConfig[] = [
  {
    id: "STARTER",
    name: "Starter",
    yearlyPrice: 9,
    monthlyPrice: 14,
    credits: 50,
    yearlyProductId: "pdt_0Ng5wo22oONBlqDIQvQQH",
    monthlyProductId: "pdt_0Ng5y8DYr4SO7bAbztKe1",
    features: [
      "50 credits / month",
      "GSC, GA4 & Google My Business",
      "All Claude Skills included",
      "Email support",
    ],
  },
  {
    id: "PRO",
    name: "Pro",
    yearlyPrice: 24,
    monthlyPrice: 29,
    credits: 125,
    highlight: true,
    yearlyProductId: "pdt_0Ng5xPsUKdHXhvmQOsEz9",
    monthlyProductId: "pdt_0Ng5yT8aBWnSvfhryKLOC",
    features: [
      "125 credits / month",
      "All connectors — GSC, GA4, GMB",
      "All Claude Skills included",
      "OAuth calls always free",
      "Priority email support",
    ],
  },
  {
    id: "AGENCY",
    name: "Agency",
    yearlyPrice: 49,
    monthlyPrice: 59,
    credits: 275,
    yearlyProductId: "pdt_0Ng5xi9BNGdxE9t2akkwK",
    monthlyProductId: "pdt_0Ng5ykFTysYI4D73Jx37I",
    features: [
      "275 credits / month",
      "All connectors — GSC, GA4, GMB",
      "All Claude Skills included",
      "Unlimited workspaces",
      "Dedicated Slack support",
    ],
  },
];

// product_id → Plan (used by webhook + checkout validation)
export const PRODUCT_PLAN_MAP: Record<string, Plan> = Object.fromEntries(
  PLANS.flatMap((p) => [
    [p.yearlyProductId, p.id],
    [p.monthlyProductId, p.id],
  ])
);

export function isKnownProductId(productId: string): boolean {
  return productId in PRODUCT_PLAN_MAP;
}
