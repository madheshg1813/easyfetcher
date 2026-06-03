// ─── Skill File Generator ─────────────────────────────────────────────────────
// Takes a SkillTemplate and user config, produces a downloadable SKILL.md

import type { SkillTemplate } from "./templates";

interface GeneratorConfig {
  mcpUrl: string;  // e.g. "https://app.easyfetcher.com/api/mcp"
  apiKey: string;  // e.g. "ef_abc123..."
}

/**
 * Generates the full content of a SKILL.md file ready for Claude Desktop.
 *
 * The file includes:
 * 1. YAML frontmatter (name + description for triggering)
 * 2. MCP connection instructions so Claude knows where to send tool calls
 * 3. The skill body with step-by-step workflow instructions
 */
export function generateSkillFile(
  template: SkillTemplate,
  config: GeneratorConfig
): string {
  const lines: string[] = [];

  // ── YAML frontmatter ────────────────────────────────────────────────────
  lines.push("---");
  lines.push(`name: ${template.id}`);
  // Escape any quotes in the description
  lines.push(`description: "${template.description.replace(/"/g, '\\"')}"`);
  lines.push("---");
  lines.push("");

  // ── MCP connection context ──────────────────────────────────────────────
  lines.push("## EasyFetcher MCP Connection");
  lines.push("");
  lines.push("This skill uses the EasyFetcher MCP server to fetch marketing data.");
  lines.push("The MCP server should already be configured in your Claude Desktop settings.");
  lines.push("");
  lines.push("**MCP Server Details:**");
  lines.push(`- **URL:** ${config.mcpUrl}`);
  lines.push(`- **API Key:** ${config.apiKey}`);
  lines.push("");
  lines.push(
    "If the MCP tools are not available, ask the user to configure the EasyFetcher MCP server in their Claude Desktop settings:"
  );
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

  // ── Required connections ────────────────────────────────────────────────
  if (template.requiredConnections.length > 0) {
    lines.push("## Required Connections");
    lines.push("");
    lines.push(
      `This skill requires the following data sources to be connected in your EasyFetcher dashboard: **${template.requiredConnections.join(", ")}**.`
    );
    lines.push("");
    lines.push(
      "If a required connection is missing, guide the user to connect it at https://app.easyfetcher.com/dashboard/sources"
    );
    lines.push("");
  }

  // ── Available tools reference ───────────────────────────────────────────
  lines.push("## Tools Used");
  lines.push("");
  lines.push("This skill uses the following EasyFetcher MCP tools:");
  lines.push("");
  for (const tool of template.requiredTools) {
    lines.push(`- \`${tool}\``);
  }
  lines.push("");

  // ── Skill body ──────────────────────────────────────────────────────────
  lines.push(template.skillBody.trim());
  lines.push("");

  return lines.join("\n");
}

/**
 * Returns just the raw skill content without personalized MCP config.
 * Useful for previewing the skill in the dashboard.
 */
export function generateGenericSkillFile(template: SkillTemplate): string {
  return generateSkillFile(template, {
    mcpUrl: "https://app.easyfetcher.com/api/mcp",
    apiKey: "YOUR_API_KEY",
  });
}
