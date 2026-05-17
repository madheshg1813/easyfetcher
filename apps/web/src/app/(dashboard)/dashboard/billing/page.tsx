import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Check, CreditCard, Download } from "lucide-react";
import { prisma } from "@/lib/db";
import type { Plan } from "@easyfetcher/db";

export const metadata = { title: "Usage & Billing" };

// Credit pricing with ~50% profit margin over Apify costs
// Apify estimated costs: rank/backlink ~$0.10, AI citation ~$0.40, traffic/KW ~$0.08
// Selling at 2× cost → 50% margin. 1 credit = $0.20
const CREDIT_TABLE = [
  { feature: "Rank tracking",       poweredBy: "Apify SERP",   creditsPerRun: 3,  apifyCost: "$0.10", oauthFree: false },
  { feature: "AI citation tracking",poweredBy: "Apify + LLM",  creditsPerRun: 8,  apifyCost: "$0.40", oauthFree: false },
  { feature: "Backlink checker",    poweredBy: "Apify",         creditsPerRun: 3,  apifyCost: "$0.10", oauthFree: false },
  { feature: "DR checker",          poweredBy: "Apify Ahrefs",  creditsPerRun: 2,  apifyCost: "$0.08", oauthFree: false },
  { feature: "Traffic data",        poweredBy: "Apify",         creditsPerRun: 3,  apifyCost: "$0.10", oauthFree: false },
  { feature: "Keyword volume",      poweredBy: "Apify",         creditsPerRun: 2,  apifyCost: "$0.08", oauthFree: false },
  { feature: "SEO audit",           poweredBy: "Apify",         creditsPerRun: 5,  apifyCost: "$0.20", oauthFree: false },
  { feature: "GSC data fetch",      poweredBy: "Google OAuth",  creditsPerRun: 0,  apifyCost: "Free",  oauthFree: true  },
  { feature: "GA4 data fetch",      poweredBy: "Google OAuth",  creditsPerRun: 0,  apifyCost: "Free",  oauthFree: true  },
  { feature: "PageSpeed / GMB",     poweredBy: "Google OAuth",  creditsPerRun: 0,  apifyCost: "Free",  oauthFree: true  },
];

// Credit top-up packs: cost of 1 credit to us ≈ $0.10, selling at $0.20 → 50% margin
const CREDIT_PACKS = [
  { credits: 25,   price: 5,  label: "Starter",  perCredit: "$0.20" },
  { credits: 75,   price: 12, label: "Growth",   perCredit: "$0.16" },
  { credits: 200,  price: 28, label: "Pro",      perCredit: "$0.14" },
  { credits: 600,  price: 75, label: "Agency",   perCredit: "$0.13" },
];

const PLAN_CONFIG: Record<Plan, {
  name: string; price: string; monthlyPrice: number | null;
  credits: number; features: string[];
}> = {
  FREE:       { name: "Free plan",       price: "Free",   monthlyPrice: null, credits: 10,   features: ["10 credits/month", "Search Console only", "3 Claude Skills"] },
  STARTER:    { name: "Starter plan",    price: "$7/mo",  monthlyPrice: 7,    credits: 50,   features: ["50 credits/month", "GSC + GA4", "All Claude Skills", "Email support"] },
  PRO:        { name: "Pro plan",        price: "$12/mo", monthlyPrice: 12,   credits: 75,   features: ["75 credits/month", "All connectors — GSC, GA4, PageSpeed, GMB", "All Claude Skills included", "OAuth connector calls are always free"] },
  AGENCY:     { name: "Agency plan",     price: "$49/mo", monthlyPrice: 49,   credits: 250,  features: ["250 credits/month", "All connectors", "All Claude Skills", "Priority support", "1 year data retention"] },
  ENTERPRISE: { name: "Enterprise",      price: "Custom", monthlyPrice: null, credits: 9999, features: ["Unlimited credits", "All connectors", "Custom integrations", "Dedicated support", "SLA guarantee"] },
};

function daysUntilReset() {
  const now = new Date();
  const next = new Date(now.getFullYear(), now.getMonth() + 1, 1);
  return Math.ceil((next.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
}

function resetDate() {
  const now = new Date();
  const next = new Date(now.getFullYear(), now.getMonth() + 1, 1);
  return next.toLocaleDateString("en-US", { month: "long", day: "numeric" });
}

// Fake recent usage for demo — in production this comes from activityLogs
const DEMO_USAGE = [
  { feature: "AI citation tracking", domain: "easyfetcher.com", time: "Today, 10:24am", credits: -8 },
  { feature: "Rank tracker",         domain: "easyfetcher.com", time: "Yesterday",       credits: -3 },
  { feature: "DR checker",           domain: "competitor.io",   time: "May 14",           credits: -2 },
  { feature: "SEO audit",            domain: "easyfetcher.com", time: "May 12",           credits: -5 },
  { feature: "Backlink checker",     domain: "easyfetcher.com", time: "May 10",           credits: -3 },
  { feature: "GSC data fetch",       domain: "easyfetcher.com", time: "May 9",            credits: 0  },
  { feature: "GA4 report",           domain: "easyfetcher.com", time: "May 7",            credits: 0  },
];

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
  const creditsLimit = config.credits;
  const creditsUsed = Math.min(used, creditsLimit);
  const creditsRemaining = Math.max(creditsLimit - creditsUsed, 0);
  const progress = creditsLimit >= 9999 ? 5 : Math.min((creditsUsed / creditsLimit) * 100, 100);

  // Fake invoice dates based on current month
  const now = new Date();
  const invoices = [0, 1, 2].map((i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 17);
    return {
      date: d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
      amount: config.monthlyPrice ? `$${config.monthlyPrice}.00` : null,
    };
  }).filter((inv) => inv.amount);

  return (
    <div className="space-y-5 max-w-4xl">
      <div>
        <h1 className="text-xl font-semibold text-foreground">Usage &amp; billing</h1>
        <p className="text-sm text-muted-foreground mt-1">Your plan, credit balance, and feature usage this month.</p>
      </div>

      {/* Plan card */}
      <div className="rounded-xl border-2 border-primary/40 bg-card p-6">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h2 className="text-base font-semibold text-foreground">{config.name}</h2>
              <span className="text-[11px] px-2 py-0.5 rounded-full bg-green-500/15 text-green-600 dark:text-green-400 font-semibold">Active</span>
            </div>
            <div className="flex items-baseline gap-1 mt-1">
              <p className="text-2xl font-bold text-foreground">{config.price}</p>
              {config.monthlyPrice && <span className="text-sm text-muted-foreground">/ month</span>}
            </div>
            {config.monthlyPrice && (
              <p className="text-xs text-muted-foreground mt-0.5">
                Renews on {resetDate()}, {now.getFullYear()} · Cancel anytime
              </p>
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
            <p className="text-5xl font-bold text-foreground">{creditsLimit >= 9999 ? "∞" : creditsRemaining}</p>
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

      {/* Credits used + Top feature */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="rounded-xl border border-border bg-card p-5">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Credits used this month</p>
          <p className="text-3xl font-bold text-foreground">
            {creditsUsed} <span className="text-xl text-muted-foreground font-normal">/ {creditsLimit >= 9999 ? "∞" : creditsLimit}</span>
          </p>
          <div className="mt-3 h-2 bg-muted rounded-full overflow-hidden">
            <div className="h-full bg-primary rounded-full transition-all" style={{ width: `${progress}%` }} />
          </div>
          <div className="flex justify-between mt-1">
            <span className="text-[11px] text-muted-foreground">0</span>
            <span className="text-[11px] text-muted-foreground">{creditsLimit >= 9999 ? "∞" : creditsLimit}</span>
          </div>
          <p className="text-[11px] text-muted-foreground mt-2">↻ Resets in {daysUntilReset()} days on {resetDate()}</p>
        </div>

        <div className="rounded-xl border border-border bg-card p-5">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Top feature used</p>
          {creditsUsed === 0 ? (
            <p className="text-sm text-muted-foreground py-4 text-center">No usage yet this month</p>
          ) : (
            <div className="space-y-3">
              {[
                { name: "Rank tracking", pct: 60 },
                { name: "AI citation", pct: 30 },
                { name: "SEO audit", pct: 10 },
              ].map((item) => (
                <div key={item.name}>
                  <p className="text-xs font-medium text-foreground mb-1">{item.name}</p>
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
        <table className="w-full">
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
                    <span className="text-xs font-semibold text-green-600 dark:text-green-400">Free</span>
                  ) : (
                    <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-primary/10 text-primary text-xs font-semibold">
                      {row.creditsPerRun} credits
                    </span>
                  )}
                </td>
                <td className="px-5 py-3">
                  {row.oauthFree ? (
                    <span className="text-xs font-semibold text-green-600 dark:text-green-400">Unlimited</span>
                  ) : (
                    <span className="text-muted-foreground text-sm">—</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Buy more credits */}
      <div className="rounded-xl border border-border bg-card p-5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-sm font-semibold text-foreground">Buy more credits</h2>
            <p className="text-xs text-muted-foreground mt-0.5">One-time top-ups · Never expire · 1 credit = $0.20</p>
          </div>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {CREDIT_PACKS.map((pack) => (
            <div key={pack.credits} className="rounded-lg border border-border p-4 flex flex-col gap-2 hover:border-primary/50 transition-colors">
              <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">{pack.label}</p>
              <p className="text-2xl font-bold text-foreground">{pack.credits}</p>
              <p className="text-[11px] text-muted-foreground">credits</p>
              <p className="text-sm font-semibold text-foreground">${pack.price}</p>
              <p className="text-[10px] text-muted-foreground">{pack.perCredit}/credit</p>
              <button className="mt-1 w-full py-1.5 rounded-md bg-primary text-primary-foreground text-xs font-semibold hover:bg-primary/90 transition-colors">
                Buy
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Recent usage */}
      <div className="rounded-xl border border-border bg-card overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-border">
          <h2 className="text-sm font-semibold text-foreground">Recent usage</h2>
          <span className="text-xs text-muted-foreground">Last 7 actions this month</span>
        </div>
        <div className="divide-y divide-border">
          {DEMO_USAGE.map((item, i) => (
            <div key={i} className="flex items-center justify-between px-5 py-3">
              <div>
                <span className="text-sm font-medium text-foreground">{item.feature}</span>
                <span className="text-sm text-muted-foreground"> — {item.domain}</span>
              </div>
              <div className="flex items-center gap-6 shrink-0">
                <span className="text-xs text-muted-foreground">{item.time}</span>
                <span className={`text-xs font-semibold w-12 text-right ${item.credits < 0 ? "text-destructive" : "text-green-600 dark:text-green-400"}`}>
                  {item.credits === 0 ? "Free" : `${item.credits} cr`}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Payment method */}
      {config.monthlyPrice && (
        <div className="rounded-xl border border-border bg-card p-5 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-7 rounded border border-border bg-muted flex items-center justify-center">
              <CreditCard className="w-4 h-4 text-muted-foreground" />
            </div>
            <div>
              <p className="text-sm font-medium text-foreground">Visa ending 4242</p>
              <p className="text-xs text-muted-foreground">Expires 09/28</p>
            </div>
          </div>
          <button className="px-4 py-2 rounded-lg border border-border text-xs font-medium text-foreground hover:bg-accent transition-colors">
            Update card
          </button>
        </div>
      )}

      {/* Invoice history */}
      {invoices.length > 0 && (
        <div className="rounded-xl border border-border bg-card overflow-hidden">
          <div className="px-5 py-4 border-b border-border">
            <h2 className="text-sm font-semibold text-foreground">Invoice history</h2>
          </div>
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                <th className="text-left px-5 py-2.5 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Date</th>
                <th className="text-left px-5 py-2.5 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Amount</th>
                <th className="text-left px-5 py-2.5 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Status</th>
                <th className="px-5 py-2.5" />
              </tr>
            </thead>
            <tbody>
              {invoices.map((inv, i) => (
                <tr key={i} className={i < invoices.length - 1 ? "border-b border-border" : ""}>
                  <td className="px-5 py-3 text-sm text-foreground">{inv.date}</td>
                  <td className="px-5 py-3 text-sm text-foreground">{inv.amount}</td>
                  <td className="px-5 py-3">
                    <span className="text-xs font-semibold text-green-600 dark:text-green-400">Paid</span>
                  </td>
                  <td className="px-5 py-3 text-right">
                    <button className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors ml-auto">
                      <Download className="w-3.5 h-3.5" /> PDF
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
