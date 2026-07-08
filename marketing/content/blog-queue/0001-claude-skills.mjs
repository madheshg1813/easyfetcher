// Blog draft — consumed by scripts/publish-next-blog.mjs (one per day via GitHub Action).
// `body` is Markdown (headings, bullets, | tables |, links); converted to Portable Text at publish time.
// Follows the editorial checklist: keyword in H1/H2, TL;DR intro, bullets, a table,
// FAQs, interlinks, and ~2 external statistical links.

export default {
  title: "What Are Claude Skills? A Simple Guide for Marketers",
  slug: "claude-skills",
  category: "Product",
  // Creative cover: Claude logo + a short word (not the full title).
  cover: { logo: "claude", label: "Skills" },
  excerpt:
    "Claude Skills are reusable folders of instructions Claude loads on demand to do specialized tasks. Here's what Claude Skills are, how they work, and why they matter for SEO and marketing.",
  body: `
If you have ever explained the same process to Claude over and over, **Claude Skills** are about to save you a lot of typing. A Claude Skill lets you package a task once — your steps, your rules, your resources — and Claude reuses it automatically whenever it's relevant.

This is a big deal because AI is no longer a novelty in marketing. Most organizations now use generative AI in at least one business function ([McKinsey's State of AI](https://www.mckinsey.com/capabilities/quantumblack/our-insights/the-state-of-ai)), and the teams winning with it are the ones who turn ad-hoc prompting into repeatable systems. That's exactly what Claude Skills do.

This guide explains what Claude Skills are, how they work, and how they fit alongside tools like the Model Context Protocol (MCP).

## What is a Claude Skill?

A **Claude Skill** (also called an *Agent Skill*) is a folder of instructions and resources that teaches Claude how to do a specialized task. Every skill has one required file — a \`SKILL.md\` document with a short name and description, followed by plain-language instructions.

A skill can also bundle extra files next to \`SKILL.md\`:

- **Scripts** Claude can run, like a Python script that formats a spreadsheet
- **Templates** to reuse, such as a branded client-report layout
- **Reference material**, like your brand guidelines or an SEO checklist

Think of a Claude Skill as an onboarding doc for a new teammate — except the teammate is Claude, and it reads the doc instantly. You can learn more about the approach directly from [Anthropic](https://www.anthropic.com).

## How Claude Skills actually work

The clever part is what Anthropic calls **progressive disclosure**. Claude does not load every skill in full — that would be slow and waste context. Instead it works in layers:

- Claude first sees only each skill's **name and description** (a few tokens).
- When your request matches, it loads that skill's full **instructions**.
- If the task needs them, it opens the **bundled files or runs the scripts**.

Because of this, you can give Claude dozens of skills without clogging its memory. It only pulls in what the job actually needs — which keeps responses fast and focused.

## Claude Skills vs. MCP: what's the difference?

This is the question we hear most. Skills and MCP solve different problems, and the best setups use both. Here's a side-by-side:

| Aspect | Claude Skills | MCP (Model Context Protocol) |
| --- | --- | --- |
| What it does | Defines the process and know-how | Connects Claude to live data and tools |
| Lives as | A SKILL.md folder | A server connection |
| Best for | Repeatable tasks and formatting | Fetching real-time data |
| Simple analogy | The recipe | The pantry |

In short: MCP brings the ingredients (your live SEO data), and a Skill is the recipe that turns them into a finished dish. Use MCP to pull real numbers, and a Skill to run the exact audit or report your team expects every time.

## Types of Claude Skills for marketing

Almost any repeatable marketing task can become a skill. Here are common ones marketing teams build:

- **SEO Audit Skill** — runs a consistent technical and on-page site review, flagging issues, quick wins, and content gaps every time.
- **Technical SEO Skill** — checks crawlability, indexation, redirects, sitemaps, and Core Web Vitals against a fixed standard.
- **Local SEO Audit Skill** — reviews Google Business Profile, local pack rankings, citations, and reviews for location-based businesses.
- **Facebook Ad Account Audit Skill** — assesses ad account structure, budget efficiency, audience overlap, and campaign performance.
- **Client Reporting Skill** — assembles branded, on-schedule reports in your exact layout, tone, and metrics.
- **AI Traffic Analysis Skill** — measures visits and citations coming from AI assistants like ChatGPT, Claude, and Perplexity.
- **Keyword Research Skill** — clusters keywords, maps search intent, and prioritizes opportunities by difficulty and value.
- **Competitor Analysis Skill** — compares rankings, content coverage, and backlink profiles against your main rivals.

The pattern is always the same: write the process once, and every future run is consistent — no matter who kicks it off.

## How to create your first Claude Skill

You can start with nothing more than a text file:

1. Create a folder named for the task, e.g. \`seo-audit\`.
2. Add a \`SKILL.md\` file inside it.
3. Write a short, specific description of when Claude should use it.
4. Below that, write the steps exactly as you'd brief a junior teammate.
5. Optionally, drop in a template or checklist the skill can reference.

Keep the description sharp — that's the signal Claude uses to decide when the skill applies. Then refine the steps as you see what Claude gets right and wrong.

## Where Easy Fetcher fits

Skills tell Claude *how* to work. Your data is *what* it works on. [Easy Fetcher](/) is the bridge — it connects your real SEO sources (Google Search Console, Google Analytics, Page Speed Insights and more) to Claude, ChatGPT and Perplexity, and adds tools like keyword volume, backlinks, SERP and rank tracking.

Pair live data with good skills and you get an assistant that pulls your actual numbers *and* follows your exact process to produce audits, reports and recommendations. You can compare our [Pricing Plans](/pricing) or [Signup Now](https://app.easyfetcher.com/signup) to get started in a couple of minutes.
`,
  faqs: [
    {
      q: "Are Claude Skills free to use?",
      a: "Creating a Claude Skill is free — a skill is just a folder with a SKILL.md file, so there is no separate charge to author one. You do need access to Claude (or a Claude-connected tool) to run it. Tools like Easy Fetcher that add live data and SEO capabilities on top of Claude have their own plans.",
    },
    {
      q: "What is the difference between Claude Skills and MCP?",
      a: "Claude Skills define the process — the repeatable steps and formatting Claude should follow. MCP (Model Context Protocol) connects Claude to live data and tools, like your Google Search Console or analytics account. Skills are the recipe; MCP is the pantry. Most powerful setups use both together.",
    },
    {
      q: "How do I create a Claude Skill?",
      a: "Create a folder named for the task, add a SKILL.md file with a short description and step-by-step instructions in plain language, and optionally include templates or scripts. Keep the description specific, since Claude uses it to decide when the skill applies.",
    },
    {
      q: "Where can I use Claude Skills?",
      a: "Skills are portable across the Claude apps (claude.ai and desktop), Claude Code, and the Claude Developer Platform via the API. Write a skill once and it travels with you — no fine-tuning or model training required.",
    },
    {
      q: "Can Claude Skills use my own marketing data?",
      a: "A skill itself is instructions, not a data connection. To let Claude work with your real SEO data, you pair skills with a data connection like MCP. Easy Fetcher provides that connection for Google Search Console, Google Analytics, Page Speed Insights and more.",
    },
  ],
};
