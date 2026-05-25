import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { Check, Zap } from "lucide-react";
import { prisma } from "@/lib/db";
import type { Plan } from "@easyfetcher/db";

export const metadata = { title: "Plan" };

const plans: {
  id: Plan;
  name: string;
  monthlyPrice: string;
  annualPrice: string;
  annualNote: string;
  description: string;
  highlight?: boolean;
  features: string[];
}[] = [
  {
    id: "FREE",
    name: "Free",
    monthlyPrice: "$0",
    annualPrice: "$0",
    annualNote: "Forever free",
    description: "Perfect to explore EasyFetcher with your own site.",
    features: [
      "Google Search Console (always free)",
      "1 workspace",
      "1 site",
      "1,000 MCP calls/month",
      "3 prompt templates",
      "Community support",
    ],
  },
  {
    id: "STARTER",
    name: "Starter",
    monthlyPrice: "$7",
    annualPrice: "$5",
    annualNote: "billed $60/yr",
    description: "For solo marketers managing one brand.",
    features: [
      "GSC + GA4 + Google My Business",
      "1 workspace",
      "Up to 5 sites / accounts",
      "10,000 MCP calls/month",
      "Full prompt library",
      "Email support",
    ],
  },
  {
    id: "PRO",
    name: "Pro",
    monthlyPrice: "$27",
    annualPrice: "$22",
    annualNote: "billed $264/yr",
    description: "For freelancers managing a few clients.",
    highlight: true,
    features: [
      "All connectors (10+ platforms)",
      "3 workspaces (clients)",
      "Unlimited sites / accounts",
      "50,000 MCP calls/month",
      "Full prompt library + builder",
      "Priority email support",
    ],
  },
  {
    id: "AGENCY",
    name: "Agency",
    monthlyPrice: "$67",
    annualPrice: "$54",
    annualNote: "billed $648/yr",
    description: "For agencies managing 15+ clients.",
    features: [
      "All connectors (10+ platforms)",
      "15 workspaces (clients)",
      "Unlimited sites / accounts",
      "200,000 MCP calls/month",
      "Full prompt library + builder",
      "Dedicated Slack support",
      "1 year data retention",
    ],
  },
  {
    id: "ENTERPRISE",
    name: "Enterprise",
    monthlyPrice: "Custom",
    annualPrice: "Custom",
    annualNote: "contact us",
    description: "For large teams needing SSO, SLAs, and custom limits.",
    features: [
      "Everything in Agency",
      "Unlimited workspaces",
      "Unlimited MCP calls",
      "SSO / SAML",
      "Custom connectors",
      "Dedicated account manager",
      "SLA guarantee",
    ],
  },
];

export default async function PlanPage() {
  const { userId } = await auth();
  if (!userId) redirect("/login");

  const dbUser = await prisma.user.findUnique({ where: { clerkId: userId } });
  const currentPlan: Plan = dbUser?.plan ?? "FREE";

  return (
    <div className="space-y-6 max-w-6xl">
      <div>
        <h1 className="text-xl font-bold text-foreground">Choose your plan</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Save up to 30% with annual billing · Stripe billing coming soon
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
        {plans.map((plan) => {
          const isCurrent = plan.id === currentPlan;
          return (
            <div
              key={plan.id}
              className={`relative rounded-xl border bg-card p-5 flex flex-col gap-4 ${
                plan.highlight
                  ? "border-primary ring-1 ring-primary"
                  : isCurrent
                    ? "border-primary/60"
                    : "border-border"
              }`}
            >
              {plan.highlight && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-primary text-primary-foreground text-[10px] font-bold whitespace-nowrap">
                    <Zap className="w-2.5 h-2.5" /> Most popular
                  </span>
                </div>
              )}

              <div>
                <div className="flex items-center justify-between mb-1">
                  <h3 className="text-sm font-semibold text-foreground">{plan.name}</h3>
                  {isCurrent && (
                    <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-primary/15 text-primary font-semibold">
                      Current
                    </span>
                  )}
                </div>
                <div className="flex items-end gap-1">
                  <span className="text-2xl font-bold text-foreground">{plan.monthlyPrice}</span>
                  {plan.monthlyPrice !== "Custom" && <span className="text-xs text-muted-foreground mb-1">/mo</span>}
                </div>
                <p className="text-[10px] text-muted-foreground">{plan.annualNote}</p>
                <p className="text-[11px] text-muted-foreground mt-2 leading-snug">{plan.description}</p>
              </div>

              <ul className="space-y-1.5 flex-1">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-1.5 text-[11px] text-foreground">
                    <Check className="w-3 h-3 text-primary shrink-0 mt-0.5" />
                    {feature}
                  </li>
                ))}
              </ul>

              <button
                disabled={isCurrent}
                className={`w-full py-2 px-3 rounded-md text-xs font-semibold transition-colors ${
                  isCurrent
                    ? "bg-muted text-muted-foreground cursor-not-allowed"
                    : plan.highlight
                      ? "bg-primary text-primary-foreground hover:bg-primary/90"
                      : "border border-primary text-primary hover:bg-primary/10"
                }`}
              >
                {isCurrent ? "Current plan" : plan.monthlyPrice === "Custom" ? "Contact us" : `Upgrade to ${plan.name}`}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
