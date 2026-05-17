"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Zap, Plug2, Sparkles, Terminal, CreditCard, Settings } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Plan } from "@easyfetcher/db";

const SETUP_NAV = [
  { label: "Connectors", href: "/dashboard/sources", icon: Plug2 },
  { label: "Claude Skills", href: "/dashboard/skills", icon: Sparkles },
  { label: "MCP config", href: "/dashboard/mcp-config", icon: Terminal },
];

const ACCOUNT_NAV = [
  { label: "Usage & billing", href: "/dashboard/billing", icon: CreditCard },
  { label: "Settings", href: "/dashboard/settings", icon: Settings },
];

const PLAN_LABELS: Record<Plan, string> = {
  FREE: "Free plan",
  STARTER: "Starter plan",
  PRO: "Pro plan",
  AGENCY: "Agency plan",
  ENTERPRISE: "Enterprise",
};

const PLAN_PRICES: Record<Plan, string> = {
  FREE: "Free",
  STARTER: "$7/mo",
  PRO: "$12/mo",
  AGENCY: "$67/mo",
  ENTERPRISE: "Custom",
};

const PLAN_LIMITS: Record<Plan, number> = {
  FREE: 50,
  STARTER: 1000,
  PRO: 50,
  AGENCY: 200,
  ENTERPRISE: 9999,
};

interface SidebarProps {
  userName: string;
  userEmail: string;
  userImageUrl?: string;
  plan: Plan;
  mcpCallsUsed?: number;
}

export function Sidebar({ userName, userImageUrl, plan, mcpCallsUsed = 0 }: SidebarProps) {
  const pathname = usePathname();
  const limit = PLAN_LIMITS[plan];
  const progress = Math.min((mcpCallsUsed / limit) * 100, 100);

  return (
    <aside className="w-[220px] h-screen sticky top-0 flex flex-col bg-sidebar border-r border-sidebar-border shrink-0">
      {/* Logo */}
      <div className="flex items-center gap-2.5 px-4 h-14 border-b border-sidebar-border">
        <div className="w-7 h-7 rounded-lg bg-primary flex items-center justify-center shrink-0">
          <Zap className="w-4 h-4 text-primary-foreground" />
        </div>
        <div className="min-w-0">
          <p className="font-bold text-foreground text-sm leading-tight">EasyFetcher</p>
          <p className="text-[10px] text-muted-foreground leading-tight truncate">MCP connector hub</p>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-2 py-3 overflow-y-auto space-y-5">
        <NavSection label="Setup" items={SETUP_NAV} pathname={pathname} />
        <NavSection label="Account" items={ACCOUNT_NAV} pathname={pathname} />
      </nav>

      {/* Bottom */}
      <div className="px-3 py-3 border-t border-sidebar-border space-y-2.5">
        {/* User */}
        <div className="flex items-center gap-2">
          {userImageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={userImageUrl} alt={userName} className="w-7 h-7 rounded-full shrink-0 object-cover" />
          ) : (
            <div className="w-7 h-7 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
              <span className="text-[11px] font-semibold text-primary">{userName.charAt(0).toUpperCase()}</span>
            </div>
          )}
          <p className="text-xs font-medium text-sidebar-foreground truncate flex-1">{userName}</p>
        </div>

        {/* Plan row */}
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-semibold text-primary">{PLAN_LABELS[plan]}</span>
          <span className="text-[10px] text-muted-foreground">{PLAN_PRICES[plan]}</span>
        </div>

        {/* MCP calls */}
        <div>
          <div className="flex justify-between mb-1">
            <span className="text-[10px] text-muted-foreground">MCP calls</span>
            <span className="text-[10px] text-muted-foreground">{mcpCallsUsed} / {limit}</span>
          </div>
          <div className="h-1.5 bg-muted rounded-full overflow-hidden">
            <div className="h-full bg-primary rounded-full" style={{ width: `${progress}%` }} />
          </div>
        </div>
      </div>
    </aside>
  );
}

function NavSection({
  label,
  items,
  pathname,
}: {
  label: string;
  items: { label: string; href: string; icon: React.ComponentType<{ className?: string }> }[];
  pathname: string;
}) {
  return (
    <div>
      <p className="px-3 mb-1 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">{label}</p>
      <div className="space-y-0.5">
        {items.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-2.5 px-3 py-2 rounded-md text-sm font-medium transition-colors",
                isActive
                  ? "bg-primary/15 text-primary"
                  : "text-sidebar-foreground hover:bg-accent/60 hover:text-accent-foreground"
              )}
            >
              <Icon className="w-4 h-4 shrink-0" />
              {item.label}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
