import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Database, ExternalLink, Activity } from "lucide-react";
import { prisma } from "@/lib/db";
import { ApiKeyCard } from "@/components/dashboard/api-key-card";
import type { Plan } from "@easyfetcher/db";

function PlanBadge({ plan }: { plan: Plan }) {
  const styles: Record<Plan, string> = {
    FREE: "bg-primary/15 text-primary",
    STARTER: "bg-blue-500/20 text-blue-600 dark:text-blue-400",
    PRO: "bg-amber-500/20 text-amber-600 dark:text-amber-400",
    AGENCY: "bg-purple-500/20 text-purple-600 dark:text-purple-400",
    ENTERPRISE: "bg-blue-500/20 text-blue-600 dark:text-blue-400",
  };
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-sm font-semibold ${styles[plan]}`}>
      {plan}
    </span>
  );
}

function maskKey(key: string): string {
  return key.slice(0, 8) + "••••••••••••••••••••••";
}

const activityIcons: Record<string, string> = {
  CONNECTED: "🔗",
  DISCONNECTED: "🔌",
  PROMPT_RUN: "▶",
  TOKEN_REFRESH: "🔄",
  KEY_ROTATED: "🔑",
};

function relativeTime(date: Date): string {
  const diff = Date.now() - new Date(date).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

export default async function DashboardPage() {
  const { userId } = await auth();
  if (!userId) redirect("/login");

  const dbUser = await prisma.user.findUnique({
    where: { clerkId: userId },
    include: {
      connections: {
        where: { status: "CONNECTED" },
        select: { id: true, platform: true, status: true, siteUrl: true, accountId: true },
      },
      _count: { select: { promptRuns: true } },
      activityLogs: {
        orderBy: { createdAt: "desc" },
        take: 5,
      },
    },
  });

  const plan: Plan = dbUser?.plan ?? "FREE";
  const planLimits: Record<Plan, number> = { FREE: 50, STARTER: 1000, PRO: 500, AGENCY: 5000, ENTERPRISE: 50000 };
  const connectedSources = dbUser?.connections ?? [];
  const activityLogs = dbUser?.activityLogs ?? [];

  const mcpConfig = JSON.stringify(
    {
      mcpServers: {
        easyfetcher: {
          command: "npx",
          args: ["easyfetcher-mcp"],
          env: { EASYFETCHER_API_KEY: dbUser?.apiKey ?? "your-api-key-here" },
        },
      },
    },
    null,
    2
  );

  return (
    <div className="space-y-6 max-w-6xl">
      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-lg border border-border bg-card p-5">
          <p className="text-xs text-muted-foreground font-medium">API calls this month</p>
          <p className="mt-1.5 text-2xl font-bold text-foreground">
            0 / {planLimits[plan].toLocaleString()}
          </p>
        </div>
        <div className="rounded-lg border border-border bg-card p-5">
          <p className="text-xs text-muted-foreground font-medium">Connected sources</p>
          <p className="mt-1.5 text-2xl font-bold text-foreground">{connectedSources.length}</p>
        </div>
        <div className="rounded-lg border border-border bg-card p-5">
          <p className="text-xs text-muted-foreground font-medium">Prompt runs today</p>
          <p className="mt-1.5 text-2xl font-bold text-foreground">0</p>
        </div>
        <div className="rounded-lg border border-border bg-card p-5">
          <p className="text-xs text-muted-foreground font-medium">Plan</p>
          <div className="mt-1.5">
            <PlanBadge plan={plan} />
          </div>
        </div>
      </div>

      {/* Two-column section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Connected Sources */}
        <div className="rounded-lg border border-border bg-card p-6">
          <h2 className="text-sm font-semibold text-foreground mb-4">Connected Sources</h2>
          {connectedSources.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center mb-3">
                <Database className="w-5 h-5 text-muted-foreground" />
              </div>
              <p className="text-sm text-muted-foreground mb-4">
                Connect your first data source to start running prompts
              </p>
              <Link
                href="/dashboard/sources"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-md bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors"
              >
                Connect a source
                <ExternalLink className="w-3.5 h-3.5" />
              </Link>
            </div>
          ) : (
            <ul className="space-y-2">
              {connectedSources.map((conn) => (
                <li key={conn.id} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                  <div>
                    <p className="text-sm font-medium text-foreground">{conn.platform}</p>
                    {conn.siteUrl && (
                      <p className="text-xs text-muted-foreground truncate max-w-[180px]">{conn.siteUrl}</p>
                    )}
                    {conn.accountId && (
                      <p className="text-xs text-muted-foreground">Account {conn.accountId}</p>
                    )}
                  </div>
                  <span className="text-xs px-2 py-0.5 rounded-full font-medium bg-green-500/15 text-green-600 dark:text-green-400">
                    {conn.status}
                  </span>
                </li>
              ))}
              <li className="pt-1">
                <Link href="/dashboard/sources" className="text-xs text-primary hover:underline">
                  Manage sources →
                </Link>
              </li>
            </ul>
          )}
        </div>

        {/* MCP Config + API Key */}
        <ApiKeyCard
          maskedKey={dbUser?.apiKey ? maskKey(dbUser.apiKey) : "No key yet"}
          mcpConfig={mcpConfig}
        />
      </div>

      {/* Activity Feed */}
      <div className="rounded-lg border border-border bg-card p-6">
        <div className="flex items-center gap-2 mb-4">
          <Activity className="w-4 h-4 text-muted-foreground" />
          <h2 className="text-sm font-semibold text-foreground">Recent Activity</h2>
        </div>
        {activityLogs.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-6">
            No activity yet. Connect a data source to get started.
          </p>
        ) : (
          <ul className="space-y-3">
            {activityLogs.map((log) => (
              <li key={log.id} className="flex items-start gap-3">
                <span className="text-base leading-none mt-0.5">
                  {activityIcons[log.type] ?? "•"}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-foreground">{log.message}</p>
                </div>
                <span className="text-xs text-muted-foreground shrink-0 mt-0.5">
                  {relativeTime(log.createdAt)}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
