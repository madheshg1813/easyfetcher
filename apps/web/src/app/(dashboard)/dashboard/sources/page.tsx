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
      connections: {
        where: { status: "CONNECTED" },
        select: { id: true, platform: true, status: true, siteUrl: true, accountId: true, label: true, workspaceId: true },
      },
    },
  });

  const plan: Plan = dbUser?.plan ?? "FREE";
  const connections = dbUser?.connections ?? [];
  let apiKey = dbUser?.apiKey;
  if (dbUser && !apiKey) {
    const { randomBytes } = require("crypto");
    apiKey = "ef_" + randomBytes(24).toString("hex");
    await prisma.user.update({
      where: { id: dbUser.id },
      data: { apiKey },
    });
  }
  if (!apiKey) {
    apiKey = "ef_demo_key_77189a80bbf12f45c26b9112";
  }

  return (
    <ConnectorsPage
      plan={plan}
      connections={connections}
      apiKey={apiKey}
      params={params}
    />
  );
}
