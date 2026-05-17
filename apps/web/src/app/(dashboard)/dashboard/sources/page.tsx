import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { ConnectorsPage } from "@/components/connectors/connectors-page";
import type { Plan } from "@easyfetcher/db";

export const metadata = { title: "Connectors" };

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
            where: { status: "CONNECTED" },
            select: { id: true, platform: true, status: true, siteUrl: true, accountId: true, label: true },
          },
        },
      },
    },
  });

  const plan: Plan = dbUser?.plan ?? "FREE";
  const activeWorkspace =
    (dbUser?.workspaces ?? []).find((w) => w.id === dbUser?.activeWorkspaceId) ??
    (dbUser?.workspaces ?? [])[0];

  const connections = activeWorkspace?.connections ?? [];
  const apiKey = dbUser?.apiKey ?? "your-api-key-here";

  const mcpConfig = JSON.stringify(
    {
      mcpServers: {
        easyfetcher: {
          command: "npx",
          args: ["-y", "@easyfetcher/mcp"],
          env: { EASYFETCHER_TOKEN: apiKey },
        },
      },
    },
    null,
    2
  );

  return (
    <ConnectorsPage
      plan={plan}
      connections={connections}
      workspaceId={activeWorkspace?.id}
      mcpConfig={mcpConfig}
      apiKey={apiKey}
      params={params}
    />
  );
}
