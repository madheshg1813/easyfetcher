"use client";

import { usePathname } from "next/navigation";
import { Bell, Sun, Moon } from "lucide-react";
import { useEffect, useState } from "react";

const routeTitles: Record<string, string> = {
  "/dashboard": "Dashboard",
  "/dashboard/prompts": "Prompt Library",
  "/dashboard/sources": "Data Sources",
  "/dashboard/settings": "Settings",
  "/dashboard/plan": "Plan",
};

function getTitle(pathname: string): string {
  // Exact match first
  if (routeTitles[pathname]) return routeTitles[pathname];
  // Prefix match
  for (const [route, title] of Object.entries(routeTitles)) {
    if (pathname.startsWith(route + "/")) return title;
  }
  return "Dashboard";
}

export function Header() {
  const pathname = usePathname();
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    setIsDark(document.documentElement.classList.contains("dark"));
  }, []);

  const toggleDark = () => {
    const nowDark = document.documentElement.classList.toggle("dark");
    localStorage.setItem("theme", nowDark ? "dark" : "light");
    setIsDark(nowDark);
  };

  const title = getTitle(pathname);

  return (
    <header className="h-14 sticky top-0 z-10 flex items-center justify-between px-6 border-b border-border bg-background/95 backdrop-blur-sm shrink-0">
      <h1 className="text-base font-semibold text-foreground">{title}</h1>
      <div className="flex items-center gap-1">
        <button
          onClick={toggleDark}
          className="p-2 rounded-md text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
          aria-label="Toggle dark mode"
        >
          {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
        </button>
        <button
          className="p-2 rounded-md text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
          aria-label="Notifications"
        >
          <Bell className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
}
