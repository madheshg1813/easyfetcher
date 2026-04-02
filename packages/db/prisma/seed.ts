import { PrismaClient, Plan, Platform, PromptCategory } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding prompt library...");

  await prisma.prompt.deleteMany();

  const prompts: {
    title: string;
    description: string;
    category: PromptCategory;
    requiredSources: Platform[];
    requiredPlan: Plan;
    template: string;
    sortOrder: number;
  }[] = [
    // ─── SEO (5 prompts) ────────────────────────────────────────
    {
      title: "Full SEO Audit Report",
      description:
        "Analyze my GSC data and generate a complete SEO audit covering top pages, ranking opportunities, CTR improvements, and quick wins.",
      category: PromptCategory.SEO,
      requiredSources: [Platform.GSC],
      requiredPlan: Plan.FREE,
      template: `You are an expert SEO analyst. Using the Google Search Console data provided, generate a comprehensive SEO audit report.

Structure your report as follows:
1. **Executive Summary** – top 3 findings and priority actions
2. **Top Performing Pages** – pages with highest clicks, impressions, and CTR
3. **Ranking Opportunities** – keywords ranking positions 4–20 with high impression volume
4. **CTR Improvement Candidates** – pages with high impressions but below-average CTR
5. **Quick Wins** – actionable improvements that can be implemented within a week

Use tables where appropriate. Be specific with data points.`,
      sortOrder: 1,
    },
    {
      title: "Technical SEO Health Check",
      description:
        "Review crawl errors, indexing issues, pages with zero clicks, and Core Web Vitals problems from my Search Console data.",
      category: PromptCategory.SEO,
      requiredSources: [Platform.GSC],
      requiredPlan: Plan.FREE,
      template: `You are a technical SEO specialist. Analyse the Google Search Console data provided and produce a Technical SEO Health Check report.

Cover:
1. **Indexing Status** – pages not indexed, coverage errors, excluded pages
2. **Crawl Errors** – 404s, server errors, redirect chains
3. **Zero-Click Pages** – pages with impressions but zero clicks and why
4. **Core Web Vitals** – poor/needs improvement URLs and recommendations
5. **Mobile Usability** – any mobile usability issues detected
6. **Priority Fix List** – ordered list of technical issues by impact

Provide specific URLs and metrics for each finding.`,
      sortOrder: 2,
    },
    {
      title: "Keyword Gap Analysis",
      description:
        "Find all keywords ranking position 5–20 with more than 100 impressions. List them with current position, impressions, CTR and suggest content improvements.",
      category: PromptCategory.SEO,
      requiredSources: [Platform.GSC],
      requiredPlan: Plan.FREE,
      template: `You are an SEO content strategist. Using the Google Search Console data, identify keyword gap opportunities.

Focus on:
- Keywords ranking in positions 5–20
- Minimum 100 impressions in the selected period
- Sorted by impression volume descending

For each keyword provide:
| Keyword | Current Position | Impressions | CTR | Recommended Action |

Then provide:
1. **Content Improvement Suggestions** – for the top 10 opportunity keywords, suggest specific title tag, H1, and content improvements
2. **Quick Wins vs Long-term** – classify each opportunity
3. **Estimated Traffic Gain** – rough estimate if position improved to top 3`,
      sortOrder: 3,
    },
    {
      title: "Content Decay Report",
      description:
        "Identify pages that had high traffic 3–6 months ago but are now declining. Show the trend and suggest refresh strategies.",
      category: PromptCategory.SEO,
      requiredSources: [Platform.GSC],
      requiredPlan: Plan.FREE,
      template: `You are a content strategist and SEO analyst. Using Google Search Console data, identify content decay patterns.

Analysis steps:
1. **Identify Decaying Pages** – pages that showed strong performance 3–6 months ago but have declining clicks/impressions now
2. **Decay Severity Score** – rank pages by percentage decline
3. **Root Cause Analysis** – for top 5 decaying pages, hypothesise reasons (algorithm update, seasonality, competition, content staleness)
4. **Refresh Strategy** – for each decaying page, provide a specific content refresh action plan:
   - What to add/update
   - New sections to consider
   - Internal linking opportunities
   - Schema markup recommendations
5. **Priority Queue** – pages to refresh in order of potential recovery impact`,
      sortOrder: 4,
    },
    {
      title: "CTR Optimization Report",
      description:
        "Find pages with high impressions but below-average CTR. Suggest title tag and meta description improvements for each.",
      category: PromptCategory.SEO,
      requiredSources: [Platform.GSC],
      requiredPlan: Plan.FREE,
      template: `You are an expert in search snippet optimization and conversion copywriting. Using Google Search Console data, identify CTR improvement opportunities.

1. **CTR Benchmark** – calculate the average CTR by position bracket (1–3, 4–10, 11–20)
2. **Underperforming Pages** – list all pages with CTR significantly below benchmark for their average position
3. **For each underperforming page, provide:**
   - Current estimated title tag (infer from query data)
   - 3 alternative title tag suggestions (power words, numbers, emotional hooks)
   - 2 meta description suggestions (benefit-led, includes primary keyword, call to action)
   - Estimated CTR improvement potential
4. **A/B Testing Plan** – how to test the new snippets and measure results
5. **Rich Snippet Opportunities** – pages where FAQ, How-To, or Review schema could boost CTR`,
      sortOrder: 5,
    },

    // ─── ANALYTICS (5 prompts) ──────────────────────────────────
    {
      title: "Traffic Drop Diagnosis",
      description:
        "Analyze my GA4 data to identify when traffic dropped, which channels were affected, and what likely caused it.",
      category: PromptCategory.ANALYTICS,
      requiredSources: [Platform.GA4],
      requiredPlan: Plan.FREE,
      template: `You are a digital analytics expert and detective. Using the GA4 data provided, diagnose the traffic drop.

Investigation framework:
1. **Drop Timeline** – identify the exact date(s) when traffic declined
2. **Channel Breakdown** – which acquisition channels were affected (organic, paid, social, direct, referral)?
3. **Page-Level Impact** – which pages lost the most traffic?
4. **Geographic & Device Segmentation** – was the drop concentrated in specific countries or device types?
5. **Probable Causes** – list the top 3 most likely causes with evidence from the data
6. **Recovery Roadmap** – specific steps to investigate further and actions to take
7. **Prevention Checklist** – what monitoring to set up to catch this earlier next time`,
      sortOrder: 6,
    },
    {
      title: "Monthly KPI Summary",
      description:
        "Generate a client-ready monthly performance report with sessions, conversions, top pages, top sources, and MoM comparisons.",
      category: PromptCategory.ANALYTICS,
      requiredSources: [Platform.GA4],
      requiredPlan: Plan.FREE,
      template: `You are a senior digital analyst preparing a monthly executive report for a client. Using GA4 data, produce a professional monthly KPI summary.

Report structure:
1. **Performance Snapshot** – key metrics table: Sessions, Users, Pageviews, Bounce Rate, Avg Session Duration, Conversions, Revenue (if applicable). Include MoM % change with trend arrows (↑↓).
2. **Traffic Sources** – top 5 acquisition channels with sessions, conversion rate, and MoM change
3. **Top 10 Pages** – by sessions with bounce rate and avg time on page
4. **Conversion Analysis** – top converting pages/flows, conversion rate by channel
5. **Notable Trends** – 3 key observations from the data
6. **Recommendations** – 3 actionable recommendations for next month
7. **Next Month Focus** – priorities based on data insights

Format professionally. Use tables. Keep executive summary under 100 words.`,
      sortOrder: 7,
    },
    {
      title: "Conversion Funnel Analysis",
      description:
        "Show me where users drop off in the conversion funnel and which pages have the highest exit rates.",
      category: PromptCategory.ANALYTICS,
      requiredSources: [Platform.GA4],
      requiredPlan: Plan.PRO,
      template: `You are a conversion rate optimization (CRO) specialist. Using GA4 funnel and behaviour data, identify drop-off points and optimisation opportunities.

Analysis:
1. **Funnel Visualisation** – map the main conversion funnel(s) with step-by-step drop-off rates
2. **Critical Drop-off Points** – identify the 3 steps with the highest abandonment rates
3. **High Exit Rate Pages** – list pages with above-average exit rates, segmented by traffic source
4. **User Journey Analysis** – common paths users take before converting vs. abandoning
5. **Segment Comparison** – funnel performance by device type, new vs. returning users, top traffic sources
6. **CRO Recommendations** – for each critical drop-off point, provide 2–3 specific A/B test hypotheses
7. **Quick Wins vs. Strategic Changes** – categorise recommendations by effort and expected impact`,
      sortOrder: 8,
    },
    {
      title: "Audience Behaviour Report",
      description:
        "Analyze user segments, new vs returning, device breakdown, and top user journeys from GA4 data.",
      category: PromptCategory.ANALYTICS,
      requiredSources: [Platform.GA4],
      requiredPlan: Plan.PRO,
      template: `You are an audience intelligence analyst. Using GA4 data, provide a deep-dive audience behaviour report.

Cover:
1. **Audience Overview** – total users, new vs returning split, engagement rate
2. **Device & Browser Breakdown** – performance by device type (mobile/desktop/tablet), OS, and browser
3. **Geographic Analysis** – top 10 countries/regions by sessions and conversion rate
4. **Behavioural Segments** – identify distinct user groups by behaviour patterns (power users, one-time visitors, at-risk users)
5. **Top User Journeys** – most common page-path sequences leading to conversion and abandonment
6. **Engagement Metrics** – pages per session, session duration, scroll depth patterns
7. **Audience Opportunities** – segments to invest more in, segments to re-engage, messaging recommendations`,
      sortOrder: 9,
    },
    {
      title: "Landing Page Performance",
      description:
        "Rank all landing pages by bounce rate, session duration, and conversion rate. Flag underperformers.",
      category: PromptCategory.ANALYTICS,
      requiredSources: [Platform.GA4],
      requiredPlan: Plan.PRO,
      template: `You are a landing page optimisation expert. Using GA4 landing page data, produce a comprehensive performance ranking and optimisation plan.

1. **Landing Page Scorecard** – rank all landing pages by a composite score of:
   - Bounce rate (lower = better)
   - Avg session duration (higher = better)
   - Conversion rate (higher = better)
   - Sessions volume (weighting factor)

2. **Top Performers** – what the best landing pages have in common
3. **Underperformers Flag** – pages scoring in the bottom 25% that receive significant traffic
4. **Traffic Source Breakdown** – how each landing page performs by acquisition channel
5. **Improvement Recommendations** – for top 5 underperforming pages:
   - Specific UX/copy issues to investigate
   - A/B test ideas
   - Technical performance considerations
6. **Prioritised Action Plan** – quick wins sorted by traffic × conversion gap`,
      sortOrder: 10,
    },

    // ─── PAID ADS — Google Ads (3 prompts) ──────────────────────
    {
      title: "Google Ads Performance Report",
      description:
        "Analyze campaign ROAS, CPC trends, keyword quality scores, and budget allocation. Flag wasted spend.",
      category: PromptCategory.PAID_ADS,
      requiredSources: [Platform.GOOGLE_ADS],
      requiredPlan: Plan.PRO,
      template: `You are a Google Ads performance analyst. Using the Google Ads data provided, produce a detailed performance report.

1. **Campaign Overview** – table of all campaigns: Spend, Clicks, Impressions, CTR, Avg CPC, Conversions, CPA, ROAS
2. **ROAS Analysis** – campaigns ranked by ROAS, identify top performers and underperformers vs. account benchmark
3. **CPC Trend Analysis** – CPC trends over time, identify anomalies and seasonal patterns
4. **Quality Score Audit** – keywords with quality score < 6, root cause (ad relevance, expected CTR, landing page)
5. **Wasted Spend Report** – keywords/ads/placements consuming budget with zero or poor conversions
6. **Budget Allocation Recommendations** – shift budget recommendations from underperforming to high-ROAS campaigns
7. **Actionable Optimisations** – top 10 specific changes to implement this week, ordered by expected impact`,
      sortOrder: 11,
    },
    {
      title: "Keyword Bid Recommendations",
      description:
        "Review all keywords and suggest bid adjustments based on conversion rate and quality score data.",
      category: PromptCategory.PAID_ADS,
      requiredSources: [Platform.GOOGLE_ADS],
      requiredPlan: Plan.PRO,
      template: `You are a paid search bidding strategist. Using Google Ads keyword data, provide precise bid adjustment recommendations.

Analysis framework:
1. **Keyword Performance Matrix** – plot all keywords by: Quality Score (x-axis) vs Conversion Rate (y-axis) vs spend (bubble size)
2. **Bid Increase Candidates** – keywords with high quality score + high conversion rate but low impression share. Suggest % increase.
3. **Bid Decrease Candidates** – keywords with low conversion rate + high CPC burning budget. Suggest % decrease or pause.
4. **Quality Score Improvement Plan** – for keywords with QS < 7, provide specific actions to improve ad relevance, CTR, and landing page experience
5. **Match Type Review** – broad match keywords that should be tightened to phrase/exact based on search term data
6. **Negative Keyword Recommendations** – irrelevant search terms to add as negatives
7. **Bid Strategy Recommendation** – manual CPC vs. smart bidding strategy recommendation per campaign based on conversion data`,
      sortOrder: 12,
    },
    {
      title: "Ad Copy Performance Analysis",
      description:
        "Compare ad copy variants by CTR and conversion rate. Identify top performers and underperformers.",
      category: PromptCategory.PAID_ADS,
      requiredSources: [Platform.GOOGLE_ADS],
      requiredPlan: Plan.PRO,
      template: `You are a direct response copywriter and paid search specialist. Analyse Google Ads creative performance data.

1. **Ad Copy Inventory** – table of all active ads with: Headlines, Descriptions, CTR, Conversion Rate, Quality Score, Status
2. **Top Performing Copy Elements** – identify common words/phrases/structures in highest CTR and CVR ads
3. **Underperforming Ads** – ads with below-average CTR or CVR consuming significant budget — recommend pause or rewrite
4. **Headline Analysis** – which headline positions (H1/H2/H3) are most impactful, best performing angles (price, benefit, urgency, social proof)
5. **Description Analysis** – CTAs that convert best, description patterns in top ads
6. **New Ad Variation Suggestions** – for each underperforming ad group, write 3 new ad headline + description combinations using proven copy principles
7. **RSA Asset Ratings** – review pinned vs unpinned assets, recommend asset optimisation`,
      sortOrder: 13,
    },

    // ─── PAID ADS — Meta Ads (2 prompts) ────────────────────────
    {
      title: "Meta Ads Creative Fatigue Report",
      description:
        "Identify which ad creatives are experiencing frequency fatigue and when to rotate them.",
      category: PromptCategory.PAID_ADS,
      requiredSources: [Platform.META_ADS],
      requiredPlan: Plan.PRO,
      template: `You are a Meta Ads creative strategist. Using Meta Ads data, identify creative fatigue and build a rotation plan.

1. **Fatigue Diagnosis** – for each active creative, calculate:
   - Frequency score (impressions / reach)
   - CTR trend over time (week-over-week decline %)
   - CPM trend (increasing CPM = audience saturation signal)
   - Relevance score / quality ranking trend
2. **Fatigue Severity Matrix** – classify creatives as: Healthy / Approaching Fatigue / Fatigued / Dead
3. **Rotation Schedule** – recommended dates to pause each fatigued creative based on current trajectory
4. **Creative Insights** – what's working in top-performing creatives (format, hook type, CTA, creative length)
5. **New Creative Brief** – for each fatigued ad set, provide a creative brief for replacements:
   - Format recommendation (video/image/carousel)
   - Hook concepts (3 options)
   - Key message and CTA
   - Audience angle
6. **Testing Framework** – how to A/B test new creatives without disrupting learning phase`,
      sortOrder: 14,
    },
    {
      title: "Meta Audience Performance",
      description:
        "Break down performance by audience segment, age, gender, placement and suggest budget shifts.",
      category: PromptCategory.PAID_ADS,
      requiredSources: [Platform.META_ADS],
      requiredPlan: Plan.PRO,
      template: `You are a Meta Ads audience optimisation specialist. Using Meta Ads breakdown data, analyse audience performance and recommend budget reallocation.

1. **Demographic Breakdown**
   - Age group performance: Spend, CTR, CVR, CPA, ROAS per age bracket
   - Gender performance comparison
   - Flag demographics with CPA significantly above/below account average

2. **Placement Performance**
   - Performance by placement (Feed, Stories, Reels, Audience Network, Messenger)
   - Recommend placements to scale vs pause

3. **Audience Segment Analysis**
   - Retargeting vs prospecting performance
   - Lookalike audience performance by percentage similarity
   - Interest-based vs behaviour-based audience comparison

4. **Budget Shift Recommendations**
   - Specific budget reallocation suggestions with projected impact
   - Audiences to scale (high ROAS, low CPM headroom)
   - Audiences to reduce or pause (high CPA, audience saturation)

5. **Audience Expansion Opportunities**
   - Untested audience segments to test based on top performer profile
   - Lookalike seed audience recommendations`,
      sortOrder: 15,
    },
  ];

  await prisma.prompt.createMany({ data: prompts });

  console.log(`✅ Seeded ${prompts.length} prompts successfully.`);
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
