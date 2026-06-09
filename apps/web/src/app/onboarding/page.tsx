import { auth, currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { Zap, Check } from "lucide-react";

// Dodo product IDs → checkout URLs
const DODO_BASE = "https://checkout.dodopayments.com/buy";

const PLANS = [
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

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://app.easyfetcher.com";

function checkoutUrl(productId: string, email: string) {
  const params = new URLSearchParams({
    email,
    redirect_url: `${APP_URL}/dashboard`,
    quantity: "1",
  });
  return `${DODO_BASE}/${productId}?${params.toString()}`;
}

export default async function OnboardingPage() {
  const { userId } = await auth();
  if (!userId) redirect("/login");

  const clerkUser = await currentUser();
  const email = clerkUser?.emailAddresses[0]?.emailAddress ?? "";

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <div className="w-full max-w-3xl">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="w-12 h-12 rounded-xl bg-primary flex items-center justify-center mx-auto mb-4">
            <Zap className="w-6 h-6 text-primary-foreground" />
          </div>
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Choose a plan to get started
          </h1>
          <p className="text-sm text-muted-foreground max-w-sm mx-auto">
            EasyFetcher requires an active subscription. Pick a plan to unlock full access.
          </p>
          {email && (
            <p className="text-xs text-muted-foreground mt-2">
              Purchasing for <span className="font-medium text-foreground">{email}</span>
            </p>
          )}
        </div>

        {/* Plans grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          {PLANS.map((plan) => (
            <div
              key={plan.id}
              className={`relative rounded-xl border-2 p-5 flex flex-col gap-4 bg-card ${
                plan.highlight ? "border-primary ring-2 ring-primary/20" : "border-border"
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
                <h3 className="text-sm font-semibold text-foreground mb-2">{plan.name}</h3>
                <div className="flex items-end gap-1 mb-0.5">
                  <span className="text-3xl font-bold text-foreground">${plan.yearlyPrice}</span>
                  <span className="text-xs text-muted-foreground mb-1">/mo</span>
                </div>
                <p className="text-[10px] text-muted-foreground">
                  Billed ${plan.yearlyPrice * 12}/year · or ${plan.monthlyPrice}/mo
                </p>
                <div className="mt-3 inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-primary/10 border border-primary/20">
                  <span className="text-xs font-bold text-primary">{plan.credits}</span>
                  <span className="text-[10px] text-primary/80">credits/mo</span>
                </div>
              </div>

              <ul className="space-y-1.5 flex-1">
                {plan.features.map((feat) => (
                  <li key={feat} className="flex items-start gap-1.5 text-[11px] text-foreground">
                    <Check className="w-3 h-3 text-primary shrink-0 mt-0.5" />
                    {feat}
                  </li>
                ))}
              </ul>

              <div className="flex flex-col gap-2">
                <a
                  href={checkoutUrl(plan.yearlyProductId, email)}
                  className={`w-full py-2.5 rounded-lg text-xs font-semibold text-center transition-colors ${
                    plan.highlight
                      ? "bg-primary text-primary-foreground hover:bg-primary/90"
                      : "bg-foreground text-background hover:bg-foreground/90"
                  }`}
                >
                  Get {plan.name} yearly
                </a>
                <a
                  href={checkoutUrl(plan.monthlyProductId, email)}
                  className="w-full py-2 rounded-lg text-xs font-medium text-center border border-border text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
                >
                  Monthly — ${plan.monthlyPrice}/mo
                </a>
              </div>
            </div>
          ))}
        </div>

        <p className="text-center text-[11px] text-muted-foreground">
          After completing your purchase you will be redirected back to the dashboard automatically.
        </p>
      </div>
    </div>
  );
}
