import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { McpConfigClient } from "@/components/mcp-config/mcp-config-client";

export const metadata = { title: "MCP Integration" };

export default async function McpConfigPage() {
  const { userId } = await auth();
  if (!userId) redirect("/login");

  const dbUser = await prisma.user.findUnique({ where: { clerkId: userId } });
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
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-xl font-semibold text-foreground">Claude &amp; IDE Integration</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Connect EasyFetcher directly to your AI client as a custom integration.
        </p>
      </div>
      <McpConfigClient apiKey={apiKey} />
    </div>
  );
}
