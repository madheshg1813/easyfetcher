import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { McpConfigClient } from "@/components/mcp-config/mcp-config-client";

export const metadata = { title: "MCP Config" };

export default async function McpConfigPage() {
  const { userId } = await auth();
  if (!userId) redirect("/login");

  const dbUser = await prisma.user.findUnique({ where: { clerkId: userId } });
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
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-xl font-semibold text-foreground">MCP Config</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Add this config to Claude Desktop to connect EasyFetcher as an MCP server.
        </p>
      </div>
      <McpConfigClient mcpConfig={mcpConfig} maskedKey={apiKey.slice(0, 10) + "···········" + apiKey.slice(-2)} />
    </div>
  );
}
