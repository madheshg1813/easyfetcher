import { auth, currentUser } from "@clerk/nextjs/server";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { Sidebar } from "@/components/sidebar";
import { TrialBanner } from "@/components/trial-banner";
import { prisma } from "@/lib/db";
import type { Plan } from "@easyfetcher/db";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { userId } = await auth();
  if (!userId) redirect("/login");

  const [clerkUser, dbUser, headerList] = await Promise.all([
    currentUser(),
    prisma.user.findUnique({
      where: { clerkId: userId },
      include: {
        workspaces: { orderBy: { sortOrder: "asc" } },
        subscription: true,
      },
    }),
    headers(),
  ]);

  const userName =
    [clerkUser?.firstName, clerkUser?.lastName].filter(Boolean).join(" ") ||
    clerkUser?.emailAddresses[0]?.emailAddress ||
    "User";

  const userEmail = clerkUser?.emailAddresses[0]?.emailAddress ?? "";
  const userImageUrl = clerkUser?.imageUrl ?? "";

  const plan: Plan = dbUser?.plan ?? "FREE";

  // Gate: users without a plan can only see the billing page (to start a trial)
  const locked = plan === "FREE";
  const pathname = headerList.get("x-pathname") ?? "";
  if (locked && !pathname.startsWith("/dashboard/billing")) {
    redirect("/dashboard/billing");
  }

  // Trial state for the cross-dashboard banner
  const sub = dbUser?.subscription;
  const now = Date.now();
  const onTrial =
    !locked && sub?.status === "active" && !!sub.trialEnd && sub.trialEnd.getTime() > now;
  const trialDaysLeft = onTrial
    ? Math.max(1, Math.ceil((sub!.trialEnd!.getTime() - now) / (1000 * 60 * 60 * 24)))
    : 0;

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <Sidebar
        userName={userName}
        userEmail={userEmail}
        userImageUrl={userImageUrl}
        plan={plan}
        mcpCallsUsed={dbUser?.mcpCallsUsed ?? 0}
        locked={locked}
      />
      <main className="flex-1 overflow-auto min-w-0">
        {onTrial && (
          <TrialBanner
            daysLeft={trialDaysLeft}
            trialEnd={sub!.trialEnd!.toISOString()}
            cancelScheduled={sub!.cancelAtPeriodEnd}
          />
        )}
        <div className="p-6">{children}</div>
      </main>
    </div>
  );
}
