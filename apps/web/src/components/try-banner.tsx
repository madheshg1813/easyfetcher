import Link from "next/link";
import { Clock } from "lucide-react";

interface TryBannerProps {
  daysLeft: number;
  expiresAt: string; // ISO date
}

export function TryBanner({ daysLeft, expiresAt }: TryBannerProps) {
  const endDate = new Date(expiresAt).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
  });

  return (
    <div className="flex items-center justify-between gap-3 px-6 py-2.5 bg-primary/10 border-b border-primary/20">
      <div className="flex items-center gap-2 text-xs text-foreground">
        <Clock className="w-3.5 h-3.5 text-primary shrink-0" />
        <span>
          <span className="font-semibold">
            Try plan — {daysLeft} {daysLeft === 1 ? "day" : "days"} left.
          </span>{" "}
          Your access expires on {endDate}. Upgrade anytime to keep your data and connections.
        </span>
      </div>
      <Link
        href="/dashboard/billing"
        className="text-xs font-semibold text-primary hover:underline shrink-0"
      >
        Upgrade plan
      </Link>
    </div>
  );
}
