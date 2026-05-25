# EasyFetcher — Claude Code Context

## Project Overview
EasyFetcher is a **marketing MCP SaaS** that lets marketers connect their data sources (Google Search Console, GA4, Google Ads, Meta Ads, Shopify) and run AI-powered prompt templates via the Model Context Protocol.

## Tech Stack
- **Monorepo**: Turborepo + pnpm workspaces
- **Web App**: Next.js 15, React 19, TypeScript, Tailwind v4, shadcn/ui
- **Auth**: Clerk (hosted auth, webhooks for DB sync)
- **Database**: Prisma ORM + Supabase (PostgreSQL)
- **Payments**: Stripe
- **Rate Limiting**: Upstash Redis
- **Email**: Resend
- **Validation**: Zod

## Monorepo Structure
```
apps/
  web/          Next.js 15 frontend + API routes
  mcp-server/   Node.js MCP server (tools exposed to AI clients)
packages/
  db/           Prisma schema + client singleton
  auth/         Clerk helper re-exports
  ui/           Shared React components
```

## Key Conventions
- All tokens stored encrypted (AES-256) in DB — never plain text
- Clerk userId maps to `User.clerkId` in Prisma
- Plan tiers: FREE → PRO → AGENCY → ENTERPRISE
- API key per user for MCP server auth (`User.apiKey`)
- Platform OAuth tokens in `Connection` model

## CSS Variables (Tailwind v4 Theme)

### :root (light mode)
```css
--background: oklch(1 0 0);
--foreground: oklch(0.145 0.032 264.695);
--card: oklch(1 0 0);
--card-foreground: oklch(0.145 0.032 264.695);
--popover: oklch(1 0 0);
--popover-foreground: oklch(0.145 0.032 264.695);
--primary: oklch(0.769 0.188 70.08);
--primary-foreground: oklch(0.211 0.055 24.18);
--secondary: oklch(0.97 0.001 286.375);
--secondary-foreground: oklch(0.21 0.034 264.665);
--muted: oklch(0.97 0.001 286.375);
--muted-foreground: oklch(0.552 0.015 264.695);
--accent: oklch(0.97 0.034 73.24);
--accent-foreground: oklch(0.4 0.12 70.08);
--destructive: oklch(0.627 0.218 27.33);
--destructive-foreground: oklch(0.98 0.001 106.424);
--border: oklch(0.922 0.003 286.375);
--input: oklch(0.922 0.003 286.375);
--ring: oklch(0.769 0.188 70.08);
--radius: 0.5rem;
--sidebar: oklch(0.98 0.002 286.375);
--sidebar-foreground: oklch(0.145 0.032 264.695);
--sidebar-border: oklch(0.922 0.003 286.375);
```

### .dark
```css
--background: oklch(0.145 0.032 264.695);
--foreground: oklch(0.985 0.002 286.375);
--card: oklch(0.18 0.032 264.695);
--card-foreground: oklch(0.985 0.002 286.375);
--popover: oklch(0.145 0.032 264.695);
--popover-foreground: oklch(0.985 0.002 286.375);
--primary: oklch(0.769 0.188 70.08);
--primary-foreground: oklch(0.211 0.055 24.18);
--secondary: oklch(0.25 0.032 264.695);
--secondary-foreground: oklch(0.985 0.002 286.375);
--muted: oklch(0.25 0.032 264.695);
--muted-foreground: oklch(0.65 0.015 264.695);
--accent: oklch(0.28 0.08 70.08);
--accent-foreground: oklch(0.85 0.12 70.08);
--destructive: oklch(0.396 0.141 25.723);
--destructive-foreground: oklch(0.637 0.237 25.331);
--border: oklch(0.25 0.032 264.695);
--input: oklch(0.25 0.032 264.695);
--ring: oklch(0.769 0.188 70.08);
--sidebar: oklch(0.17 0.032 264.695);
--sidebar-foreground: oklch(0.985 0.002 286.375);
--sidebar-border: oklch(0.25 0.032 264.695);
```

## Environment Variables
See `apps/web/.env.local.example` for the full list.

## Sprint Notes
- Sprint 1: Monorepo scaffold + auth + dashboard shell + Prisma schema + seed
- Sprint 2: OAuth connections (GSC, GA4)
- Sprint 3: Prompt library + MCP server
- Sprint 4: Stripe billing + usage limits
