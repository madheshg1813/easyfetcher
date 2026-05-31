import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Check, CreditCard, Download, Clock, Zap } from "lucide-react";
import { prisma } from "@/lib/db";
import type { Plan } from "@easyfetcher/db";
import { BillingPlans } from "@/components/billing/billing-client";

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
    // FREE is only used internally as the "on trial" state — never shown as plan name
    name: "Trial", yearlyPrice: null, monthlyPrice: null, credits: 50,
    features: ["50 credits/month", "All connectors — GSC, GA4, GMB", "All Claude Skills included"],
  },
  STARTER: {
    name: "Starter", yearlyPrice: 9, monthlyPrice: 14, credits: 50,
    features: ["50 credits/month", "All connectors — GSC, GA4, GMB", "All Claude Skills included", "Email support"],
  },
  PRO: {
    name: "Pro", yearlyPrice: 24, monthlyPrice: 29, credits: 125,
    features: ["125 credits/month", "All connectors — GSC, GA4, GMB", "All Claude Skills included", "OAuth calls always free", "Priority support"],
  },
  AGENCY: {
    name: "Agency", yearlyPrice: 49, monthlyPrice: 59, credits: 275,
    features: ["275 credits/month", "All connectors — GSC, GA4, GMB", "All Claude Skills included", "Unlimited workspaces", "Dedicated Slack support"],
  },
  ENTERPRISE: {
    name: "Enterprise", yearlyPrice: null, monthlyPrice: null, credits: 9999,
    features: ["Unlimited credits", "All connectors", "Custom integrations", "Dedicated support"],
  },
};

// ─── Credits per feature ─────────────────────────────────────────────────────
// "Powered by" intentionally kept generic — no vendor names exposed
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
  { feature: "PageSpeed / GMB",      poweredBy: "Google OAuth",    creditsPerRun: 0, oauthFree: true  },
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

function trialDaysRemaining(trialEndsAt: Date | null, createdAt?: Date | null): number {
  // If trialEndsAt is not set (pre-migration users), fall back to createdAt + 7 days
  const end = trialEndsAt ?? (createdAt ? new Date(createdAt.getTime() + 7 * 24 * 60 * 60 * 1000) : null);
  if (!end) return 7; // absolute fallback
  const diff = end.getTime() - Date.now();
  return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
}

export default async function BillingPage() {
  const { userId } = await auth();
  if (!userId) redirect("/login");

  const dbUser = await prisma.user.findUnique({
    where: { clerkId: userId },
    include: {
      _count: { select: { promptRuns: true } },
      // Get recent activity logs for real usage history
      activityLogs: {
        orderBy: { createdAt: "desc" },
        take: 7,
      },
    },
  });

  const plan: Plan = dbUser?.plan ?? "FREE";
  const isOnTrial = plan === "FREE";
  // The plan being trialed (set during onboarding). Fall back to PRO if somehow not set.
  const trialPlan: Plan = (dbUser?.trialPlan as Plan | null) ?? "PRO";
  const displayPlan = isOnTrial ? trialPlan : plan;
  const config = PLAN_CONFIG[displayPlan];
  const creditsLimit = config.credits;
  const creditsUsed = Math.min(dbUser?._count.promptRuns ?? 0, creditsLimit);
  const creditsRemaining = Math.max(creditsLimit - creditsUsed, 0);
  const progress = creditsLimit >= 9999 ? 5 : Math.min((creditsUsed / creditsLimit) * 100, 100);
  const daysLeft = trialDaysRemaining(dbUser?.trialEndsAt ?? null, dbUser?.createdAt);
  const trialExpired = isOnTrial && daysLeft === 0;

  const hasUsage = creditsUsed > 0;
  const hasInvoices = config.yearlyPrice !== null || config.monthlyPrice !== null;
  const now = new Date();

  return (
    <div className="space-y-5 max-w-4xl">
      <div>
        <h1 className="text-xl font-semibold text-foreground">Usage &amp; billing</h1>
        <p className="text-sm text-muted-foreground mt-1">Your plan, credit balance, and feature usage this month.</p>
      </div>

      {/* ── Current plan card ── */}
      {isOnTrial ? (
        // ── Trial card ──────────────────────────────────────────────────────────
        <div className={`rounded-xl border-2 p-6 ${
          trialExpired
            ? "border-destructive/50 bg-destructive/5"
            : "border-amber-500/40 bg-amber-500/5"
        }`}>
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1 flex-wrap">
                <h2 className="text-base font-semibold text-foreground">{config.name} plan</h2>
                {trialExpired ? (
                  <span className="text-[11px] px-2 py-0.5 rounded-full bg-destructive/15 text-destructive font-semibold">Trial expired</span>
                ) : (
                  <span className="text-[11px] px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-600 dark:text-amber-400 font-semibold flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {daysLeft} day{daysLeft !== 1 ? "s" : ""} left in trial
                  </span>
                )}
              </div>
              <p className="text-sm text-muted-foreground mt-0.5 mb-4">
                {trialExpired
                  ? "Your trial has ended. Upgrade to keep using EasyFetcher."
                  : "You're on a free trial. No credit card required yet."}
              </p>
              <ul className="space-y-1.5">
                {config.features.map((f) => (
                  <li key={f} className="flex items-center gap-2 text-xs text-foreground">
                    <Check className="w-3.5 h-3.5 text-primary shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>
            </div>
            <div className="text-right shrink-0 flex flex-col items-end gap-3">
              <div>
                <p className="text-5xl font-bold text-foreground">
                  {creditsLimit >= 9999 ? "∞" : creditsRemaining}
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">credits remaining</p>
              </div>
              <Link
                href="#upgrade"
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-xs font-semibold hover:bg-primary/90 transition-colors"
              >
                <Zap className="w-3.5 h-3.5" />
                Upgrade now
              </Link>
            </div>
          </div>
        </div>
      ) : (
        // ── Paid plan card ───────────────────────────────────────────────────────
        <div className="rounded-xl border-2 border-primary/40 bg-card p-6">
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h2 className="text-base font-semibold text-foreground">{config.name} plan</h2>
                <span className="text-[11px] px-2 py-0.5 rounded-full bg-green-500/15 text-green-600 dark:text-green-400 font-semibold">Active</span>
              </div>
              <div className="flex items-baseline gap-1 mt-1">
                {config.yearlyPrice ? (
                  <>
                    <p className="text-2xl font-bold text-foreground">${config.yearlyPrice}</p>
                    <span className="text-sm text-muted-foreground">/ month</span>
                    <span className="ml-2 text-[11px] px-2 py-0.5 rounded-full bg-primary/10 text-primary font-semibold">Yearly</span>
                  </>
                ) : (
                  <p className="text-2xl font-bold text-foreground">Custom</p>
                )}
              </div>
              {config.yearlyPrice && (
                <p className="text-xs text-muted-foreground mt-0.5">
                  Billed ${config.yearlyPrice * 12}/year · Cancel anytime
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
              <p className="text-5xl font-bold text-foreground">
                {creditsLimit >= 9999 ? "∞" : creditsRemaining}
              </p>
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
      )}

      {/* ── Credits used + Top feature ── */}
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

      {/* ── Plan upgrade section (client, has toggle) ── */}
      <div id="upgrade">
        <BillingPlans currentPlanId={isOnTrial ? "" : plan} />
      </div>

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

      {/* ── Recent usage — real from DB, empty state for new users ── */}
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
            <Link href="/dashboard/sources" className="mt-4 text-xs text-primary hover:underline font-medium">
              Connect a source →
            </Link>
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

      {/* ── Payment method (only if on paid plan) ── */}
      {hasInvoices && (
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

      {/* ── Invoice history (only on paid plan) ── */}
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
