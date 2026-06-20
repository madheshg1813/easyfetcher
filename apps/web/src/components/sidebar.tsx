"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { Plug2, Sparkles, Terminal, CreditCard, Settings, Sun, Moon, LogOut, Lock } from "lucide-react";
import { useEffect, useState } from "react";
import { useClerk } from "@clerk/nextjs";
import { cn } from "@/lib/utils";
import type { Plan } from "@easyfetcher/db";

const SETUP_NAV = [
  { label: "Connectors", href: "/dashboard/sources", icon: Plug2 },
  { label: "Claude Skills", href: "/dashboard/skills", icon: Sparkles },
  { label: "MCP URL", href: "/dashboard/mcp-config", icon: Terminal },
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
  FREE:       0,
  STARTER:    500,
  PRO:        2000,
  AGENCY:     10000,
  ENTERPRISE: -1,
};

interface SidebarProps {
  userName: string;
  userEmail: string;
  userImageUrl?: string;
  plan: Plan;
  mcpCallsUsed?: number;
  /** True while the user has no plan — everything except billing is locked */
  locked?: boolean;
}

// Routes that stay clickable while the account is locked (no plan yet)
const UNLOCKED_HREFS = ["/dashboard/billing"];

export function Sidebar({ userName, userImageUrl, plan, mcpCallsUsed = 0, locked = false }: SidebarProps) {
  const pathname = usePathname();
  const { signOut } = useClerk();
  const limit = PLAN_LIMITS[plan];
  const isUnlimited = limit === -1;
  const progress = isUnlimited ? 5 : limit === 0 ? 0 : Math.min((mcpCallsUsed / limit) * 100, 100);
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("theme");
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    const dark = saved === "dark" || (!saved && prefersDark);
    document.documentElement.classList.toggle("dark", dark);
    setIsDark(dark);
  }, []);

  const toggleDark = () => {
    const nowDark = document.documentElement.classList.toggle("dark");
    localStorage.setItem("theme", nowDark ? "dark" : "light");
    setIsDark(nowDark);
  };

  return (
    <aside className="w-[220px] h-screen sticky top-0 flex flex-col bg-sidebar border-r border-sidebar-border shrink-0">
      {/* Logo */}
      <div className="flex items-center px-4 h-14 border-b border-sidebar-border">
        <Image
          src="/logo.png"
          alt="EasyFetcher"
          width={130}
          height={36}
          className="h-8 w-auto object-contain"
          priority
        />
      </div>

      {/* Nav */}
      <nav className="flex-1 px-2 py-3 overflow-y-auto space-y-5">
        <NavSection label="Setup" items={SETUP_NAV} pathname={pathname} locked={locked} />
        <NavSection label="Account" items={ACCOUNT_NAV} pathname={pathname} locked={locked} />
        {locked && (
          <p className="px-3 text-[10px] leading-relaxed text-muted-foreground">
            <Lock className="w-3 h-3 inline mr-1 align-[-1px]" />
            Start your free trial to unlock the dashboard.
          </p>
        )}
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
          <button
            onClick={() => signOut({ redirectUrl: "/" })}
            className="p-1 rounded-md text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors shrink-0"
            title="Log out"
          >
            <LogOut className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Plan row + dark mode toggle */}
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-semibold text-primary">{PLAN_LABELS[plan]}</span>
          <div className="flex items-center gap-1">
            <span className="text-[10px] text-muted-foreground">{PLAN_PRICES[plan]}</span>
            <button
              onClick={toggleDark}
              className="p-1 rounded-md text-muted-foreground hover:text-foreground hover:bg-accent transition-colors ml-1"
              aria-label="Toggle dark mode"
            >
              {isDark ? <Sun className="w-3.5 h-3.5" /> : <Moon className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>

        {/* AI queries usage */}
        <div>
          <div className="flex justify-between mb-1">
            <span className="text-[10px] text-muted-foreground">AI queries</span>
            <span className="text-[10px] text-muted-foreground">
              {mcpCallsUsed} / {isUnlimited ? "∞" : limit}
            </span>
          </div>
          <div className="h-1.5 bg-muted rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all ${progress >= 90 ? "bg-destructive" : "bg-primary"}`}
              style={{ width: `${isUnlimited ? 5 : progress}%` }}
            />
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
  locked = false,
}: {
  label: string;
  items: { label: string; href: string; icon: React.ComponentType<{ className?: string }> }[];
  pathname: string;
  locked?: boolean;
}) {
  return (
    <div>
      <p className="px-3 mb-1 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">{label}</p>
      <div className="space-y-0.5">
        {items.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
          const Icon = item.icon;
          const isLocked = locked && !UNLOCKED_HREFS.includes(item.href);

          if (isLocked) {
            return (
              <div
                key={item.href}
                className="flex items-center gap-2.5 px-3 py-2 rounded-md text-sm font-medium text-muted-foreground/50 cursor-not-allowed select-none"
                title="Start your free trial to unlock"
              >
                <Icon className="w-4 h-4 shrink-0" />
                <span className="flex-1">{item.label}</span>
                <Lock className="w-3 h-3 shrink-0" />
              </div>
            );
          }

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
