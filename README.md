# EasyFetcher

Marketing MCP SaaS — connect your data sources and run AI-powered marketing prompts via the Model Context Protocol.

## What it does

- Connect Google Search Console, GA4, Google Ads, Meta Ads, Shopify
- Run pre-built AI prompt templates against your real data
- Expose your marketing data to any MCP-compatible AI client (Claude Desktop, etc.)

## Local Setup

### Prerequisites
- Node.js 20+
- pnpm 9+
- Supabase project (for the database)
- Clerk account (for auth)

### 1. Install dependencies

```bash
pnpm install
```

### 2. Configure environment

```bash
cp apps/web/.env.local.example apps/web/.env.local
```

Edit `apps/web/.env.local` and fill in all values (Clerk keys, Supabase URL/keys, Stripe, etc.)

### 3. Generate Prisma client

```bash
pnpm db:generate
```

### 4. Run database migrations

```bash
pnpm db:push
```
> For production use `pnpm db:migrate` with proper migration files.

### 5. Seed the prompt library

```bash
pnpm db:seed
```

### 6. Start development

```bash
pnpm dev
```

## Local Ports

| App | URL |
|-----|-----|
| Web (Next.js) | http://localhost:3000 |
| MCP Server | http://localhost:3001 |

## Project Structure

```
apps/
  web/          Next.js 15 frontend + dashboard + API routes
  mcp-server/   Node.js MCP server
packages/
  db/           Prisma schema, client, seed
  auth/         Clerk helper re-exports
  ui/           Shared React components
```

## Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Auth**: Clerk
- **Database**: Prisma + Supabase (PostgreSQL)
- **Styling**: Tailwind CSS v4 + shadcn/ui
- **Payments**: Stripe
- **Rate Limiting**: Upstash Redis
- **Email**: Resend
- **Monorepo**: Turborepo + pnpm workspaces
