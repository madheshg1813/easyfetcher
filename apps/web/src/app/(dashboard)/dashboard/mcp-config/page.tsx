import { McpConfigClient } from "@/components/mcp-config/mcp-config-client";

export const metadata = { title: "MCP URL" };

export default function McpConfigPage() {
  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-xl font-semibold text-foreground">Claude &amp; IDE Integration</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Connect EasyFetcher directly to your AI client as a custom integration. No API key needed — you&apos;ll log in when connecting.
        </p>
      </div>
      <McpConfigClient />
    </div>
  );
}
