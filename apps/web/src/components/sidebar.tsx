"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  BookOpen,
  Database,
  Settings,
  CreditCard,
  Zap,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { WorkspaceSwitcher } from "@/components/workspace-switcher";
import type { Plan } from "@easyfetcher/db";

const navItems = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard, exact: true },
  { label: "Prompt Library", href: "/dashboard/prompts", icon: BookOpen, exact: false },
  { label: "Data Sources", href: "/dashboard/sources", icon: Database, exact: false },
  { label: "Settings", href: "/dashboard/settings", icon: Settings, exact: false },
  { label: "Plan", href: "/dashboard/plan", icon: CreditCard, exact: false },
];

interface Workspace {
  id: string;
  name: string;
  slug: string;
  isDefault: boolean;
  faviconUrl?: string | null;
  websiteUrl?: string | null;
}

interface SidebarProps {
  userName: string;
  userEmail: string;
  userImageUrl?: string;
  plan: Plan;
  workspaces: Workspace[];
  activeWorkspaceId: string | null;
}

export function Sidebar({ userName, userEmail: _userEmail, userImageUrl, plan, workspaces, activeWorkspaceId }: SidebarProps) {
  const pathname = usePathname();
  const showSwitcher = workspaces.length >= 1;

  return (
    <aside className="w-[220px] h-screen sticky top-0 flex flex-col bg-sidebar border-r border-sidebar-border shrink-0">
      {/* Logo */}
      <div className="flex items-center gap-2 px-4 h-14 border-b border-sidebar-border">
        <Zap className="w-5 h-5 text-primary shrink-0" />
        <span className="font-bold text-primary text-base">EasyFetcher</span>
      </div>

      {/* Workspace switcher */}
      {showSwitcher && (
        <div className="pt-3 pb-1">
          <p className="px-5 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-1">Workspace</p>
          <WorkspaceSwitcher workspaces={workspaces} activeWorkspaceId={activeWorkspaceId} plan={plan} />
        </div>
      )}

      {/* Nav */}
      <nav className="flex-1 px-2 py-2 space-y-0.5 overflow-y-auto">
        {navItems.map((item) => {
          const isActive = item.exact
            ? pathname === item.href
            : pathname === item.href || pathname.startsWith(item.href + "/");
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors",
                isActive
                  ? "bg-accent text-accent-foreground"
                  : "text-sidebar-foreground hover:bg-accent/60 hover:text-accent-foreground"
              )}
            >
              <Icon className="w-4 h-4 shrink-0" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* User footer */}
      <div className="px-3 py-3 border-t border-sidebar-border">
        <div className="flex items-center gap-2.5">
          {userImageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={userImageUrl}
              alt={userName}
              className="w-8 h-8 rounded-full shrink-0 object-cover"
            />
          ) : (
            <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
              <span className="text-xs font-semibold text-primary">
                {userName.charAt(0).toUpperCase()}
              </span>
            </div>
          )}
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium text-sidebar-foreground truncate">
              {userName}
            </p>
            <span
              className={cn(
                "inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold mt-0.5",
                plan === "FREE"
                  ? "bg-primary/15 text-primary"
                  : plan === "STARTER"
                    ? "bg-blue-500/20 text-blue-600 dark:text-blue-400"
                    : plan === "PRO"
                      ? "bg-amber-500/20 text-amber-600 dark:text-amber-400"
                      : "bg-purple-500/20 text-purple-600 dark:text-purple-400"
              )}
            >
              {plan}
            </span>
          </div>
        </div>
      </div>
    </aside>
  );
}
