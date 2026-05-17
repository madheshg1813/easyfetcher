import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Check } from "lucide-react";
import { prisma } from "@/lib/db";
import type { Plan } from "@easyfetcher/db";

export const metadata = { title: "Usage & Billing" };

const PLAN_CONFIG: Record<Plan, { name: string; price: string; credits: number; renewsNote: string; features: string[] }> = {
  FREE: {
    name: "Free plan",
    price: "Free",
    credits: 50,
    renewsNote: "Forever free",
    features: ["50 credits per month", "Search Console connector", "3 Claude Skills", "Community support"],
  },
  STARTER: {
    name: "Starter plan",
    price: "$7/mo",
    credits: 250,
    renewsNote: "Renews monthly",
    features: ["250 credits per month", "GSC + GA4 connectors", "All Claude Skills", "Email support"],
  },
  PRO: {
    name: "Pro plan",
    price: "$12/mo",
    credits: 50,
    renewsNote: "Renews monthly",
    features: ["50 credits per month", "All connectors — GSC, GA4, PageSpeed, GMB", "All Claude Skills included", "OAuth connector calls are always free"],
  },
  AGENCY: {
    name: "Agency plan",
    price: "$67/mo",
    credits: 200,
    renewsNote: "Renews monthly",
    features: ["200 credits per month", "All connectors", "All Claude Skills", "Priority support"],
  },
  ENTERPRISE: {
    name: "Enterprise",
    price: "Custom",
    credits: 9999,
    renewsNote: "Custom billing",
    features: ["Unlimited credits", "All connectors", "Custom integrations", "Dedicated support"],
  },
};

const CREDIT_TABLE = [
  { feature: "Rank tracking", poweredBy: "Apify SERP", creditsPerRun: 3, oauthCalls: false },
  { feature: "AI citation tracking", poweredBy: "Apify + LLM", creditsPerRun: 8, oauthCalls: false },
  { feature: "Backlink checker", poweredBy: "Apify", creditsPerRun: 3, oauthCalls: false },
  { feature: "DR checker", poweredBy: "Apify Ahrefs", creditsPerRun: 2, oauthCalls: false },
  { feature: "Traffic data", poweredBy: "Apify", creditsPerRun: 3, oauthCalls: false },
  { feature: "Keyword volume", poweredBy: "Apify", creditsPerRun: 2, oauthCalls: false },
  { feature: "GSC queries", poweredBy: "Google API", creditsPerRun: 0, oauthCalls: true },
  { feature: "GA4 queries", poweredBy: "Google API", creditsPerRun: 0, oauthCalls: true },
];

function daysUntilReset(): number {
  const now = new Date();
  const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);
  return Math.ceil((nextMonth.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
}

function resetDate(): string {
  const now = new Date();
  const next = new Date(now.getFullYear(), now.getMonth() + 1, 1);
  return next.toLocaleDateString("en-US", { month: "long", day: "numeric" });
}

export default async function BillingPage() {
  const { userId } = await auth();
  if (!userId) redirect("/login");

  const dbUser = await prisma.user.findUnique({
    where: { clerkId: userId },
    include: { _count: { select: { promptRuns: true } } },
  });

  const plan: Plan = dbUser?.plan ?? "FREE";
  const config = PLAN_CONFIG[plan];
  const used = dbUser?._count.promptRuns ?? 0;
  const progress = Math.min((used / config.credits) * 100, 100);
  const remaining = Math.max(config.credits - used, 0);
  const days = daysUntilReset();

  return (
    <div className="space-y-5 max-w-4xl">
      <div>
        <h1 className="text-xl font-semibold text-foreground">Usage &amp; billing</h1>
        <p className="text-sm text-muted-foreground mt-1">Your plan, credit balance, and feature usage this month.</p>
      </div>

      {/* Plan card */}
      <div className="rounded-xl border-2 border-primary/40 bg-card p-6">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <h2 className="text-base font-semibold text-foreground">{config.name}</h2>
              <span className="text-[11px] px-2 py-0.5 rounded-full bg-green-500/15 text-green-600 dark:text-green-400 font-semibold">Active</span>
            </div>
            <p className="text-2xl font-bold text-foreground mt-1">{config.price}</p>
            {plan !== "FREE" && plan !== "ENTERPRISE" && (
              <p className="text-xs text-muted-foreground mt-0.5">{config.renewsNote} · Cancel anytime</p>
            )}
            <ul className="mt-4 space-y-1.5">
              {config.features.map((f) => (
                <li key={f} className="flex items-center gap-2 text-xs text-foreground">
                  <Check className="w-3.5 h-3.5 text-primary shrink-0" />
                  {f}
                </li>
              ))}
            </ul>
          </div>
          <div className="text-right shrink-0">
            <p className="text-4xl font-bold text-foreground">{remaining}</p>
            <p className="text-xs text-muted-foreground mt-0.5">credits remaining</p>
            <Link
              href="/dashboard/plan"
              className="mt-4 inline-block px-4 py-2 rounded-lg border border-border text-xs font-medium text-foreground hover:bg-accent transition-colors"
            >
              Manage plan
            </Link>
          </div>
        </div>
      </div>

      {/* Usage + Top feature */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Credits used */}
        <div className="rounded-xl border border-border bg-card p-5">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Credits used this month</p>
          <p className="text-3xl font-bold text-foreground">
            {used} <span className="text-xl text-muted-foreground font-normal">/ {config.credits}</span>
          </p>
          <div className="mt-3 h-2 bg-muted rounded-full overflow-hidden">
            <div className="h-full bg-primary rounded-full" style={{ width: `${progress}%` }} />
          </div>
          <div className="flex justify-between mt-1">
            <span className="text-[11px] text-muted-foreground">0</span>
            <span className="text-[11px] text-muted-foreground">{config.credits}</span>
          </div>
          <p className="text-[11px] text-muted-foreground mt-2 flex items-center gap-1">
            <span className="inline-block w-3 h-3 text-center leading-none">↻</span>
            Resets in {days} days on {resetDate()}
          </p>
        </div>

        {/* Top feature */}
        <div className="rounded-xl border border-border bg-card p-5">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Top feature used</p>
          {used === 0 ? (
            <p className="text-sm text-muted-foreground py-4 text-center">No usage yet this month</p>
          ) : (
            <div className="space-y-3">
              {[
                { name: "Rank tracking", pct: 60 },
                { name: "AI citation", pct: 30 },
                { name: "SEO audit", pct: 10 },
              ].map((item) => (
                <div key={item.name}>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-foreground font-medium">{item.name}</span>
                  </div>
                  <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                    <div className="h-full bg-primary rounded-full" style={{ width: `${item.pct}%` }} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Credits per feature table */}
      <div className="rounded-xl border border-border bg-card overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-border">
          <h2 className="text-sm font-semibold text-foreground">Credits per feature</h2>
          <span className="text-xs text-muted-foreground">What each action costs</span>
        </div>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/30">
              <th className="text-left px-5 py-2.5 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Feature</th>
              <th className="text-left px-5 py-2.5 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Powered by</th>
              <th className="text-left px-5 py-2.5 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Credits per run</th>
              <th className="text-left px-5 py-2.5 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">OAuth calls</th>
            </tr>
          </thead>
          <tbody>
            {CREDIT_TABLE.map((row, i) => (
              <tr key={row.feature} className={i < CREDIT_TABLE.length - 1 ? "border-b border-border" : ""}>
                <td className="px-5 py-3 text-sm text-foreground font-medium">{row.feature}</td>
                <td className="px-5 py-3 text-sm text-muted-foreground">{row.poweredBy}</td>
                <td className="px-5 py-3">
                  {row.creditsPerRun === 0 ? (
                    <span className="text-muted-foreground text-sm">—</span>
                  ) : (
                    <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-primary/10 text-primary text-xs font-semibold">
                      {row.creditsPerRun} credits
                    </span>
                  )}
                </td>
                <td className="px-5 py-3">
                  {row.oauthCalls ? (
                    <span className="text-xs text-green-600 dark:text-green-400 font-medium">Always free</span>
                  ) : (
                    <span className="text-muted-foreground text-sm">—</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
