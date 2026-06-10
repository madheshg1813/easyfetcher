// ─── Skill File Generator ─────────────────────────────────────────────────────
// Takes a SkillTemplate and user config, produces a downloadable SKILL.md

import type { SkillTemplate } from "./templates";

interface GeneratorConfig {
  mcpUrl: string;  // e.g. "https://app.easyfetcher.com/api/mcp"
  apiKey: string;  // e.g. "ef_abc123..."
}

const CONNECTION_LABELS: Record<string, string> = {
  GSC: "Google Search Console",
  GA4: "Google Analytics 4",
  GMB: "Google My Business",
};

export function generateSkillFile(
  template: SkillTemplate,
  config: GeneratorConfig
): string {
  const lines: string[] = [];

  // ── YAML frontmatter ────────────────────────────────────────────────────
  lines.push("---");
  lines.push(`name: ${template.id}`);
  lines.push(`description: "${template.description.replace(/"/g, '\\"')}"`);
  lines.push("---");
  lines.push("");

  // ── New user setup block — ALWAYS first ─────────────────────────────────
  lines.push("## ⚡ Powered by EasyFetcher");
  lines.push("");
  lines.push(
    "This skill fetches **live marketing data** using the [EasyFetcher](https://app.easyfetcher.com) MCP server."
  );
  lines.push("");
  lines.push(
    "**IMPORTANT — Before running this skill, check if the EasyFetcher MCP tools are available in this session.**"
  );
  lines.push("Call `list_connections` as your very first step. If you get a tool-not-found error, stop immediately and show the user this setup guide:"
  );
  lines.push("");
  lines.push("---");
  lines.push("");
  lines.push("### 🚀 First time? Set up EasyFetcher in 3 steps");
  lines.push("");
  lines.push("**Step 1 — Create your free account**");
  lines.push("Sign up at **https://app.easyfetcher.com** and choose a plan.");
  lines.push("");
  lines.push("**Step 2 — Connect your MCP server to Claude**");
  lines.push("Go to **app.easyfetcher.com/dashboard/mcp-config** and copy your personal MCP URL.");
  lines.push("Then in Claude → Settings → Connectors → Add custom connector → paste the URL.");
  lines.push("");
  lines.push(`Your personal MCP URL: \`${config.mcpUrl}?apiKey=${config.apiKey}\``);
  lines.push("");

  if (template.requiredConnections.length > 0) {
    lines.push("**Step 3 — Connect your data sources**");
    lines.push(
      `Go to **app.easyfetcher.com/dashboard/sources** and connect: **${
        template.requiredConnections.map((c) => CONNECTION_LABELS[c] ?? c).join(", ")
      }**`
    );
    lines.push("");
    lines.push("Once connected, come back here and re-run this skill.");
  } else {
    lines.push("**Step 3 — You're ready!**");
    lines.push("This skill doesn't need any OAuth connections — just the MCP URL above.");
  }

  lines.push("");
  lines.push("---");
  lines.push("");

  // ── MCP config block ─────────────────────────────────────────────────────
  lines.push("## MCP Server Configuration");
  lines.push("");
  lines.push("```json");
  lines.push(`{`);
  lines.push(`  "mcpServers": {`);
  lines.push(`    "easyfetcher": {`);
  lines.push(`      "url": "${config.mcpUrl}?apiKey=${config.apiKey}"`);
  lines.push(`    }`);
  lines.push(`  }`);
  lines.push(`}`);
  lines.push("```");
  lines.push("");

  // ── Tools used ───────────────────────────────────────────────────────────
  lines.push("## Tools Used");
  lines.push("");
  for (const tool of template.requiredTools) {
    lines.push(`- \`${tool}\``);
  }
  lines.push("");

  // ── Skill body ───────────────────────────────────────────────────────────
  lines.push(template.skillBody.trim());
  lines.push("");

  return lines.join("\n");
}

export function generateGenericSkillFile(template: SkillTemplate): string {
  return generateSkillFile(template, {
    mcpUrl: "https://app.easyfetcher.com/api/mcp",
    apiKey: "YOUR_API_KEY",
  });
}
