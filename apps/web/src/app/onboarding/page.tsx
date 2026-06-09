import { auth, currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { Zap, Check, Shield, RefreshCw, Headphones, Lock } from "lucide-react";

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
    features: [
      "125 credits / month",
      "All connectors — GSC, GA4, GMB",
      "All Claude Skills included",
      "OAuth calls always free",
      "Priority email support",
    ],
    yearlyProductId: "pdt_0Ng5xPsUKdHXhvmQOsEz9",
    monthlyProductId: "pdt_0Ng5yT8aBWnSvfhryKLOC",
  },
  {
    id: "AGENCY",
    name: "Agency",
    yearlyPrice: 49,
    monthlyPrice: 59,
    credits: 275,
    features: [
      "275 credits / month",
      "All connectors — GSC, GA4, GMB",
      "All Claude Skills included",
      "Unlimited workspaces",
      "Dedicated Slack support",
    ],
    yearlyProductId: "pdt_0Ng5xi9BNGdxE9t2akkwK",
    monthlyProductId: "pdt_0Ng5ykFTysYI4D73Jx37I",
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
    <div className="min-h-screen bg-background">
      {/* Top nav bar */}
      <header className="border-b border-border bg-card/60 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-primary flex items-center justify-center shrink-0">
              <Zap className="w-4 h-4 text-primary-foreground" />
            </div>
            <span className="font-bold text-foreground text-sm">EasyFetcher</span>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Lock className="w-3 h-3" />
            Secure checkout
          </div>
        </div>
      </header>

      <div className="max-w-3xl mx-auto px-6 py-12">
        {/* Hero */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20 mb-5">
            <Zap className="w-3.5 h-3.5 text-primary" />
            <span className="text-xs font-semibold text-primary">One step away from your marketing AI stack</span>
          </div>
          <h1 className="text-3xl font-bold text-foreground mb-3">
            Choose your plan
          </h1>
          <p className="text-sm text-muted-foreground max-w-sm mx-auto">
            Connect your data sources and query them with Claude — GSC, GA4, Google My Business and more.
          </p>
          {email && (
            <div className="mt-4 inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-muted border border-border text-xs text-muted-foreground">
              <div className="w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center">
                <span className="text-[10px] font-bold text-primary">{email.charAt(0).toUpperCase()}</span>
              </div>
              Activating for <span className="font-medium text-foreground">{email}</span>
            </div>
          )}
        </div>

        {/* Trust bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-10">
          {[
            { icon: Shield, label: "Secure payment", sub: "256-bit SSL" },
            { icon: RefreshCw, label: "Cancel anytime", sub: "No lock-in" },
            { icon: Zap, label: "Instant access", sub: "After payment" },
            { icon: Headphones, label: "Email support", sub: "We reply fast" },
          ].map(({ icon: Icon, label, sub }) => (
            <div key={label} className="flex flex-col items-center gap-1 rounded-xl border border-border bg-card p-3 text-center">
              <Icon className="w-4 h-4 text-primary mb-0.5" />
              <p className="text-xs font-semibold text-foreground">{label}</p>
              <p className="text-[10px] text-muted-foreground">{sub}</p>
            </div>
          ))}
        </div>

        {/* Plans */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          {PLANS.map((plan) => (
            <div
              key={plan.id}
              className={`relative rounded-xl border-2 p-5 flex flex-col gap-4 bg-card ${
                plan.highlight
                  ? "border-primary shadow-lg shadow-primary/10"
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
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">{plan.name}</p>
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

              <ul className="space-y-2 flex-1">
                {plan.features.map((feat) => (
                  <li key={feat} className="flex items-start gap-2 text-[11px] text-foreground">
                    <div className="w-4 h-4 rounded-full bg-primary/15 flex items-center justify-center shrink-0 mt-0.5">
                      <Check className="w-2.5 h-2.5 text-primary" />
                    </div>
                    {feat}
                  </li>
                ))}
              </ul>

              <div className="flex flex-col gap-2 pt-1">
                <a
                  href={checkoutUrl(plan.yearlyProductId, email)}
                  className={`w-full py-2.5 rounded-lg text-xs font-semibold text-center transition-colors ${
                    plan.highlight
                      ? "bg-primary text-primary-foreground hover:bg-primary/90"
                      : "bg-foreground text-background hover:bg-foreground/90"
                  }`}
                >
                  Get {plan.name} — yearly
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

        {/* Bottom trust */}
        <div className="text-center space-y-3">
          <p className="text-[11px] text-muted-foreground">
            After completing your purchase you will be redirected back to the dashboard automatically.
          </p>
          <div className="flex items-center justify-center gap-1.5 text-[11px] text-muted-foreground">
            <Lock className="w-3 h-3" />
            <span>Payments processed securely by <span className="font-medium text-foreground">Dodo Payments</span></span>
          </div>
          <p className="text-[10px] text-muted-foreground">
            Cancel anytime · No hidden fees · Instant access after payment
          </p>
        </div>
      </div>
    </div>
  );
}
