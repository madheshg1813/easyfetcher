// ─── EasyFetcher Skill Templates ──────────────────────────────────────────────
// Each template produces a downloadable SKILL.md file that instructs Claude
// how to use EasyFetcher's MCP tools for a specific workflow.

import type { Plan } from "@easyfetcher/db";

export type SkillCategory =
  | "SEO"
  | "Analytics"
  | "Local Business"
  | "Competitor Analysis"
  | "Content"
  | "Technical SEO";

export interface SkillTemplate {
  id: string;
  name: string;
  description: string; // Also used as the SKILL.md trigger description
  category: SkillCategory;
  requiredTools: string[];
  requiredConnections: string[]; // "GSC" | "GA4" | "GMB" | "none"
  credits: number | null; // null = free (uses connected source directly)
  plan: Plan;
  examplePrompts: string[]; // Real-world prompts a user might type
  skillBody: string; // The main body of the SKILL.md (below the frontmatter)
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const indent = (s: string) =>
  s
    .split("\n")
    .map((l) => l.trimStart())
    .join("\n");

// ─── Templates ────────────────────────────────────────────────────────────────

export const SKILL_TEMPLATES: SkillTemplate[] = [
  // ═══════════════════════════════════════════════════════════════════════════
  // SEO
  // ═══════════════════════════════════════════════════════════════════════════
  {
    id: "weekly-seo-health-check",
    name: "Weekly SEO Health Check",
    description:
      "Run a comprehensive weekly SEO health check across Google Search Console and GA4 data. Use this skill whenever the user asks for an SEO report, weekly check-in, search performance summary, or wants to know how their site is doing in Google. Also trigger for 'SEO health', 'search performance', 'weekly report', or 'how is my site doing'.",
    category: "SEO",
    requiredTools: ["gsc_query", "ga4_query", "list_connections"],
    requiredConnections: ["GSC"],
    credits: null,
    plan: "STARTER",
    examplePrompts: [
      "Run my weekly SEO health check",
      "How is my site doing in Google this week?",
      "Give me an SEO performance summary",
    ],
    skillBody: indent(`
# Weekly SEO Health Check

You are an SEO analyst reviewing the user's search performance data from EasyFetcher.

## What this skill does
Generates a comprehensive weekly SEO health report by pulling data from Google Search Console and optionally GA4. It highlights wins, drops, and gives actionable recommendations.

## Steps

1. **Discover data sources** — call \`list_connections\` to see which workspaces and platforms are connected.
2. **Pull this week's GSC queries** — call \`gsc_query\` with metric="top_queries", days=7, limit=25.
3. **Pull this week's GSC pages** — call \`gsc_query\` with metric="top_pages", days=7, limit=15.
4. **Pull last week for comparison** — call \`gsc_query\` with metric="top_queries", days=14, limit=25. Subtract this week's data mentally to derive the previous 7-day period.
5. **If GA4 is connected**, pull traffic overview: \`ga4_query\` with metric="traffic", days=7.
6. **If GA4 is connected**, pull traffic sources: \`ga4_query\` with metric="traffic_sources", days=7.

## Report format

Present results as a clean, structured markdown report:

### 📊 Weekly SEO Report — [Site Name]
**Period:** [start date] → [end date]

#### 🔍 Search Performance Summary
| Metric | This Week | Change |
|--------|-----------|--------|
| Total Clicks | X | ↑/↓ Y% |
| Total Impressions | X | ↑/↓ Y% |
| Average CTR | X% | ↑/↓ |
| Average Position | X | ↑/↓ |

#### 📈 Top 5 Growing Keywords
Show keywords with biggest click increases — include clicks, impressions, position.

#### 📉 Top 5 Declining Keywords
Show keywords with biggest click drops.

#### 🏆 Top Pages by Clicks
Top 10 pages with clicks, impressions, CTR, and average position.

#### 🌐 Traffic Overview (if GA4 connected)
Sessions, users, bounce rate, engagement rate, and top traffic sources.

#### 💡 Recommendations
Based on the data, provide 3-5 specific, actionable recommendations. Focus on:
- Keywords close to page 1 (positions 11-20) that could be pushed up
- Pages with high impressions but low CTR (title/meta description optimization opportunities)
- Any significant drops that need investigation
`),
  },

  {
    id: "keyword-opportunity-finder",
    name: "Keyword Opportunity Finder",
    description:
      "Find untapped keyword opportunities by analyzing GSC data for low-hanging fruit. Use this skill when the user asks about keyword opportunities, quick wins, easy ranking keywords, or wants to find keywords they're close to ranking for. Also trigger for 'low-hanging fruit', 'quick SEO wins', or 'keywords I can rank for'.",
    category: "SEO",
    requiredTools: ["gsc_query", "keyword_volume"],
    requiredConnections: ["GSC"],
    credits: 2,
    plan: "STARTER",
    examplePrompts: [
      "Find keyword opportunities for my site",
      "What are my quick SEO wins?",
      "Show me low-hanging fruit keywords",
    ],
    skillBody: indent(`
# Keyword Opportunity Finder

You are an SEO strategist looking for untapped keyword opportunities in the user's GSC data.

## What this skill does
Identifies keywords where the site has impressions but isn't yet ranking well — the "striking distance" keywords that could drive significantly more traffic with small improvements.

## Steps

1. **List connections** — call \`list_connections\`.
2. **Pull all queries** — call \`gsc_query\` with metric="top_queries", days=28, limit=50 (get a large dataset).
3. **Identify striking distance keywords** — from the results, find keywords with:
   - Position between 8-20 (page 1-2 of Google)
   - Impressions > 50 (proving there's search demand)
   - CTR below average (meaning there's room to improve)
4. **Get volume data** — take the top 5 most promising keywords and call \`keyword_volume\` to get their search volumes and difficulty scores.
5. **Identify high-impression low-CTR keywords** — find keywords with high impressions but CTR below 3% (suggesting the title/description needs work).

## Report format

### 🎯 Keyword Opportunity Report — [Site Name]

#### 🔥 Striking Distance Keywords (positions 8-20)
These keywords are close to page 1. Small improvements could drive big traffic gains.

| Keyword | Position | Clicks | Impressions | CTR | Volume | Difficulty |
|---------|----------|--------|-------------|-----|--------|------------|

#### 📝 CTR Optimization Opportunities
These keywords get lots of impressions but few clicks — improve your title tags and meta descriptions.

| Keyword | Position | Impressions | CTR | Est. Clicks if CTR=5% |
|---------|----------|-------------|-----|-----------------------|

#### 🗺️ Action Plan
For each top opportunity, provide a specific recommendation (what to optimize and why it matters).
`),
  },

  {
    id: "index-coverage-monitor",
    name: "Index Coverage Monitor",
    description:
      "Check which of your important pages are indexed by Google and identify indexing issues. Use this skill when the user asks about indexing status, why pages aren't in Google, crawl issues, or wants a batch URL inspection. Also trigger for 'is my page indexed', 'indexing problems', or 'coverage issues'.",
    category: "SEO",
    requiredTools: ["gsc_url_inspect"],
    requiredConnections: ["GSC"],
    credits: null,
    plan: "STARTER",
    examplePrompts: [
      "Check if my key pages are indexed",
      "Why isn't my new blog post showing in Google?",
      "Run an indexing audit on my top pages",
    ],
    skillBody: indent(`
# Index Coverage Monitor

You are a technical SEO specialist checking the indexing status of the user's important pages.

## What this skill does
Inspects specific URLs using Google's URL Inspection API to determine their indexing status, crawl details, canonical handling, and any issues preventing them from appearing in Google.

## Steps

1. **Ask the user** which URLs they want to check. If they don't specify, suggest checking their homepage and top landing pages.
2. **For each URL**, call \`gsc_url_inspect\` with the full URL.
3. **Compile results** into a clear summary.

## Report format

### 🔍 Index Coverage Report

For each URL inspected:

| URL | Index Status | Last Crawled | Canonical Match | Mobile OK | Rich Results |
|-----|-------------|--------------|-----------------|-----------|-------------|

#### ❌ Issues Found
For any page that's NOT indexed or has issues, explain:
- What the problem is (in plain English)
- What's causing it
- How to fix it (specific, actionable steps)

#### ✅ Healthy Pages
List pages that are indexed and have no issues.

#### 💡 Recommendations
General indexing best practices based on the findings.
`),
  },

  {
    id: "search-trend-analyzer",
    name: "Search Trend Analyzer",
    description:
      "Analyze Google Trends data for keywords in your niche to spot seasonal patterns and rising topics. Use this skill when the user asks about trending topics, seasonal keywords, market trends, or wants to understand search demand changes. Also trigger for 'what's trending', 'seasonal trends', 'keyword trends', or 'is this topic growing'.",
    category: "SEO",
    requiredTools: ["trends_query", "keyword_volume"],
    requiredConnections: [],
    credits: 2,
    plan: "STARTER",
    examplePrompts: [
      "What's trending in my niche right now?",
      "Analyze trends for 'AI marketing tools'",
      "Show me seasonal patterns for my top keywords",
    ],
    skillBody: indent(`
# Search Trend Analyzer

You are a market researcher analyzing search trends to help the user spot opportunities and plan content timing.

## What this skill does
Pulls Google Trends data for specified keywords, identifies seasonal patterns, finds related rising queries, and cross-references with search volume data.

## Steps

1. **Get keywords** — ask the user for 1-3 keywords or topics they want to analyze. If they've already provided them, proceed.
2. **Interest over time** — for each keyword, call \`trends_query\` with metric="interest_over_time", days=90.
3. **Related queries** — call \`trends_query\` with metric="related_queries" for the primary keyword.
4. **Related topics** — call \`trends_query\` with metric="related_topics" for the primary keyword.
5. **Volume data** — take the top 5 most interesting rising queries and call \`keyword_volume\` to get their search volumes.

## Report format

### 📊 Trend Analysis: "[keyword]"

#### Interest Over Time (90 days)
Summarize the trend — is it growing, declining, stable, or seasonal? Reference specific peaks/valleys.

#### 🚀 Rising Related Queries
Queries growing rapidly — these represent emerging opportunities.

| Query | Growth | Search Volume | Difficulty |
|-------|--------|--------------|------------|

#### 🔝 Top Related Queries
The most popular related searches.

#### 💡 Content Opportunities
Based on the trends, suggest 3-5 content topics the user should create or optimize for.

#### 📅 Timing Recommendations
If seasonal patterns exist, recommend when to publish/update content.
`),
  },

  {
    id: "content-performance-audit",
    name: "Content Performance Audit",
    description:
      "Cross-reference GSC search data with GA4 analytics to evaluate how well your content converts traffic. Use this skill when the user asks about content performance, which pages drive results, content ROI, or wants to understand how search traffic behaves on their site. Also trigger for 'best performing content', 'content audit', or 'which pages are working'.",
    category: "SEO",
    requiredTools: ["gsc_query", "ga4_query"],
    requiredConnections: ["GSC", "GA4"],
    credits: null,
    plan: "PRO",
    examplePrompts: [
      "Audit my content performance",
      "Which of my pages are actually driving results?",
      "Cross-reference my GSC and GA4 data",
    ],
    skillBody: indent(`
# Content Performance Audit

You are a content strategist evaluating the user's content performance by combining search and analytics data.

## What this skill does
Combines Google Search Console (search traffic) and GA4 (on-site behavior) data to give a complete picture of how content is performing — from search visibility to user engagement.

## Steps

1. **List connections** — call \`list_connections\`.
2. **GSC top pages** — call \`gsc_query\` with metric="top_pages", days=28, limit=20.
3. **GA4 top pages** — call \`ga4_query\` with metric="top_pages", days=28, limit=20.
4. **GA4 traffic overview** — call \`ga4_query\` with metric="traffic", days=28.
5. **Cross-reference** — match GSC pages with GA4 pages to create a unified view.

## Report format

### 📝 Content Performance Audit — [Site]

#### 🏆 Top Performing Content
Pages that rank well AND engage users (high clicks + low bounce rate).

| Page | Clicks | Impressions | Avg Position | Sessions | Bounce Rate | Avg Duration |
|------|--------|-------------|--------------|----------|-------------|--------------|

#### ⚠️ Underperforming Content
Pages with search visibility but poor engagement (high impressions, low CTR or high bounce).

#### 🔍 Hidden Gems
Pages with great engagement metrics but low search visibility — candidates for SEO optimization.

#### 💡 Action Items
Specific recommendations for each category of content.
`),
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // Analytics
  // ═══════════════════════════════════════════════════════════════════════════
  {
    id: "ga4-weekly-report",
    name: "GA4 Weekly Report",
    description:
      "Generate a comprehensive weekly analytics report from Google Analytics 4. Use this skill when the user asks for a weekly analytics report, traffic summary, website performance overview, or wants to know their GA4 stats. Also trigger for 'analytics report', 'traffic report', or 'how is my website doing'.",
    category: "Analytics",
    requiredTools: ["ga4_query", "list_connections"],
    requiredConnections: ["GA4"],
    credits: null,
    plan: "STARTER",
    examplePrompts: [
      "Give me my weekly GA4 report",
      "How is my website traffic this week?",
      "Run my analytics report",
    ],
    skillBody: indent(`
# GA4 Weekly Report

You are a digital analytics specialist preparing a weekly traffic report.

## Steps

1. **List connections** — call \`list_connections\`.
2. **Traffic overview** — call \`ga4_query\` with metric="traffic", days=7.
3. **Top pages** — call \`ga4_query\` with metric="top_pages", days=7, limit=15.
4. **Traffic sources** — call \`ga4_query\` with metric="traffic_sources", days=7.
5. **Device breakdown** — call \`ga4_query\` with metric="devices", days=7.
6. **Geo breakdown** — call \`ga4_query\` with metric="geo", days=7, limit=10.

## Report format

### 📊 Weekly Analytics Report — [Property Name]
**Period:** Last 7 days

#### Overview
| Metric | Value |
|--------|-------|
| Sessions | X |
| Users | X |
| New Users | X |
| Pageviews | X |
| Bounce Rate | X% |
| Engagement Rate | X% |
| Avg Session Duration | Xm Xs |

#### 📄 Top Pages
Table of top 15 pages by sessions.

#### 🔗 Traffic Sources
Breakdown by channel (organic, direct, referral, social, paid, email).

#### 📱 Device Split
Desktop vs mobile vs tablet with session share percentages.

#### 🌍 Top Countries
Top 10 countries by sessions.

#### 💡 Key Takeaways
3-5 notable observations and recommendations.
`),
  },

  {
    id: "traffic-source-deep-dive",
    name: "Traffic Source Deep Dive",
    description:
      "Analyze where your website traffic comes from in detail using GA4 data. Use this skill when the user asks about traffic sources, referral traffic, organic vs paid, channel performance, or wants to understand their audience acquisition. Also trigger for 'where is my traffic coming from', 'acquisition report', or 'channel breakdown'.",
    category: "Analytics",
    requiredTools: ["ga4_query"],
    requiredConnections: ["GA4"],
    credits: null,
    plan: "STARTER",
    examplePrompts: [
      "Where is my traffic coming from?",
      "Break down my traffic sources",
      "Show me my acquisition channels",
    ],
    skillBody: indent(`
# Traffic Source Deep Dive

You are an analytics specialist analyzing website traffic acquisition patterns.

## Steps

1. **Traffic sources** — call \`ga4_query\` with metric="traffic_sources", days=28.
2. **Traffic overview** — call \`ga4_query\` with metric="traffic", days=28.
3. **Geo data** — call \`ga4_query\` with metric="geo", days=28, limit=15.

## Report format

### 🔗 Traffic Source Analysis — [Property Name]

#### Channel Performance (last 28 days)
| Channel | Sessions | Users | New Users | Bounce Rate | Share |
|---------|----------|-------|-----------|-------------|-------|

#### 📊 Channel Health Assessment
For each major channel, rate its health (strong / growing / declining / needs attention) and explain why.

#### 🌍 Geographic Distribution
Top countries and what this means for targeting.

#### 💡 Recommendations
- Which channels to double down on
- Which channels need improvement
- Opportunities for new traffic sources
`),
  },

  {
    id: "landing-page-optimizer",
    name: "Landing Page Optimizer",
    description:
      "Identify your best and worst landing pages by combining GA4 engagement data with GSC search data. Use this when the user asks about landing page performance, page optimization, conversion opportunities, or which pages need improvement. Also trigger for 'optimize my pages', 'best landing pages', or 'page performance'.",
    category: "Analytics",
    requiredTools: ["ga4_query", "gsc_query"],
    requiredConnections: ["GA4", "GSC"],
    credits: null,
    plan: "PRO",
    examplePrompts: [
      "Which landing pages need optimization?",
      "Show me my best and worst pages",
      "Help me optimize my top pages",
    ],
    skillBody: indent(`
# Landing Page Optimizer

You are a conversion optimization specialist analyzing landing page performance.

## Steps

1. **GA4 top pages** — call \`ga4_query\` with metric="top_pages", days=28, limit=20.
2. **GSC top pages** — call \`gsc_query\` with metric="top_pages", days=28, limit=20.
3. **Cross-reference** — match pages from both sources to get a combined view of search performance + on-site engagement.

## Report format

### 🎯 Landing Page Optimization Report

#### ✅ Star Performers
Pages with strong search traffic AND good engagement. These are your templates for success.

#### ⚠️ High Traffic, Poor Engagement
Pages getting search clicks but users bounce quickly. These need UX or content improvements.

#### 🔍 Low Traffic, High Engagement
Pages users love but aren't finding via search. These need SEO optimization.

#### 📋 Page-by-Page Optimization Plan
For each underperforming page, provide specific, actionable optimization suggestions.
`),
  },

  {
    id: "device-geo-report",
    name: "Device & Geo Report",
    description:
      "Analyze your audience by device type and geography using GA4. Use this when the user asks about their audience demographics, device usage, mobile vs desktop, or geographic distribution. Also trigger for 'audience report', 'mobile traffic', 'desktop vs mobile', or 'which countries visit my site'.",
    category: "Analytics",
    requiredTools: ["ga4_query"],
    requiredConnections: ["GA4"],
    credits: null,
    plan: "STARTER",
    examplePrompts: [
      "What devices do my visitors use?",
      "Show me mobile vs desktop traffic",
      "Which countries is my traffic from?",
    ],
    skillBody: indent(`
# Device & Geo Report

You are a digital analyst examining audience composition by device and location.

## Steps

1. **Devices** — call \`ga4_query\` with metric="devices", days=28.
2. **Geo** — call \`ga4_query\` with metric="geo", days=28, limit=20.
3. **Traffic overview** — call \`ga4_query\` with metric="traffic", days=28 for context.

## Report format

### 👥 Audience Report — [Property Name]

#### 📱 Device Breakdown
| Device | Sessions | Share | Bounce Rate |
|--------|----------|-------|-------------|

Analysis: Is mobile experience optimized? Compare bounce rates across devices.

#### 🌍 Top Countries
| Country | Sessions | Users | New Users |
|---------|----------|-------|-----------|

#### 💡 Insights
- Mobile optimization status
- Geographic targeting opportunities
- Recommendations for underperforming segments
`),
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // Local Business
  // ═══════════════════════════════════════════════════════════════════════════
  {
    id: "gmb-performance-dashboard",
    name: "GMB Performance Dashboard",
    description:
      "Get a comprehensive view of your Google Business Profile performance — impressions, actions, and trends. Use this when the user asks about their Google Business listing, local SEO performance, GMB stats, or business profile insights. Also trigger for 'Google Business Profile', 'my business listing', 'local search performance', or 'GMB report'.",
    category: "Local Business",
    requiredTools: ["gmb_query"],
    requiredConnections: ["GMB"],
    credits: null,
    plan: "STARTER",
    examplePrompts: [
      "How is my Google Business Profile doing?",
      "Show me my GMB performance",
      "Give me a local SEO report",
    ],
    skillBody: indent(`
# GMB Performance Dashboard

You are a local SEO specialist reviewing Google Business Profile performance.

## Steps

1. **Performance overview** — call \`gmb_query\` with metric="overview".
2. **Recent reviews** — call \`gmb_query\` with metric="reviews", limit=10.

## Report format

### 📍 Google Business Profile Report — [Business Name]

#### 📊 Performance Metrics (Last 7 Days)
| Metric | Value |
|--------|-------|
| Total Impressions | X |
| Maps Impressions (Mobile) | X |
| Maps Impressions (Desktop) | X |
| Search Impressions (Mobile) | X |
| Search Impressions (Desktop) | X |
| Phone Calls | X |
| Website Clicks | X |
| Direction Requests | X |

#### ⭐ Recent Reviews
Summary of the latest reviews with star ratings and key themes.

#### 💡 Local SEO Recommendations
Actionable tips to improve visibility and customer engagement.
`),
  },

  {
    id: "review-response-generator",
    name: "Review Response Generator",
    description:
      "Fetch your latest Google reviews and generate professional, personalized responses for each. Use this when the user asks about responding to reviews, managing reviews, needs review replies, or wants to handle customer feedback. Also trigger for 'respond to my reviews', 'review management', 'write review responses', or 'help me reply to Google reviews'.",
    category: "Local Business",
    requiredTools: ["gmb_query"],
    requiredConnections: ["GMB"],
    credits: null,
    plan: "STARTER",
    examplePrompts: [
      "Help me respond to my Google reviews",
      "Write replies for my latest reviews",
      "Generate review responses",
    ],
    skillBody: indent(`
# Review Response Generator

You are a customer relations specialist helping the user respond professionally to Google reviews.

## Steps

1. **Fetch reviews** — call \`gmb_query\` with metric="reviews", limit=10.
2. **Generate responses** — for each review, write a personalized response.

## Response guidelines

**For positive reviews (4-5 stars):**
- Thank the customer by context (reference what they mentioned)
- Keep it warm but professional
- Mention something specific from their review
- Subtly encourage future visits

**For negative reviews (1-2 stars):**
- Acknowledge the issue with empathy
- Don't be defensive
- Offer to make it right (e.g., "Please contact us at...")
- Keep it brief and professional

**For neutral reviews (3 stars):**
- Thank them for the feedback
- Address any specific concerns
- Highlight what you're doing to improve

## Output format

For each review, show:
> **Review:** [star rating] — "[review text]"
>
> **Suggested response:**
> [your generated response]
`),
  },

  {
    id: "local-seo-audit",
    name: "Local SEO Audit",
    description:
      "Comprehensive local SEO audit combining GMB data, GSC search performance, and rank checking for local keywords. Use this when the user wants a full local SEO assessment, local ranking check, or complete picture of their local search presence. Also trigger for 'local SEO audit', 'local rankings', or 'how am I doing locally'.",
    category: "Local Business",
    requiredTools: ["gmb_query", "gsc_query", "rank_check_direct"],
    requiredConnections: ["GMB", "GSC"],
    credits: null,
    plan: "PRO",
    examplePrompts: [
      "Run a local SEO audit for my business",
      "How are my local rankings?",
      "Full local search assessment",
    ],
    skillBody: indent(`
# Local SEO Audit

You are a local SEO consultant performing a comprehensive audit.

## Steps

1. **GMB performance** — call \`gmb_query\` with metric="overview".
2. **GMB reviews** — call \`gmb_query\` with metric="reviews", limit=5.
3. **GSC local queries** — call \`gsc_query\` with metric="top_queries", days=28, limit=20. Look for local intent keywords (containing city names, "near me", etc.).
4. **Rank check** — ask the user for their city/service keywords, then call \`rank_check_direct\` with their domain and those keywords.

## Report format

### 📍 Local SEO Audit — [Business Name]

#### Google Business Profile Health
Score the GBP health and explain gaps.

#### Local Search Visibility
How the business appears for local searches via GSC data.

#### Keyword Rankings
Live rank check results for key local terms.

#### ⭐ Review Analysis
Rating average, volume, sentiment themes.

#### 📋 Priority Action Items
Ranked list of improvements ordered by impact.
`),
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // Competitor Analysis
  // ═══════════════════════════════════════════════════════════════════════════
  {
    id: "competitor-rank-comparison",
    name: "Competitor Rank Comparison",
    description:
      "Compare your keyword rankings against competitors on Google. Use this when the user wants to compare their rankings with competitors, see who ranks for what, or benchmark against the competition. Also trigger for 'competitor rankings', 'how do I compare to competitors', 'ranking comparison', or 'who ranks better'.",
    category: "Competitor Analysis",
    requiredTools: ["rank_check_direct"],
    requiredConnections: [],
    credits: 2,
    plan: "STARTER",
    examplePrompts: [
      "Compare my rankings with competitor.com",
      "Who ranks better for these keywords — me or them?",
      "Competitor ranking comparison",
    ],
    skillBody: indent(`
# Competitor Rank Comparison

You are a competitive intelligence analyst comparing search rankings.

## Steps

1. **Get inputs** — ask for:
   - The user's domain
   - 1-3 competitor domains
   - 5-10 target keywords (or help them pick from their niche)
   - Target location/country
2. **Check user's rankings** — call \`rank_check_direct\` with the user's domain and all keywords.
3. **Check each competitor** — call \`rank_check_direct\` for each competitor domain with the same keywords.

## Report format

### 🏁 Ranking Comparison

#### Head-to-Head Results
| Keyword | [Your Domain] | [Competitor 1] | [Competitor 2] | Winner |
|---------|--------------|----------------|----------------|--------|

#### 📊 Scorecard
| Domain | Keywords Ranked | Avg Position | #1 Rankings |
|--------|----------------|-------------|-------------|

#### 💡 Competitive Insights
- Keywords where competitors outrank you (and what to do about it)
- Keywords where you're winning (defend these)
- Keywords nobody ranks for (opportunity!)
`),
  },

  {
    id: "backlink-gap-finder",
    name: "Backlink Gap Finder",
    description:
      "Compare your backlink profile against competitors to find link building opportunities. Use this when the user asks about competitor backlinks, link building opportunities, backlink comparison, or who links to competitors. Also trigger for 'backlink gap', 'link building', 'competitor backlinks', or 'who links to my competitors'.",
    category: "Competitor Analysis",
    requiredTools: ["backlink_check"],
    requiredConnections: [],
    credits: 2,
    plan: "STARTER",
    examplePrompts: [
      "Find backlink gaps between me and my competitor",
      "Who links to competitor.com but not to me?",
      "Compare our backlink profiles",
    ],
    skillBody: indent(`
# Backlink Gap Finder

You are a link building strategist analyzing backlink profiles.

## Steps

1. **Get domains** — ask for the user's domain and 1-2 competitor domains.
2. **User backlink profile** — call \`backlink_check\` for the user's domain.
3. **Competitor profiles** — call \`backlink_check\` for each competitor.

## Report format

### 🔗 Backlink Gap Analysis

#### Profile Comparison
| Metric | [Your Domain] | [Competitor 1] | [Competitor 2] |
|--------|--------------|----------------|----------------|
| Total Backlinks | X | X | X |
| Referring Domains | X | X | X |
| Domain Authority | X | X | X |

#### 🎯 Link Building Opportunities
Domains that link to competitors but not to you — these are your outreach targets.

#### 📈 Backlink Growth Trends
Compare historical backlink growth rates.

#### 💡 Link Building Strategy
Specific outreach recommendations based on the gap analysis.
`),
  },

  {
    id: "ai-visibility-report",
    name: "AI Visibility Report",
    description:
      "Check how your brand appears across AI platforms — Google AI Overviews, ChatGPT, Perplexity, and Gemini. Use this when the user asks about AI visibility, AI citations, SGE presence, brand mentions in AI, or how they appear in AI-generated answers. Also trigger for 'AI overview', 'do AI tools mention my brand', 'ChatGPT citations', or 'AI search presence'.",
    category: "Competitor Analysis",
    requiredTools: ["ai_overview_check"],
    requiredConnections: ["GA4"],
    credits: null,
    plan: "STARTER",
    examplePrompts: [
      "Does ChatGPT mention my brand?",
      "Check my AI visibility",
      "How does my site appear in AI Overviews?",
    ],
    skillBody: indent(`
# AI Visibility Report

You are a digital PR specialist analyzing brand presence across AI platforms.

## Steps

1. **Get domain(s)** — ask for the user's domain and optionally 1-2 competitors.
2. **Check AI visibility** — call \`ai_overview_check\` for each domain.

## Report format

### 🤖 AI Visibility Report

#### Your AI Presence — [domain]
| Platform | Citations |
|----------|----------|
| Google AI Overviews | X |
| Google AI Mode | X |
| ChatGPT | X |
| Perplexity | X |
| Gemini | X |
| Est. AI Overview Traffic | X visits/month |

#### Competitor Comparison (if provided)
Side-by-side comparison table.

#### 💡 How to Improve AI Visibility
Specific strategies to increase citations across AI platforms.
`),
  },

  {
    id: "traffic-keyword-spy",
    name: "Traffic & Keyword Spy",
    description:
      "Spy on any competitor's estimated traffic, top keywords, and keyword difficulty. Use this when the user wants to research a competitor's traffic, see what keywords they rank for, or understand a competitor's SEO strategy. Also trigger for 'competitor traffic', 'spy on competitor', 'competitor keywords', or 'how much traffic does [domain] get'.",
    category: "Competitor Analysis",
    requiredTools: ["traffic_data", "keyword_volume"],
    requiredConnections: [],
    credits: 2,
    plan: "STARTER",
    examplePrompts: [
      "How much traffic does competitor.com get?",
      "Spy on my competitor's SEO",
      "What keywords does this domain rank for?",
    ],
    skillBody: indent(`
# Traffic & Keyword Spy

You are a competitive intelligence researcher analyzing competitor traffic and keywords.

## Steps

1. **Get target domain** — ask for the domain to research.
2. **Traffic data** — call \`traffic_data\` for the domain.
3. **If the user provides specific keywords to research**, call \`keyword_volume\` for those keywords.

## Report format

### 🕵️ Competitor Intelligence — [domain]

#### Traffic Overview
| Metric | Value |
|--------|-------|
| Organic Traffic | X visits/month |
| Paid Traffic | X visits/month |
| Organic Keywords | X |

#### 🌍 Traffic by Country
Top countries with traffic share.

#### 🔑 Keyword Research (if keywords provided)
| Keyword | Volume | CPC | Difficulty |
|---------|--------|-----|------------|

#### 💡 Competitive Takeaways
What you can learn from this competitor's strategy.
`),
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // Content
  // ═══════════════════════════════════════════════════════════════════════════
  {
    id: "content-gap-analysis",
    name: "Content Gap Analysis",
    description:
      "Identify content topics you should be covering based on keyword trends and your existing GSC data. Use this when the user asks about content gaps, what to write about next, content planning, or keyword-driven content strategy. Also trigger for 'what should I write about', 'content ideas', 'topic research', or 'content calendar'.",
    category: "Content",
    requiredTools: ["gsc_query", "keyword_volume", "trends_query"],
    requiredConnections: ["GSC"],
    credits: 2,
    plan: "PRO",
    examplePrompts: [
      "What content should I create next?",
      "Find content gaps in my niche",
      "Help me plan my content calendar",
    ],
    skillBody: indent(`
# Content Gap Analysis

You are a content strategist identifying topics the user should cover.

## Steps

1. **Current content performance** — call \`gsc_query\` with metric="top_queries", days=28, limit=30 to understand what the site already ranks for.
2. **Identify theme clusters** — group existing keywords into topic clusters.
3. **Trend check** — for the top 2-3 theme clusters, call \`trends_query\` with metric="related_queries" to find related topics.
4. **Volume validation** — take the top 5 gap keywords and call \`keyword_volume\` to validate demand and assess difficulty.

## Report format

### 📝 Content Gap Analysis — [Site]

#### Current Topic Clusters
What the site already covers (based on GSC data).

#### 🎯 Content Gaps
Topics related to your niche that you're NOT covering yet.

| Topic | Search Volume | Difficulty | Trending? | Priority |
|-------|-------------|------------|-----------|----------|

#### 📅 Suggested Content Calendar
Ordered list of content to create, with suggested formats and target keywords.
`),
  },

  {
    id: "blog-post-optimizer",
    name: "Blog Post Optimizer",
    description:
      "Optimize an existing blog post by analyzing its current search performance and finding keyword opportunities. Use this when the user wants to improve an existing page, optimize a blog post, increase traffic to a specific URL, or update old content. Also trigger for 'optimize this page', 'improve my blog post', 'update old content', or 'how can I rank higher for this page'.",
    category: "Content",
    requiredTools: ["gsc_query", "keyword_volume"],
    requiredConnections: ["GSC"],
    credits: 2,
    plan: "PRO",
    examplePrompts: [
      "Optimize my blog post at /blog/seo-tips",
      "How can I improve this page's rankings?",
      "Help me update my old content for better SEO",
    ],
    skillBody: indent(`
# Blog Post Optimizer

You are an SEO content editor optimizing existing pages for better search performance.

## Steps

1. **Get the target URL** — ask which page/post to optimize.
2. **Current performance** — call \`gsc_query\` with metric="top_queries", days=28, page=[the URL] to see which keywords this page ranks for.
3. **Keyword research** — take the top 3-5 keywords and call \`keyword_volume\` to understand volume and difficulty.
4. **Related opportunities** — look at the GSC data for keywords with high impressions but low CTR or poor position.

## Report format

### ✏️ Optimization Plan — [URL]

#### Current Search Performance
| Keyword | Position | Clicks | Impressions | CTR |
|---------|----------|--------|-------------|-----|

#### 🎯 Primary Target Keyword
The best keyword to optimize for (highest volume + realistic difficulty).

#### 📋 Optimization Checklist
- [ ] Title tag optimization (include primary keyword, make it compelling)
- [ ] Meta description (include keyword, add a call to action)
- [ ] H1 heading (matches search intent)
- [ ] Content gaps (topics mentioned in ranking competitors but missing from this page)
- [ ] Internal linking opportunities
- [ ] Image alt text optimization

#### 💡 Content Additions
Specific sections or topics to add to the page based on keyword gaps.
`),
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // Technical SEO
  // ═══════════════════════════════════════════════════════════════════════════
  {
    id: "pagespeed-performance-audit",
    name: "PageSpeed Performance Audit",
    description:
      "Analyze any webpage's Core Web Vitals, performance scores, and loading speeds using PageSpeed Insights. Use this skill when the user asks to check their website speed, analyze performance, run a PageSpeed audit, check Core Web Vitals, or optimize loading times. Also trigger for 'PageSpeed audit', 'site speed check', 'Core Web Vitals report', or 'optimize my page'.",
    category: "Technical SEO",
    requiredTools: ["pagespeed_query"],
    requiredConnections: [],
    credits: null,
    plan: "STARTER",
    examplePrompts: [
      "Run a PageSpeed audit for https://example.com",
      "Check my site speed and Core Web Vitals",
      "Optimize my homepage loading speed",
    ],
    skillBody: indent(`
      # PageSpeed Performance Audit

      You are a performance optimization expert auditing the user's webpage speed and Core Web Vitals.

      ## Steps

      1. **Get URL and strategy** — Ask the user for the URL to check (and optionally if they want to test "mobile" or "desktop"). If strategy isn't specified, run "mobile" first as it is Google's default indexing strategy.
      2. **Run PageSpeed audit** — Call \`pagespeed_query\` with the target URL and selected strategy.
      3. **Compile results** into a detailed performance report.
      4. **Identify critical speed bottlenecks** — Analyze the Core Web Vitals (FCP, LCP, CLS, TBT) and Lighthouse scores.
      5. **Suggest optimizations** — Provide actionable recommendations based on the "Top Improvement Opportunities" returned by the tool.

      ## Report format

      ### ⚡ PageSpeed Performance Report: [URL]

      #### 🏆 Lighthouse Scores
      | Category | Score | Status |
      |---|---|---|
      | Performance | [Score]/100 | [🟢 Good / 🟡 Needs Improvement / 🔴 Poor] |
      | Accessibility | [Score]/100 | [🟢 / 🟡 / 🔴] |
      | Best Practices | [Score]/100 | [🟢 / 🟡 / 🔴] |
      | SEO | [Score]/100 | [🟢 / 🟡 / 🔴] |

      #### ⏱️ Core Web Vitals & Metrics
      - **Largest Contentful Paint (LCP):** [Value] (Target: < 2.5s) — *Measures loading performance.*
      - **First Contentful Paint (FCP):** [Value] (Target: < 1.8s) — *Measures when the first content appears.*
      - **Cumulative Layout Shift (CLS):** [Value] (Target: < 0.1) — *Measures visual stability.*
      - **Total Blocking Time (TBT):** [Value] (Target: < 200ms) — *Measures responsiveness during load.*
      - **Speed Index:** [Value] — *Measures how quickly page contents are visually populated.*
      - **Time to Interactive (TTI):** [Value] — *Measures when the page becomes fully interactive.*

      #### 🔧 Top Improvement Opportunities
      [List the opportunities from the tool with a brief, user-friendly explanation of what they mean and how to implement them.]

      #### 💡 Action Plan
      Provide 3-5 prioritized recommendations for developers/users (e.g. optimizing image formats, deferring unused JS, leverage CDN, CSS optimization) to speed up the page.
    `),
  },

  {
    id: "url-indexing-batch-check",
    name: "URL Indexing Batch Check",
    description:
      "Check the indexing status of multiple URLs at once using the URL Inspection API. Use this when the user wants to batch-check URLs, verify a site migration, check if a batch of new pages are indexed, or audit their sitemap. Also trigger for 'batch URL check', 'are these pages indexed', 'site migration check', or 'sitemap audit'.",
    category: "Technical SEO",
    requiredTools: ["gsc_url_inspect"],
    requiredConnections: ["GSC"],
    credits: null,
    plan: "STARTER",
    examplePrompts: [
      "Check if these 10 URLs are indexed",
      "Verify my site migration pages are indexed",
      "Batch indexing check for my new pages",
    ],
    skillBody: indent(`
# URL Indexing Batch Check

You are a technical SEO specialist running batch URL inspections.

## Steps

1. **Get URLs** — ask the user for the list of URLs to check (or ask them to paste a list).
2. **Inspect each URL** — call \`gsc_url_inspect\` for each URL, one at a time.
3. **Compile results** into a summary table.

## Report format

### 🔍 Batch Indexing Report

#### Summary
| Status | Count |
|--------|-------|
| ✅ Indexed | X |
| ❌ Not Indexed | X |
| ⚠️ Excluded | X |

#### Detailed Results
| URL | Status | Last Crawled | Issues |
|-----|--------|-------------|--------|

#### ❌ URLs Needing Attention
For each non-indexed URL, explain the issue and how to fix it.
`),
  },

  {
    id: "site-health-scorecard",
    name: "Site Health Scorecard",
    description:
      "Generate a comprehensive site health scorecard combining indexing data, search performance, and backlink profile. Use this when the user wants a full technical SEO assessment, site health overview, or complete SEO scorecard. Also trigger for 'site health', 'technical SEO audit', 'SEO scorecard', or 'full site assessment'.",
    category: "Technical SEO",
    requiredTools: ["gsc_url_inspect", "gsc_query", "backlink_check"],
    requiredConnections: ["GSC"],
    credits: null,
    plan: "PRO",
    examplePrompts: [
      "Give me a site health scorecard",
      "Full technical SEO assessment",
      "How healthy is my site?",
    ],
    skillBody: indent(`
# Site Health Scorecard

You are a technical SEO auditor creating a comprehensive health scorecard.

## Steps

1. **Backlink profile** — call \`backlink_check\` for the user's domain.
2. **GSC top pages** — call \`gsc_query\` with metric="top_pages", days=28, limit=10 to identify the most important pages.
3. **Inspect key pages** — call \`gsc_url_inspect\` for the top 3-5 pages (homepage + top landing pages).
4. **GSC query performance** — call \`gsc_query\` with metric="top_queries", days=28, limit=20.

## Report format

### 🏥 Site Health Scorecard — [Domain]

#### Overall Score: [X/100]
Calculate based on: indexing health (25pts), search performance (25pts), backlink strength (25pts), technical health (25pts).

#### 📊 Search Performance
Summary of clicks, impressions, CTR trends.

#### 🔗 Backlink Health
| Metric | Value | Rating |
|--------|-------|--------|
| Domain Authority | X | ⭐⭐⭐ |
| Total Backlinks | X | ⭐⭐⭐ |
| Referring Domains | X | ⭐⭐⭐ |

#### 🔍 Indexing Health
Status of key pages — what's indexed, what's not.

#### ⚠️ Issues Found
Prioritized list of technical issues.

#### 📋 Action Plan
Top 5 priority fixes, ordered by impact.
`),
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // Full Stack
  // ═══════════════════════════════════════════════════════════════════════════
  {
    id: "complete-seo-dashboard",
    name: "Complete SEO Dashboard",
    description:
      "Generate a complete, all-in-one SEO dashboard pulling data from every connected source. Use this when the user wants a comprehensive overview, full SEO dashboard, complete marketing report, or wants to see everything in one place. Also trigger for 'full SEO report', 'complete dashboard', 'show me everything', or 'monthly SEO report'.",
    category: "SEO",
    requiredTools: [
      "list_connections",
      "gsc_query",
      "ga4_query",
      "gmb_query",
      "backlink_check",
      "ai_overview_check",
      "trends_query",
    ],
    requiredConnections: ["GSC"],
    credits: null,
    plan: "AGENCY",
    examplePrompts: [
      "Give me a complete SEO dashboard",
      "Full monthly SEO report",
      "Show me everything about my site",
    ],
    skillBody: indent(`
# Complete SEO Dashboard

You are a senior SEO consultant creating a comprehensive monthly report pulling data from all available sources.

## Steps

1. **Discover connections** — call \`list_connections\` to see what's available.
2. **GSC queries** — call \`gsc_query\` with metric="top_queries", days=28, limit=20.
3. **GSC pages** — call \`gsc_query\` with metric="top_pages", days=28, limit=15.
4. **If GA4 connected** — call \`ga4_query\` for traffic, top_pages, traffic_sources, devices, geo.
5. **If GMB connected** — call \`gmb_query\` for overview and reviews.
6. **Backlink profile** — call \`backlink_check\` for the user's domain.
7. **AI visibility** — call \`ai_overview_check\` for the user's domain.

## Report format

### 📊 Complete SEO Dashboard — [Site/Business Name]
**Report Period:** Last 28 days

#### Executive Summary
2-3 sentence overview of overall performance.

#### 🔍 Search Performance (GSC)
Top queries and pages with key metrics.

#### 🌐 Website Analytics (GA4)
Traffic overview, top pages, sources, devices.

#### 📍 Local Presence (GMB)
Impressions, actions, review summary.

#### 🔗 Backlink Profile
Authority score, total backlinks, growth trend.

#### 🤖 AI Visibility
Citations across AI platforms.

#### 📈 Trends & Opportunities
Rising search trends relevant to the user's niche.

#### 💡 Top 10 Recommendations
Prioritized action items across all channels, ordered by estimated impact.
`),
  },
];

// ─── Category metadata for UI ────────────────────────────────────────────────

export const SKILL_CATEGORIES: {
  id: SkillCategory;
  label: string;
  icon: string;
}[] = [
  { id: "SEO", label: "SEO", icon: "🔍" },
  { id: "Analytics", label: "Analytics", icon: "📊" },
  { id: "Local Business", label: "Local Business", icon: "📍" },
  { id: "Competitor Analysis", label: "Competitor Analysis", icon: "🏁" },
  { id: "Content", label: "Content", icon: "📝" },
  { id: "Technical SEO", label: "Technical SEO", icon: "🔧" },
];
