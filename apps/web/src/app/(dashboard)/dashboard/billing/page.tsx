import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Check, CreditCard, Download, ExternalLink } from "lucide-react";
import { prisma } from "@/lib/db";
import type { Plan } from "@easyfetcher/db";
import { StartTrialPlans } from "@/components/billing/start-trial";
import { TrialManageCard } from "@/components/billing/trial-manage";
import { PLANS } from "@/lib/billing/plans";

export const metadata = { title: "Usage & Billing" };

// ─── Plan config ──────────────────────────────────────────────────────────────
const PLAN_CONFIG: Record<Plan, {
  name: string;
  yearlyPrice: number | null;
  monthlyPrice: number | null;
  credits: number;
  features: string[];
}> = {
  FREE: {
    name: "No active plan", yearlyPrice: null, monthlyPrice: null, credits: 0,
    features: [],
  },
  STARTER: {
    name: "Starter", yearlyPrice: 9, monthlyPrice: 14, credits: 50,
    features: ["50 credits/month", "GSC, GA4 & Google My Business", "All Claude Skills included", "1 workspace · up to 5 sites", "Email support"],
  },
  PRO: {
    name: "Pro", yearlyPrice: 24, monthlyPrice: 29, credits: 125,
    features: ["125 credits/month", "All connectors — 10+ platforms", "All Claude Skills included", "3 workspaces · unlimited sites", "OAuth calls always free", "Priority support"],
  },
  AGENCY: {
    name: "Agency", yearlyPrice: 49, monthlyPrice: 59, credits: 275,
    features: ["275 credits/month", "All connectors — 10+ platforms", "All Claude Skills included", "15 workspaces · unlimited sites", "Dedicated Slack support", "1 year data retention"],
  },
  ENTERPRISE: {
    name: "Enterprise", yearlyPrice: null, monthlyPrice: null, credits: 9999,
    features: ["Unlimited credits", "All connectors", "Custom integrations", "Dedicated support"],
  },
};

// ─── Credits per feature ─────────────────────────────────────────────────────
const CREDIT_TABLE = [
  { feature: "Rank tracking",        poweredBy: "Real-time data",  creditsPerRun: 3, oauthFree: false },
  { feature: "AI citation tracking", poweredBy: "AI-powered",      creditsPerRun: 8, oauthFree: false },
  { feature: "Backlink checker",     poweredBy: "Real-time data",  creditsPerRun: 3, oauthFree: false },
  { feature: "DR checker",           poweredBy: "Real-time data",  creditsPerRun: 2, oauthFree: false },
  { feature: "Traffic data",         poweredBy: "Real-time data",  creditsPerRun: 3, oauthFree: false },
  { feature: "Keyword volume",       poweredBy: "Real-time data",  creditsPerRun: 2, oauthFree: false },
  { feature: "SEO audit",            poweredBy: "AI-powered",      creditsPerRun: 5, oauthFree: false },
  { feature: "GSC data fetch",       poweredBy: "Google OAuth",    creditsPerRun: 0, oauthFree: true  },
  { feature: "GA4 data fetch",       poweredBy: "Google OAuth",    creditsPerRun: 0, oauthFree: true  },
  { feature: "PageSpeed Insights",    poweredBy: "Google API key",  creditsPerRun: 0, oauthFree: true  },
];

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

export default async function BillingPage() {
  const { userId } = await auth();
  if (!userId) redirect("/login");

  const dbUser = await prisma.user.findUnique({
    where: { clerkId: userId },
    include: {
      _count: { select: { promptRuns: true } },
      activityLogs: {
        orderBy: { createdAt: "desc" },
        take: 7,
      },
      subscription: true,
    },
  });

  const plan: Plan = dbUser?.plan ?? "FREE";
  const isUnpaid = plan === "FREE";
  const config = PLAN_CONFIG[plan];
  const creditsLimit = config.credits;
  const creditsUsed = Math.min(dbUser?._count.promptRuns ?? 0, creditsLimit || 0);
  const creditsRemaining = Math.max((creditsLimit || 0) - creditsUsed, 0);
  const progress = creditsLimit >= 9999 ? 5 : creditsLimit === 0 ? 0 : Math.min((creditsUsed / creditsLimit) * 100, 100);
  const hasUsage = creditsUsed > 0;
  const hasInvoices = !isUnpaid && config.yearlyPrice !== null;
  const now = new Date();

  // ── Trial state ───────────────────────────────────────────────────────────
  const sub = dbUser?.subscription;
  const onTrial =
    !isUnpaid && sub?.status === "active" && !!sub.trialEnd && sub.trialEnd.getTime() > now.getTime();
  const trialDaysLeft = onTrial
    ? Math.max(1, Math.ceil((sub!.trialEnd!.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)))
    : 0;

  // What the card will be charged after the trial, based on the purchased product
  const purchasedPlan = sub ? PLANS.find(
    (p) => p.yearlyProductId === sub.dodoProductId || p.monthlyProductId === sub.dodoProductId
  ) : undefined;
  const isYearly = purchasedPlan?.yearlyProductId === sub?.dodoProductId;
  const chargeAmount = purchasedPlan
    ? isYearly
      ? `$${purchasedPlan.yearlyPrice * 12}/year`
      : `$${purchasedPlan.monthlyPrice}/month`
    : "";

  return (
    <div className="space-y-5 max-w-4xl">
      <div>
        <h1 className="text-xl font-semibold text-foreground">Usage & billing</h1>
        <p className="text-sm text-muted-foreground mt-1">Your plan, credit balance, and feature usage this month.</p>
      </div>

      {/* ── Trial status (active trial or scheduled cancellation) ── */}
      {onTrial && (
        <TrialManageCard
          daysLeft={trialDaysLeft}
          trialEnd={sub!.trialEnd!.toISOString()}
          planName={purchasedPlan?.name ?? config.name}
          chargeAmount={chargeAmount}
          cancelScheduled={sub!.cancelAtPeriodEnd}
        />
      )}

      {/* ── No active plan → start free trial ── */}
      {isUnpaid ? (
        <StartTrialPlans />
      ) : (
        // ── Active paid plan card ────────────────────────────────────────────────
        <div className="rounded-xl border-2 border-primary/40 bg-card p-6">
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h2 className="text-base font-semibold text-foreground">{config.name} plan</h2>
                <span className="text-[11px] px-2 py-0.5 rounded-full bg-green-500/15 text-green-600 dark:text-green-400 font-semibold">
                  {onTrial ? "Free trial" : "Active"}
                </span>
              </div>
              {config.yearlyPrice && (
                <div className="flex items-baseline gap-1 mt-1 mb-1">
                  <p className="text-2xl font-bold text-foreground">${config.yearlyPrice}</p>
                  <span className="text-sm text-muted-foreground">/ month</span>
                  <span className="ml-2 text-[11px] px-2 py-0.5 rounded-full bg-primary/10 text-primary font-semibold">
                    {dbUser?.subscription ? "Active" : "Yearly"}
                  </span>
                </div>
              )}
              {config.yearlyPrice && (
                <p className="text-xs text-muted-foreground mb-4">
                  Billed ${config.yearlyPrice * 12}/year · Cancel anytime
                </p>
              )}
              <ul className="space-y-1.5">
                {config.features.map((f) => (
                  <li key={f} className="flex items-center gap-2 text-xs text-foreground">
                    <Check className="w-3.5 h-3.5 text-primary shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>
            </div>
            <div className="text-right shrink-0">
              <p className="text-5xl font-bold text-foreground">
                {creditsLimit >= 9999 ? "∞" : creditsRemaining}
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">credits remaining</p>
            </div>
          </div>
        </div>
      )}

      {/* ── Credits used + Top feature ── */}
      {!isUnpaid && (
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
            {!hasUsage ? (
              <div className="flex flex-col items-center justify-center h-24 text-center">
                <p className="text-sm text-muted-foreground">No usage yet this month</p>
                <p className="text-xs text-muted-foreground mt-1">Connect a source and start asking Claude!</p>
              </div>
            ) : (
              <div className="space-y-3">
                {[
                  { name: "AI citation tracking", pct: 44 },
                  { name: "Rank tracker",          pct: 33 },
                  { name: "SEO audit",             pct: 23 },
                ].map((item) => (
                  <div key={item.name}>
                    <div className="flex justify-between mb-1">
                      <p className="text-xs font-medium text-foreground">{item.name}</p>
                      <p className="text-[11px] text-muted-foreground">{item.pct}%</p>
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
      )}

      {/* ── Credits per feature table ── */}
      <div className="rounded-xl border border-border bg-card overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-border">
          <h2 className="text-sm font-semibold text-foreground">Credits per feature</h2>
          <span className="text-xs text-muted-foreground">What each action costs</span>
        </div>
        <table className="w-full">
          <thead>
            <tr className="border-b border-border bg-muted/30">
              <th className="text-left px-5 py-2.5 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Feature</th>
              <th className="text-left px-5 py-2.5 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Data source</th>
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

      {/* ── Recent usage ── */}
      <div className="rounded-xl border border-border bg-card overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-border">
          <h2 className="text-sm font-semibold text-foreground">Recent usage</h2>
          <span className="text-xs text-muted-foreground">Last 7 actions</span>
        </div>
        {!hasUsage ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-3">
              <span className="text-2xl">📊</span>
            </div>
            <p className="text-sm font-medium text-foreground">No activity yet</p>
            <p className="text-xs text-muted-foreground mt-1 max-w-xs">
              Your usage history will appear here once you start using Claude Skills or querying your connected sources.
            </p>
            {!isUnpaid && (
              <Link href="/dashboard/sources" className="mt-4 text-xs text-primary hover:underline font-medium">
                Connect a source →
              </Link>
            )}
          </div>
        ) : (
          <div className="divide-y divide-border">
            {(dbUser?.activityLogs ?? []).map((log, i) => (
              <div key={i} className="flex items-center justify-between px-5 py-3">
                <div>
                  <span className="text-sm font-medium text-foreground">{log.type}</span>
                  <span className="text-sm text-muted-foreground"> — {log.message}</span>
                </div>
                <div className="flex items-center gap-6 shrink-0">
                  <span className="text-xs text-muted-foreground">
                    {log.createdAt.toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── Payment method (only on paid plan) ── */}
      {hasInvoices && (
        <div className="rounded-xl border border-border bg-card p-5 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-7 rounded border border-border bg-muted flex items-center justify-center">
              <CreditCard className="w-4 h-4 text-muted-foreground" />
            </div>
            <div>
              <p className="text-sm font-medium text-foreground">Manage payment method</p>
              <p className="text-xs text-muted-foreground">Update card or billing details via Dodo Payments</p>
            </div>
          </div>
          <a
            href="https://dashboard.dodopayments.com/customer-portal"
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-2 rounded-lg border border-border text-xs font-medium text-foreground hover:bg-accent transition-colors flex items-center gap-1.5"
          >
            Manage <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      )}

      {/* ── Invoice history ── */}
      {hasInvoices && (
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
              {[0, 1, 2].map((i) => {
                const d = new Date(now.getFullYear(), now.getMonth() - i, 17);
                return (
                  <tr key={i} className={i < 2 ? "border-b border-border" : ""}>
                    <td className="px-5 py-3 text-sm text-foreground">
                      {d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                    </td>
                    <td className="px-5 py-3 text-sm text-foreground">${config.yearlyPrice}.00</td>
                    <td className="px-5 py-3">
                      <span className="text-xs font-semibold text-green-600 dark:text-green-400">Paid</span>
                    </td>
                    <td className="px-5 py-3 text-right">
                      <button className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors ml-auto">
                        <Download className="w-3.5 h-3.5" /> PDF
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
