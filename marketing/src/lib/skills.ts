// Claude SEO Skills — content model for the /skills hub and per-skill landing pages.
// Ported from the Claude design export. All copy is intentionally unique per skill
// (better for programmatic SEO). Skills themselves ship later — these pages market them.

export type SourceId = "gsc" | "ga4" | "psi" | "serp";
export type CategoryId = "rankings" | "audits" | "reporting" | "research" | "ai-search";
export type SkillTag = "Popular" | "New";

export interface Category {
  id: CategoryId;
  label: string;
  icon: string;
  blurb: string;
}

export interface Source {
  label: string;
  short: string;
  hue: string;
}

export interface Skill {
  id: string;
  name: string;
  cat: CategoryId;
  icon: string;
  desc: string;
  sources: SourceId[];
  tag?: SkillTag;
  // Publish date (YYYY-MM-DD). A skill goes live once this date has arrived.
  // Skills with no publishedAt are drafts — hidden from the grid, sitemap and routes.
  // A daily deploy (see .github/workflows/daily-skills.yml) rebuilds so newly-due pages appear.
  publishedAt?: string;
}

export interface SampleRow {
  kw: string;
  tw: number;
  lw: number;
  change: string;
  dir: "up" | "down" | "flat";
}

export interface SkillSample {
  title: string;
  columns: string[];
  rows: SampleRow[];
  summary: string;
  badge: string;
}

export interface SkillDetail {
  long: string;
  outputs: string[];
  sample?: SkillSample;
  // Optional SEO overrides. When set, they replace the default templated
  // <title> / meta description for this skill's page. Keep descriptions ≤160 chars.
  metaTitle?: string;
  metaDescription?: string;
}

export const CATEGORIES: Category[] = [
  { id: "rankings", label: "Rankings", icon: "trending-up", blurb: "Track positions, visibility and SERP movement." },
  { id: "audits", label: "Audits", icon: "search-check", blurb: "Find what's holding your site back, technically." },
  { id: "reporting", label: "Reporting", icon: "file-bar-chart", blurb: "Turn raw data into client-ready reports." },
  { id: "research", label: "Research", icon: "compass", blurb: "Mine opportunities, gaps and competitors." },
];

export const SOURCES: Record<SourceId, Source> = {
  gsc: { label: "Search Console", short: "GSC", hue: "var(--amber)" },
  ga4: { label: "GA4", short: "GA4", hue: "oklch(0.62 0.19 30)" },
  psi: { label: "PageSpeed Insights", short: "PSI", hue: "oklch(0.6 0.16 145)" },
  // Real-time rank checks run through an external SERP API — not Search Console.
  serp: { label: "Live SERP API", short: "API", hue: "oklch(0.55 0.17 262)" },
};

export const SKILLS: Skill[] = [
  // RANKINGS
  { id: "keyword-rank-tracker", name: "Keyword Rank Tracker", cat: "rankings", icon: "line-chart",
    desc: "Monitor daily positions for every tracked keyword and flag movers before clients do.",
    sources: ["serp"], tag: "Popular", publishedAt: "2026-07-12" },
  { id: "competitor-rank-watch", name: "Competitor Rank Watch", cat: "rankings", icon: "swords",
    desc: "Watch where rivals out-rank you and get alerted the moment they overtake a target term.",
    sources: ["serp"] },

  // AUDITS
  { id: "seo-audit", name: "SEO Audit", cat: "audits", icon: "clipboard-check",
    desc: "A full crawl-and-score pass: titles, meta, indexability and on-page issues, prioritised.",
    sources: ["gsc", "psi"], tag: "Popular", publishedAt: "2026-07-12" },
  { id: "technical-seo-audit", name: "Technical SEO Audit", cat: "audits", icon: "settings-2",
    desc: "Surface crawl traps, redirect chains, canonical conflicts and render-blocking problems.",
    sources: ["psi"], publishedAt: "2026-07-13" },
  { id: "core-web-vitals-audit", name: "Core Web Vitals Audit", cat: "audits", icon: "gauge",
    desc: "Grade LCP, INP and CLS per template and turn field data into a fix-it list.",
    sources: ["psi"] },
  { id: "internal-linking-audit", name: "Internal Linking Audit", cat: "audits", icon: "link-2",
    desc: "Map your link graph, find orphan pages and route authority to money pages.",
    sources: ["gsc"] },

  // REPORTING
  { id: "seo-report-generator", name: "SEO Report Generator", cat: "reporting", icon: "file-text",
    desc: "Generate a complete, narrated SEO report from your connected data in one prompt.",
    sources: ["gsc", "ga4"], tag: "Popular", publishedAt: "2026-07-13" },
  { id: "ai-traffic-report", name: "AI Traffic Report", cat: "reporting", icon: "bot",
    desc: "Break out sessions arriving from ChatGPT, Perplexity and Gemini referrals.",
    sources: ["ga4"], tag: "New", publishedAt: "2026-07-24" },
  { id: "monthly-seo-report", name: "Monthly SEO Report", cat: "reporting", icon: "calendar-days",
    desc: "Your recurring month-end deck: traffic, rankings and conversions, auto-compiled.",
    sources: ["gsc", "ga4"] },

  // RESEARCH
  { id: "competitor-research", name: "Competitor Research", cat: "research", icon: "telescope",
    desc: "Profile a competitor's top pages, winning queries and content cadence at a glance.",
    sources: ["gsc"] },
  { id: "keyword-cannibalization", name: "Keyword Cannibalization Detector", cat: "research", icon: "copy",
    desc: "Spot pages competing for the same query and recommend which one to consolidate.",
    sources: ["gsc"] },
  { id: "topic-cluster-generator", name: "Topic Cluster Generator", cat: "research", icon: "network",
    desc: "Build a pillar-and-cluster content map from your existing queries and coverage.",
    sources: ["gsc"] },

  // AI SEARCH
];

export const FAQS: { q: string; a: string }[] = [
  { q: "What is a Claude Skill?",
    a: "A Claude Skill is a reusable package of instructions that teaches Claude to perform a specific marketing task — like building an SEO audit or a monthly report — using your real data. You install it once, then ask Claude in plain language whenever you need it." },
  { q: "How do Claude Skills work?",
    a: "Each skill connects to your EasyFetcher data sources, pulls the metrics it needs, and runs a tested workflow Claude follows step by step. You stay in the chat: ask for the report, review the output, and refine it conversationally — no spreadsheets, no copy-paste." },
  { q: "What data sources are supported?",
    a: "Skills run on the sources you connect through EasyFetcher — including Google Search Console, GA4 and PageSpeed Insights. Each skill card lists exactly which sources it uses, so you only connect what you need." },
  { q: "Are these free?",
    a: "Every skill on this page is free to download and use with your own data. You only need an EasyFetcher account to connect your data sources — and there's a free tier to get started." },
  { q: "Can I modify the skill?",
    a: "Yes. Skills are plain, editable instructions. Open one in Claude, change the metrics, tone, or output format, and save your own version — or fork it into something entirely new for your agency." },
];

// Per-skill FAQs targeting long-tail / SERP-snippet queries. Answers lead with a
// direct, quotable sentence so Google can lift them as featured snippets.
// Skills without an entry fall back to the generic FAQS above.
export const SKILL_FAQS: Record<string, { q: string; a: string }[]> = {
  "keyword-rank-tracker": [
    { q: "What is the Keyword Rank Tracker skill for Claude?",
      a: "Keyword Rank Tracker is a free Claude skill by Easy Fetcher that checks live Google rankings for any keywords you give it. You paste your keyword list into Claude, and it returns each keyword's current position, recent movement, and a plain-English summary you can act on." },
    { q: "How do I track keyword rankings in Claude?",
      a: "To track keyword rankings in Claude, install the Keyword Rank Tracker skill from Easy Fetcher, connect your Easy Fetcher account, then paste your keywords into the chat and say “run Keyword Rank Tracker.” Claude checks live positions through a SERP API and reports them back in seconds." },
    { q: "How do I track United States keyword ranks in Claude?",
      a: "Just tell Claude the market you want — for example, “check these keywords in the United States.” The skill queries US Google results specifically, so you see the exact positions American searchers see. The same works for any other country you target." },
    { q: "Can Claude check keyword rankings in multiple countries like the US, UK and India?",
      a: "Yes. The Keyword Rank Tracker skill checks rankings per country — ask for the US, UK, India or any other market, and Claude pulls that country's SERP. You can compare the same keyword list across several countries in one conversation." },
    { q: "Where does the ranking data come from — is it Google Search Console?",
      a: "Rank positions come from a live external SERP API that checks real Google results in real time — not from Search Console. If you also connect Search Console and GA4, Claude can place clicks, impressions and sessions next to each ranking for the full picture." },
    { q: "Can I see clicks and traffic along with my keyword rankings?",
      a: "Yes. Connect Google Search Console and GA4 to Easy Fetcher and Claude shows each keyword's live rank alongside its clicks, impressions and sessions — rankings, search performance and traffic in one answer, without switching tools." },
    { q: "Can Claude create a keyword ranking report for my clients?",
      a: "Yes. Ask Claude to “build a keyword ranking report for my client” and it compiles positions, movement, wins and losses into a written, share-ready report in about two minutes. You can adjust the tone or format conversationally before sending it." },
    { q: "Is the Keyword Rank Tracker skill free to use?",
      a: "The skill itself is free to download and use with Claude. You need an Easy Fetcher account to run the live rank checks, and there's a free tier to get started — no credit card required." },
  ],
  "seo-audit": [
    { q: "What is the SEO Audit skill for Claude?",
      a: "SEO Audit is a free Claude skill by Easy Fetcher that runs a full crawl-and-score pass on your website. You ask Claude to audit a site, and it returns an overall score plus prioritised issues across indexing, schema, Core Web Vitals, on-page metadata and technical health — in plain English." },
    { q: "How do I run an SEO audit in Claude?",
      a: "To run an SEO audit in Claude, install the SEO Audit skill from Easy Fetcher, connect your Search Console and PageSpeed data, then say “run an SEO audit for mysite.com.” Claude crawls the site, scores it, and lists the highest-impact fixes first — no separate audit tool needed." },
    { q: "What does the SEO Audit skill check?",
      a: "The SEO Audit checks six areas: structured data / schema coverage, page indexing errors, high-impression zero-click queries, Core Web Vitals (LCP, CLS, mobile score), on-page and metadata gaps (titles, meta, ALT, OG images, H1s), and technical health (broken links, orphan pages, canonicals, HTTPS, sitemap freshness)." },
    { q: "Which data sources does the SEO Audit use?",
      a: "The audit combines Google Search Console (indexing and search analytics), PageSpeed Insights (Core Web Vitals) and an external crawl API for on-page and technical checks. You connect these once in Easy Fetcher and Claude pulls them together into a single report." },
    { q: "Is the Claude SEO Audit free?",
      a: "Yes — the SEO Audit skill is free to download and use with Claude. You only need an Easy Fetcher account to connect your data sources, and there's a free tier to get started with no credit card required." },
    { q: "Can Claude tell me how to fix the SEO issues it finds?",
      a: "Yes. Every issue in the audit comes with a recommended fix, and you can ask Claude to go deeper on any of them — for example “how do I fix the render-blocking JS on /pricing?” — and get step-by-step guidance right in the chat." },
    { q: "Can I create an SEO audit report for a client with Claude?",
      a: "Yes. Ask Claude to turn the audit into a client-ready report and it produces a clean, white-label summary of the score, critical issues and recommended next steps in about two minutes — ready to send or drop into a proposal." },
    { q: "How is this different from a normal SEO audit tool?",
      a: "Instead of a static dashboard, the SEO Audit runs inside Claude using your own connected data, so you can ask follow-up questions, request fixes, and generate a report conversationally. It's an audit and an analyst in one, without exporting spreadsheets or switching tools." },
  ],
  "seo-report-generator": [
    { q: "What is the SEO Report Generator skill for Claude?",
      a: "SEO Report Generator is a free Claude skill by Easy Fetcher that builds a complete, narrated SEO report from your connected data in a single prompt. Ask Claude to generate a report and it returns KPIs, trends, landing-page and keyword breakdowns, AI traffic and blog performance — with a plain-English summary of what changed and why." },
    { q: "How do I generate an SEO report in Claude?",
      a: "To generate an SEO report in Claude, install the SEO Report Generator skill from Easy Fetcher, connect Search Console and GA4, then say “generate an SEO report for mysite.com for the last 14 days.” Claude pulls the data, builds the charts and tables, and writes the narrative for you in about two minutes." },
    { q: "Can I create a white-label SEO client report with this skill?",
      a: "Yes. Ask Claude for a client-ready SEO report and it produces a clean, white-label summary of wins, losses, traffic and rankings that you can send straight to a client or drop into a proposal. You can adjust the tone, sections and branding conversationally before you share it." },
    { q: "Does it combine Search Console and GA4 reporting in one report?",
      a: "Yes — the SEO Report Generator merges Google Search Console and GA4 into a single report. Search Console supplies impressions, clicks, CTR and average position, while GA4 adds sessions, engagement, key events and traffic sources, so you get search performance and on-site behaviour side by side." },
    { q: "What does the SEO report include?",
      a: "The report includes five sections: an Overview of core SEO and traffic KPIs with trends, Landing Pages performance with a heatmap and best/worst movers, Keyword Analysis grouped by page, AI Traffic from sources like ChatGPT and Perplexity, and Blog Performance — each drawn live from your connected data." },
    { q: "Is this SEO reporting tool free?",
      a: "Yes — the SEO Report Generator skill is free to download and use with Claude. You only need an Easy Fetcher account to connect Search Console and GA4, and there's a free tier to get started with no credit card required." },
    { q: "Can it show AI traffic from ChatGPT, Perplexity and Gemini?",
      a: "Yes. The report breaks out sessions arriving from AI assistants — ChatGPT, Copilot, Perplexity, Gemini, Claude and others — using your GA4 referral data, so you can see how much traffic and how many conversions this new channel is driving over time." },
    { q: "How is this different from a normal SEO reporting tool?",
      a: "Unlike a fixed dashboard, this SEO reporting tool runs inside Claude on your own connected data, so the report is narrated in plain English and you can ask follow-ups, reshape sections, or turn it into a client report — all in one conversation, with no manual exporting or slide-building." },
  ],
  "technical-seo-audit": [
    { q: "What is the Technical SEO Audit skill for Claude?",
      a: "Technical SEO Audit is a free Claude skill by Easy Fetcher that runs a technical crawl-and-score pass on your site using PageSpeed Insights. It grades Lighthouse categories, checks Core Web Vitals, and flags crawl traps, redirect chains, canonical conflicts and render-blocking resources — with each issue ranked by impact and a clear fix." },
    { q: "How do I run a technical SEO audit in Claude?",
      a: "To run a technical SEO audit in Claude, install the Technical SEO Audit skill from Easy Fetcher, connect PageSpeed Insights, then say “run a technical SEO audit for mysite.com.” Claude scores your pages, surfaces the technical issues, and tells you which fixes will move the needle first." },
    { q: "What technical issues does it check for?",
      a: "It checks redirect chains, render-blocking CSS/JS, oversized images, canonical conflicts, crawl traps from infinite URL parameters, missing next-gen image formats, unused JavaScript, HTTPS and mixed content, and mobile viewport configuration — plus a per-page performance breakdown." },
    { q: "Does it measure Core Web Vitals (LCP, INP, CLS)?",
      a: "Yes. The audit reports LCP, INP and CLS with field and lab data, plus supporting metrics like FCP, Total Blocking Time and Speed Index — and grades each as Good, Needs Work or Poor so you know exactly where you stand against Google's thresholds." },
    { q: "Can I see mobile and desktop scores separately?",
      a: "Yes. Page-level Lighthouse scores are shown for both mobile and desktop, so you can compare performance per device and prioritise the mobile issues Google actually ranks on — with the main bottleneck listed for every page." },
    { q: "What data source does the Technical SEO Audit use?",
      a: "The audit runs on Google PageSpeed Insights (Lighthouse), which you connect once in Easy Fetcher. Claude pulls the scores and diagnostics for your pages and turns them into a prioritised, plain-English report." },
    { q: "How is a technical SEO audit different from a regular SEO audit?",
      a: "A regular SEO audit covers on-page and content signals — titles, meta, indexing, schema. A technical SEO audit focuses on how the site is built and served: speed, Core Web Vitals, crawlability, redirects and rendering. Easy Fetcher offers both as separate Claude skills so you can run whichever you need." },
    { q: "Is the Technical SEO Audit skill free?",
      a: "Yes — the skill is free to download and use with Claude. You only need an Easy Fetcher account to connect PageSpeed Insights, and there's a free tier to get started with no credit card required." },
  ],
  "competitor-rank-watch": [
    { q: "What is the Competitor Rank Watch skill for Claude?",
      a: "Competitor Rank Watch is a free Claude skill by Easy Fetcher that tracks how your competitors rank against you for the keywords you care about. You give Claude your terms and rivals, and it returns a side-by-side position table, flags where each competitor leads, and alerts you when someone overtakes you." },
    { q: "How do I track competitor keyword rankings in Claude?",
      a: "To track competitor rankings in Claude, install the Competitor Rank Watch skill from Easy Fetcher, then say “compare my rankings against competitor1.com and competitor2.com for these keywords.” Claude checks live positions for every domain and shows who ranks where, side by side." },
    { q: "Where does competitor ranking data come from?",
      a: "Competitor positions come from a live external SERP API that checks real Google results — not from Search Console. Search Console only shows your own site, so seeing where rivals rank requires live SERP data, which this skill pulls automatically through Easy Fetcher." },
    { q: "Can Claude alert me when a competitor overtakes me?",
      a: "Yes. The skill highlights overtake events — the moment a competitor moves above you on a target keyword — so you can react before a client notices. Each tracked term shows your standing as Leading, Tied or Behind versus the strongest competitor." },
    { q: "How many competitors and keywords can I track?",
      a: "You choose the keyword set and the competitor domains to watch — typically a handful of rivals across your priority terms. Just tell Claude which domains and keywords to compare, and it returns the full matrix in one answer." },
    { q: "Can I check competitor rankings by country?",
      a: "Yes. Tell Claude which market to check — the US, UK, India or anywhere else — and it pulls that country's SERP so you compare positions in the exact region you're competing in." },
    { q: "Can I turn competitor rankings into a client report?",
      a: "Yes. Ask Claude to build a competitor ranking report and it produces a share-ready summary of who leads each keyword, where you're gaining or losing, and the biggest overtakes — ready to send to a client in about two minutes." },
    { q: "Is the Competitor Rank Watch skill free?",
      a: "Yes — the skill is free to download and use with Claude. You need an Easy Fetcher account to run the live SERP checks, and there's a free tier to get started with no credit card required." },
  ],
  "ai-traffic-report": [
    { q: "What is Easy Fetcher's AI Traffic Report skill and how does it work?",
      a: "Easy Fetcher's AI Traffic Report is a Claude skill that breaks out the visits your site gets from AI assistants — ChatGPT, Copilot, Perplexity, Gemini, Claude, Meta AI, Grok and more. Using your Google Analytics 4 data, it reports sessions, users and signups per AI source, plus how fast the channel is growing week over week." },
    { q: "How does Easy Fetcher track ChatGPT and Perplexity traffic in GA4?",
      a: "Easy Fetcher reads your GA4 session and referral data and matches each source against known AI domains — chatgpt.com, perplexity.ai, gemini.google.com, copilot.microsoft.com, claude.ai, meta.ai, grok.com and others. Every visit is attributed to the AI assistant that sent it, with no extra tracking code, tag or pixel to install." },
    { q: "Can Easy Fetcher show how many signups come from AI assistants like ChatGPT?",
      a: "Yes. Beyond sessions and users, Easy Fetcher's AI Traffic Report attributes signups and other GA4 key events to each AI source — so you can see not just how much traffic ChatGPT, Perplexity or Gemini send, but how well that traffic actually converts into signups." },
    { q: "Which AI sources does the Easy Fetcher AI Traffic Report track?",
      a: "It tracks ChatGPT (OpenAI), Microsoft Copilot, Perplexity, Google Gemini, Claude (Anthropic), Meta AI and Grok, plus an “others” bucket that captures emerging tools like You.com, Poe, Phind and Mistral — each with its share of total AI traffic and a weekly trend line." },
    { q: "How do I see AI traffic in Google Analytics 4 using Easy Fetcher and Claude?",
      a: "Install the AI Traffic Report skill, connect GA4 in Easy Fetcher, then ask Claude to “show my AI referral traffic.” Claude pulls your GA4 data and returns a per-source breakdown of sessions, users and signups, ranked by volume — the view GA4 doesn't give you out of the box." },
    { q: "Does Easy Fetcher need extra tracking code to measure AI referral traffic?",
      a: "No. Easy Fetcher works entirely from the GA4 data you already collect — there's no new tag, script or pixel to add. Connect GA4 once and Claude attributes your existing sessions to each AI assistant automatically." },
    { q: "Can I turn Easy Fetcher's AI Traffic Report into a client-ready report?",
      a: "Yes. Ask Claude to package the AI traffic breakdown into a client report and it produces a written summary of your top AI sources, signups and week-over-week growth that you can share or export directly." },
    { q: "Is Easy Fetcher's AI Traffic Report skill free to use with Claude?",
      a: "The skill itself is free to download and add to Claude. To run it on your own data you'll need an Easy Fetcher account with an active plan to connect GA4 — that's what lets Claude read your analytics securely and attribute your AI traffic." },
  ],
  "keyword-cannibalization": [
    { q: "What is the Keyword Cannibalization Detector skill for Claude?",
      a: "Keyword Cannibalization Detector is a free Claude skill by Easy Fetcher that finds queries where two or more of your pages compete for the same term. Using Search Console data, it shows which pages split the impressions, how many clicks you're leaking, and a recommended fix for each conflict." },
    { q: "How do I find keyword cannibalization in Claude?",
      a: "Install the Keyword Cannibalization Detector skill from Easy Fetcher, connect Search Console, then ask Claude to “find keyword cannibalization on my site.” It scans your queries for ones where multiple pages rank, sorts them by lost-click impact, and lists the competing pages for each." },
    { q: "What is keyword cannibalization and why does it hurt SEO?",
      a: "Keyword cannibalization is when several of your pages target the same query, so Google can't decide which to rank — it rotates them, splits impressions, and often ranks all of them lower. The result is lots of impressions but few clicks. Fixing it usually recovers clicks quickly with no new content." },
    { q: "How does the skill detect cannibalization?",
      a: "It uses your Search Console data to find exact-match queries where 2+ pages pick up impressions, then shows the impression split across those pages and their average positions — so you can see exactly which URLs are competing and which one is strongest." },
    { q: "How do I fix cannibalized keywords?",
      a: "Each conflict comes with a specific recommendation — usually consolidate near-duplicate pages and 301-redirect the weaker one, re-target a blog post to informational intent, or add internal links pointing the right anchor text to your chosen canonical page. Claude spells out the fix per query." },
    { q: "What data source does it use?",
      a: "The Keyword Cannibalization Detector runs on Google Search Console, which you connect once in Easy Fetcher. Claude reads your query-and-page performance data to surface the overlaps and the clicks they're costing you." },
    { q: "Can it estimate how many clicks cannibalization is costing me?",
      a: "Yes. The report estimates the clicks lost each month to diluted rankings and shows the total impressions affected, so you can prioritise the highest-impact conflicts first." },
    { q: "Is the Keyword Cannibalization Detector free?",
      a: "Yes — the skill is free to download and use with Claude. You only need an Easy Fetcher account to connect Search Console, and there's a free tier to get started with no credit card required." },
  ],
};

export function getFaqs(skillId: string): { q: string; a: string }[] {
  return SKILL_FAQS[skillId] || FAQS;
}

// Per-skill detail content for the product pages (unique copy = better SEO).
export const DETAILS: Record<string, SkillDetail> = {
  "keyword-rank-tracker": {
    long: "Stop refreshing rank checkers by hand. This skill keeps a daily pulse on every keyword you track and tells you what moved, by how much, and why it matters — in plain language you can drop straight into a client update.",
    outputs: ["Daily position history for every tracked keyword", "Automatic movement and volatility alerts", "A win/loss summary ready to paste into any report"],
    sample: {
      title: "Keyword Rank Tracker",
      columns: ["Keyword", "This Week", "Last Week", "Change", "Status"],
      rows: [
        { kw: "seo audit tool", tw: 5, lw: 8, change: "+3", dir: "up" },
        { kw: "rank tracking software", tw: 3, lw: 5, change: "+2", dir: "up" },
        { kw: "local seo checker", tw: 7, lw: 9, change: "+2", dir: "up" },
        { kw: "keyword tracker free", tw: 14, lw: 12, change: "-2", dir: "down" },
        { kw: "serp position tool", tw: 11, lw: 11, change: "0", dir: "flat" },
      ],
      summary: "3 keywords improved this week. “seo audit tool” jumped from position 8 to 5 — your biggest mover. Watch “keyword tracker free” — it dropped 2 spots and may need a content refresh.",
      badge: "Ready to paste into your client report",
    },
  },
  "competitor-rank-watch": { long: "Know the moment a competitor overtakes you. This skill watches rival positions against your target terms and surfaces exactly where — and how far — they're ahead.", outputs: ["Side-by-side ranking comparison vs each rival", "Overtake and drop alerts on priority terms", "A gap list of queries a competitor currently leads"] },
  "seo-audit": { long: "A complete crawl-and-score pass over your site: titles, meta, indexability and on-page issues, all prioritised by impact so you fix what actually moves rankings first.", outputs: ["A prioritised issue list, ranked by impact", "An on-page score per page template", "Quick-win recommendations you can ship today"] },
  "technical-seo-audit": { long: "Surface the technical problems crawlers hit but humans miss — crawl traps, redirect chains, canonical conflicts and render-blocking resources — before they cost you indexation.", outputs: ["A crawlability and indexation report", "A redirect-chain and canonical map", "A render-blocking resource list"] },
  "core-web-vitals-audit": { long: "Grade LCP, INP and CLS per template and turn raw field data into a clear, ranked fix-it list — so engineering knows precisely what to ship.", outputs: ["LCP / INP / CLS grade per template", "Field vs lab data comparison", "A fix-it checklist ranked by users affected"] },
  "internal-linking-audit": { long: "Map your internal link graph, find orphan and dead-end pages, and route authority to the pages that actually make you money.", outputs: ["A visual internal link graph", "An orphan and dead-end page list", "Authority-routing recommendations"] },
  "seo-report-generator": { long: "Generate a complete, narrated SEO report from your connected data in a single prompt — charts, tables and a written summary, ready to share.", outputs: ["A fully narrated SEO report", "Auto-pulled charts and tables", "A share-ready PDF or document"] },
  "ai-traffic-report": { long: "Break out the sessions arriving from ChatGPT, Perplexity and Gemini, and see how this new channel stacks up against traditional organic.", outputs: ["Sessions broken out by AI source", "Conversion attribution from LLM referrals", "A trend line vs traditional organic"],
    metaTitle: "Google Analytics AI Traffic Reporting Skill for Claude",
    metaDescription: "Track AI traffic in Google Analytics 4 — ChatGPT, Perplexity & Gemini sessions, users and signups inside Claude. Signup today to see your AI referrals." },
  "monthly-seo-report": { long: "Your recurring month-end deck, auto-compiled: traffic, rankings and conversions, compared month over month with zero manual assembly.", outputs: ["A month-over-month KPI recap", "Rankings, traffic and conversions in one view", "A recurring, auto-compiled deck"] },
  "competitor-research": { long: "Profile any competitor's top pages, winning queries and content cadence at a glance — the brief you'd normally spend an afternoon building.", outputs: ["A competitor top-page list", "Their winning-query inventory", "A content-cadence snapshot"] },
  "keyword-cannibalization": { long: "Spot pages competing for the same query, see which is winning, and get a clear recommendation on which to consolidate.", outputs: ["Competing-page pairs per query", "A consolidation recommendation", "An estimated impact of fixing it"] },
  "topic-cluster-generator": { long: "Build a pillar-and-cluster content map from your existing queries and coverage — and spot the topics you're missing entirely.", outputs: ["A pillar-and-cluster content map", "Coverage gaps by topic", "Suggested article briefs"] },
};

export function getSkill(id: string): Skill | undefined {
  return SKILLS.find((s) => s.id === id);
}

// ── Scheduled publishing ─────────────────────────────────────────────
// A skill is live once its publishedAt date has arrived. Evaluated at build
// time; a daily deploy (daily-skills.yml) rebuilds so newly-due pages appear.
export function isPublished(s: Skill, now: Date = new Date()): boolean {
  return !!s.publishedAt && new Date(s.publishedAt).getTime() <= now.getTime();
}

export function publishedSkills(now: Date = new Date()): Skill[] {
  return SKILLS.filter((s) => isPublished(s, now));
}

export function publishedCategories(now: Date = new Date()): Category[] {
  const live = publishedSkills(now);
  return CATEGORIES.filter((c) => live.some((s) => s.cat === c.id));
}

export function getCategory(id: CategoryId): Category | undefined {
  return CATEGORIES.find((c) => c.id === id);
}

export function getDetail(id: string): SkillDetail {
  return DETAILS[id] || { long: getSkill(id)?.desc || "", outputs: [] };
}

export function relatedSkills(skill: Skill, limit = 3): Skill[] {
  const live = publishedSkills().filter((s) => s.id !== skill.id);
  let related = live.filter((s) => s.cat === skill.cat);
  if (related.length < limit) {
    related = related.concat(live.filter((s) => s.cat !== skill.cat));
  }
  return related.slice(0, limit);
}

export function skillUrl(id: string): string {
  return `/skills/${id}`;
}
