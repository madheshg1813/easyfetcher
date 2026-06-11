import Link from "next/link";
import { Clock, XCircle } from "lucide-react";

interface TrialBannerProps {
  daysLeft: number;
  trialEnd: string; // ISO date
  cancelScheduled: boolean;
}

export function TrialBanner({ daysLeft, trialEnd, cancelScheduled }: TrialBannerProps) {
  const endDate = new Date(trialEnd).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
  });

  if (cancelScheduled) {
    return (
      <div className="flex items-center justify-between gap-3 px-6 py-2.5 bg-muted border-b border-border">
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <XCircle className="w-3.5 h-3.5 shrink-0" />
          <span>
            Trial cancelled — you won&apos;t be charged. Access ends on{" "}
            <span className="font-semibold text-foreground">{endDate}</span>.
          </span>
        </div>
        <Link
          href="/dashboard/billing"
          className="text-xs font-semibold text-primary hover:underline shrink-0"
        >
          Manage billing
        </Link>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-between gap-3 px-6 py-2.5 bg-primary/10 border-b border-primary/20">
      <div className="flex items-center gap-2 text-xs text-foreground">
        <Clock className="w-3.5 h-3.5 text-primary shrink-0" />
        <span>
          <span className="font-semibold">
            Free trial — {daysLeft} {daysLeft === 1 ? "day" : "days"} left.
          </span>{" "}
          Your first charge is on {endDate}. Cancel anytime before then and pay nothing.
        </span>
      </div>
      <Link
        href="/dashboard/billing"
        className="text-xs font-semibold text-primary hover:underline shrink-0"
      >
        Manage trial
      </Link>
    </div>
  );
}
