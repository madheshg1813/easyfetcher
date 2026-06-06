import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { SourcesGrid } from "@/components/sources/sources-grid";
import { McpUrlStep } from "@/components/sources/mcp-url-step";
import { getConnectionLimit, getWorkspaceLimit } from "@/lib/plan-check";
import type { Plan } from "@easyfetcher/db";
import type { SourceConfig } from "@/components/sources/source-card";

export const metadata = { title: "Data Sources" };

const ALL_SOURCES: SourceConfig[] = [
  {
    id: "GSC",
    name: "Google Search Console",
    description: "Rankings, impressions, CTR and crawl data. Essential for SEO prompts.",
    logo: "/connectors/gsc.svg",
    requiredPlan: "FREE",
  },
  {
    id: "GA4",
    name: "Google Analytics 4",
    description: "Traffic, conversions, events and audience data. Powers analytics prompts.",
    logo: "/connectors/google-analytics.svg",
    requiredPlan: "STARTER",
  },
  {
    id: "SHOPIFY",
    name: "Shopify",
    description: "Revenue, orders, product and customer acquisition data.",
    logo: "/connectors/shopify.svg",
    requiredPlan: "PRO",
  },
  {
    id: "YOUTUBE",
    name: "YouTube Organic",
    description: "Channel views, watch time, subscriber growth and top video performance.",
    logo: "/connectors/youtube.svg",
    requiredPlan: "PRO",
  },
  {
    id: "YOUTUBE_ADS",
    name: "YouTube Ads",
    description: "YouTube ad campaigns, video ad metrics, CPV and ROAS via Google Ads.",
    logo: "/connectors/youtube-ads.svg",
    requiredPlan: "PRO",
  },
];

export default async function SourcesPage({
  searchParams,
}: {
  searchParams: Promise<{ connected?: string; error?: string; requiredPlan?: string; detail?: string }>;
}) {
  const { userId } = await auth();
  if (!userId) redirect("/login");

  const params = await searchParams;

  const dbUser = await prisma.user.findUnique({
    where: { clerkId: userId },
    include: {
      workspaces: {
        orderBy: { sortOrder: "asc" },
        include: {
          connections: {
            select: {
              id: true,
              platform: true,
              status: true,
              siteUrl: true,
              accountId: true,
              label: true,
              updatedAt: true,
              metadata: true,
            },
          },
        },
      },
    },
  });

  const plan: Plan = dbUser?.plan ?? "FREE";
  const allWorkspaces = dbUser?.workspaces ?? [];

  // Find active workspace
  const activeWorkspace =
    allWorkspaces.find((w) => w.id === dbUser?.activeWorkspaceId) ?? allWorkspaces[0];

  const connections = activeWorkspace?.connections ?? [];
  const connectedCount = connections.filter((c) => c.status === "CONNECTED").length;
  const connLimit = getConnectionLimit(plan);
  const wsLimit = getWorkspaceLimit(plan);
  const multiWorkspace = allWorkspaces.length > 1;

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          {multiWorkspace && activeWorkspace && (
            <h2 className="text-lg font-semibold text-foreground mb-0.5">
              {activeWorkspace.name}
            </h2>
          )}
          <p className="text-sm text-muted-foreground">
            {connectedCount} of {connLimit === 999 ? "unlimited" : connLimit} sources used ·{" "}
            <span className="font-medium text-primary">{plan} plan</span>
            {wsLimit > 1 && (
              <span className="ml-2 text-muted-foreground">
                · {allWorkspaces.length} of {wsLimit === 999 ? "unlimited" : wsLimit} workspaces
              </span>
            )}
          </p>
        </div>
      </div>

      {/* Alerts */}
      {params.connected && (
        <>
          <div className="flex items-center gap-3 px-4 py-3 rounded-lg bg-green-500/10 border border-green-500/20 text-green-700 dark:text-green-400 text-sm">
            <span>✓</span>
            <span><strong>{params.connected}</strong> connected successfully!</span>
          </div>
          <McpUrlStep />
        </>
      )}
      {params.error === "plan_limit" && (
        <div className="flex items-center gap-3 px-4 py-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm">
          <span>⚠</span>
          <span>
            You need to upgrade to <strong>{params.requiredPlan}</strong> to connect this source.{" "}
            <a href="/dashboard/plan" className="underline">View plans →</a>
          </span>
        </div>
      )}
      {params.error && params.error !== "plan_limit" && (
        <div className="flex flex-col gap-1 px-4 py-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm">
          <div className="flex items-center gap-3">
            <span>⚠</span>
            <span>Connection failed: {params.error.replace(/_/g, " ")}. Please try again.</span>
          </div>
          {params.detail && (
            <p className="text-xs text-destructive/80 pl-5 font-mono break-all">{params.detail}</p>
          )}
        </div>
      )}

      <SourcesGrid
        sources={ALL_SOURCES}
        userPlan={plan}
        connections={connections}
        workspaceId={activeWorkspace?.id}
      />
    </div>
  );
}
