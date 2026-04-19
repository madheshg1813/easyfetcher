import { z } from "zod";
import { prisma, decrypt } from "@easyfetcher/db";

export function registerMetaTools(server: any) {
  // ─── meta_ads_campaigns ──────────────────────────────────────────────────────
  server.tool(
    "meta_ads_campaigns",
    "Get Facebook/Instagram ad campaigns with performance metrics",
    {
      days: z.number().min(1).max(90).default(28).describe("Days to look back (default 28)"),
      limit: z.number().min(1).max(50).default(20).describe("Number of campaigns to return"),
    },
    async (args: { days: number; limit: number }) => {
      const { days, limit } = args;
      const user = await prisma.user.findFirst({
        where: { apiKey: process.env.EASYFETCHER_API_KEY! },
        include: { connections: { where: { status: "CONNECTED", platform: "META_ADS" } } },
      });
      if (!user) return { content: [{ type: "text" as const, text: "Invalid API key" }] };

      const metaConn = user.connections.find((c: (typeof user.connections)[number]) => c.platform === "META_ADS");
      if (!metaConn) return { content: [{ type: "text" as const, text: "Meta Ads is not connected. Visit your EasyFetcher dashboard to connect it." }] };
      if (!metaConn.siteUrl) return { content: [{ type: "text" as const, text: "Meta Ads connected but no account ID found. Try reconnecting from the dashboard." }] };

      const accessToken = decrypt(metaConn.accessToken);
      // siteUrl is stored as "act_12345" — strip the prefix for API calls
      const accountId = metaConn.siteUrl.replace("act_", "");

      const since = new Date();
      since.setDate(since.getDate() - days);
      const until = new Date();

      const sinceStr = since.toISOString().split("T")[0];
      const untilStr = until.toISOString().split("T")[0];

      const url = `https://graph.facebook.com/v19.0/act_${accountId}/campaigns?fields=name,status,objective,daily_budget,lifetime_budget,created_time,insights.time_range({"since":"${sinceStr}","until":"${untilStr}"}){spend,impressions,clicks,actions,cost_per_action_type}&limit=${limit}&access_token=${accessToken}`;

      try {
        const res = await fetch(url);
        const data = await res.json();

        if (data.error) {
          return { content: [{ type: "text" as const, text: `Meta API error: ${data.error.message}. Visit your EasyFetcher dashboard to reconnect Meta Ads.` }] };
        }

        const campaigns = data.data ?? [];
        if (campaigns.length === 0) {
          return { content: [{ type: "text" as const, text: `No campaigns found in the last ${days} days.` }] };
        }

        const header = `Meta Ads Campaigns (last ${days} days):\n\n`;
        const table = campaigns.map((c: any, i: number) => {
          const insights = c.insights?.data?.[0] || {};
          const spend = parseFloat(insights.spend || "0").toFixed(2);
          const impressions = insights.impressions || "0";
          const clicks = insights.clicks || "0";
          const actions = insights.actions || [];
          const conversions = actions
            .filter((a: any) => a.action_type === "purchase" || a.action_type === "lead")
            .reduce((sum: number, a: any) => sum + parseInt(a.value || "0"), 0);

          return `${i + 1}. ${c.name}\n   Status: ${c.status} | Objective: ${c.objective}\n   Spend: $${spend} | Impressions: ${impressions} | Clicks: ${clicks} | Conversions: ${conversions}`;
        }).join("\n\n");

        return { content: [{ type: "text" as const, text: header + table }] };
      } catch (err) {
        return { content: [{ type: "text" as const, text: `Error fetching Meta campaigns: ${String(err)}` }] };
      }
    }
  );

  // ─── meta_ads_performance ────────────────────────────────────────────────────
  server.tool(
    "meta_ads_performance",
    "Get overall Meta Ads account performance metrics",
    {
      days: z.number().min(1).max(90).default(28).describe("Days to look back (default 28)"),
    },
    async (args: { days: number }) => {
      const { days } = args;
      const user = await prisma.user.findFirst({
        where: { apiKey: process.env.EASYFETCHER_API_KEY! },
        include: { connections: { where: { status: "CONNECTED", platform: "META_ADS" } } },
      });
      if (!user) return { content: [{ type: "text" as const, text: "Invalid API key" }] };

      const metaConn = user.connections.find((c: (typeof user.connections)[number]) => c.platform === "META_ADS");
      if (!metaConn?.siteUrl) return { content: [{ type: "text" as const, text: "Meta Ads is not connected. Visit your EasyFetcher dashboard to connect it." }] };

      const accessToken = decrypt(metaConn.accessToken);
      const accountId = metaConn.siteUrl.replace("act_", "");

      const since = new Date();
      since.setDate(since.getDate() - days);
      const until = new Date();

      const sinceStr = since.toISOString().split("T")[0];
      const untilStr = until.toISOString().split("T")[0];

      const url = `https://graph.facebook.com/v19.0/act_${accountId}/insights?time_range={"since":"${sinceStr}","until":"${untilStr}"}&fields=spend,impressions,clicks,actions,ctr,cpc,cpm,reach,frequency&access_token=${accessToken}`;

      try {
        const res = await fetch(url);
        const data = await res.json();

        if (data.error) {
          return { content: [{ type: "text" as const, text: `Meta API error: ${data.error.message}. Visit your EasyFetcher dashboard to reconnect Meta Ads.` }] };
        }

        const insights = data.data?.[0] || {};
        const spend = parseFloat(insights.spend || "0").toFixed(2);
        const impressions = insights.impressions || "0";
        const clicks = insights.clicks || "0";
        const ctr = parseFloat(insights.ctr || "0").toFixed(2) + "%";
        const cpc = "$" + parseFloat(insights.cpc || "0").toFixed(2);
        const cpm = "$" + parseFloat(insights.cpm || "0").toFixed(2);
        const reach = insights.reach || "0";
        const frequency = parseFloat(insights.frequency || "0").toFixed(2);

        const actions = insights.actions || [];
        const conversions = actions
          .filter((a: any) => a.action_type === "purchase" || a.action_type === "lead")
          .reduce((sum: number, a: any) => sum + parseInt(a.value || "0"), 0);

        const result =
          `Meta Ads Performance (last ${days} days):\n\n` +
          `Total Spend: $${spend}\n` +
          `Impressions: ${impressions}\n` +
          `Clicks: ${clicks}\n` +
          `CTR: ${ctr}\n` +
          `CPC: ${cpc}\n` +
          `CPM: ${cpm}\n` +
          `Reach: ${reach}\n` +
          `Frequency: ${frequency}\n` +
          `Conversions: ${conversions}`;

        return { content: [{ type: "text" as const, text: result }] };
      } catch (err) {
        return { content: [{ type: "text" as const, text: `Error fetching Meta performance: ${String(err)}` }] };
      }
    }
  );

  // ─── instagram_insights ──────────────────────────────────────────────────────
  server.tool(
    "instagram_insights",
    "Get Instagram business account insights and content performance",
    {
      days: z.number().min(1).max(90).default(28).describe("Days to look back (default 28)"),
      metric: z
        .enum(["impressions", "reach", "profile_views", "website_clicks"])
        .default("impressions")
        .describe("Metric to analyze"),
    },
    async (args: { days: number; metric: string }) => {
      const { days, metric } = args;
      const user = await prisma.user.findFirst({
        where: { apiKey: process.env.EASYFETCHER_API_KEY! },
        include: { connections: { where: { status: "CONNECTED", platform: "INSTAGRAM" } } },
      });
      if (!user) return { content: [{ type: "text" as const, text: "Invalid API key" }] };

      const igConn = user.connections.find((c: (typeof user.connections)[number]) => c.platform === "INSTAGRAM");
      if (!igConn?.siteUrl) return { content: [{ type: "text" as const, text: "Instagram is not connected. Visit your EasyFetcher dashboard to connect it." }] };

      const accessToken = decrypt(igConn.accessToken);
      // siteUrl is the Instagram business account ID
      const accountId = igConn.siteUrl;

      const since = new Date();
      since.setDate(since.getDate() - days);
      const until = new Date();

      // Instagram Insights uses day or week period
      const period = days <= 7 ? "day" : "week";
      const sinceUnix = Math.floor(since.getTime() / 1000);
      const untilUnix = Math.floor(until.getTime() / 1000);

      const url = `https://graph.facebook.com/v19.0/${accountId}/insights?metric=${metric}&period=${period}&since=${sinceUnix}&until=${untilUnix}&access_token=${accessToken}`;

      try {
        const res = await fetch(url);
        const data = await res.json();

        if (data.error) {
          return { content: [{ type: "text" as const, text: `Instagram API error: ${data.error.message}. Visit your EasyFetcher dashboard to reconnect Instagram.` }] };
        }

        const values = data.data?.[0]?.values || [];
        if (values.length === 0) {
          return { content: [{ type: "text" as const, text: `No ${metric} data found for the last ${days} days.` }] };
        }

        const total = values.reduce((sum: number, val: any) => sum + parseInt(val.value || "0"), 0);
        const avg = Math.round(total / values.length);

        const result =
          `Instagram ${metric.replace(/_/g, " ").toUpperCase()} (last ${days} days):\n\n` +
          `Total: ${total.toLocaleString()}\n` +
          `Average per ${period}: ${avg.toLocaleString()}\n` +
          `Data points: ${values.length}`;

        return { content: [{ type: "text" as const, text: result }] };
      } catch (err) {
        return { content: [{ type: "text" as const, text: `Error fetching Instagram insights: ${String(err)}` }] };
      }
    }
  );

  // ─── facebook_page_insights ──────────────────────────────────────────────────
  server.tool(
    "facebook_page_insights",
    "Get Facebook Page organic insights — reach, impressions, engagement, and fan growth",
    {
      days: z.number().min(1).max(90).default(28).describe("Days to look back (default 28)"),
      metric: z
        .enum([
          "page_impressions",
          "page_reach",
          "page_engaged_users",
          "page_post_engagements",
          "page_fan_adds",
          "page_views_total",
        ])
        .default("page_impressions")
        .describe("Page metric to fetch"),
    },
    async (args: { days: number; metric: string }) => {
      const { days, metric } = args;

      // Page ID is stored in the INSTAGRAM connection metadata
      const user = await prisma.user.findFirst({
        where: { apiKey: process.env.EASYFETCHER_API_KEY! },
        include: { connections: { where: { status: "CONNECTED" } } },
      });
      if (!user) return { content: [{ type: "text" as const, text: "Invalid API key" }] };

      // Try INSTAGRAM connection first (has pageId in metadata), fall back to META_ADS
      type Conn = (typeof user.connections)[number];
      const igConn = user.connections.find((c: Conn) => c.platform === "INSTAGRAM");
      const metaConn = user.connections.find((c: Conn) => c.platform === "META_ADS");

      if (!igConn && !metaConn) {
        return { content: [{ type: "text" as const, text: "Neither Instagram nor Meta Ads is connected. Visit your EasyFetcher dashboard to connect a Meta account." }] };
      }

      const conn = igConn ?? metaConn!;
      const accessToken = decrypt(conn.accessToken);
      const metadata = conn.metadata as Record<string, any> | null;
      const pageId = metadata?.pageId as string | undefined;

      if (!pageId) {
        return { content: [{ type: "text" as const, text: "No Facebook Page linked to this connection. Reconnect your Instagram account from the dashboard to enable Page Insights." }] };
      }

      // Fetch a fresh page access token using the stored user token
      let pageToken = accessToken;
      try {
        const pageRes = await fetch(`https://graph.facebook.com/v19.0/${pageId}?fields=access_token&access_token=${accessToken}`);
        const pageData = await pageRes.json();
        if (pageData.access_token) pageToken = pageData.access_token;
      } catch {
        // Fall through using user token — some permissions work without page token
      }

      const since = new Date();
      since.setDate(since.getDate() - days);
      const until = new Date();

      const sinceStr = since.toISOString().split("T")[0];
      const untilStr = until.toISOString().split("T")[0];

      const url = `https://graph.facebook.com/v19.0/${pageId}/insights/${metric}/day?since=${sinceStr}&until=${untilStr}&access_token=${pageToken}`;

      try {
        const res = await fetch(url);
        const data = await res.json();

        if (data.error) {
          return { content: [{ type: "text" as const, text: `Facebook Page Insights error: ${data.error.message}. Visit your EasyFetcher dashboard to reconnect.` }] };
        }

        const values: Array<{ end_time: string; value: number }> = data.data || [];
        if (values.length === 0) {
          return { content: [{ type: "text" as const, text: `No ${metric} data found for the last ${days} days.` }] };
        }

        const total = values.reduce((sum, v) => sum + (v.value || 0), 0);
        const avg = Math.round(total / values.length);
        const peak = values.reduce((max, v) => (v.value > max.value ? v : max), values[0]);

        const result =
          `Facebook Page ${metric.replace(/_/g, " ").replace("page ", "").toUpperCase()} (last ${days} days):\n\n` +
          `Total: ${total.toLocaleString()}\n` +
          `Daily average: ${avg.toLocaleString()}\n` +
          `Peak day: ${peak.end_time.split("T")[0]} (${peak.value.toLocaleString()})`;

        return { content: [{ type: "text" as const, text: result }] };
      } catch (err) {
        return { content: [{ type: "text" as const, text: `Error fetching Facebook Page insights: ${String(err)}` }] };
      }
    }
  );
}
