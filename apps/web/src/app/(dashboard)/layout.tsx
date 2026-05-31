import { auth, currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { Sidebar } from "@/components/sidebar";
import { prisma } from "@/lib/db";
import type { Plan } from "@easyfetcher/db";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { userId } = await auth();
  if (!userId) redirect("/login");

  const [clerkUser, dbUser] = await Promise.all([
    currentUser(),
    prisma.user.findUnique({
      where: { clerkId: userId },
      include: {
        workspaces: { orderBy: { sortOrder: "asc" } },
        _count: { select: { promptRuns: true } },
      },
    }),
  ]);

  const userName =
    [clerkUser?.firstName, clerkUser?.lastName].filter(Boolean).join(" ") ||
    clerkUser?.emailAddresses[0]?.emailAddress ||
    "User";

  const userEmail = clerkUser?.emailAddresses[0]?.emailAddress ?? "";
  const userImageUrl = clerkUser?.imageUrl ?? "";

  const plan: Plan = dbUser?.plan ?? "FREE";

  // Trial expiry guard — redirect to billing if trial has ended and user hasn't paid
  if (plan === "FREE" && dbUser?.trialEndsAt) {
    const trialExpired = new Date(dbUser.trialEndsAt) < new Date();
    if (trialExpired) {
      // Avoid redirect loop: skip if already on billing page
      const reqHeaders = await headers();
      const pathname = reqHeaders.get("x-invoke-path") ?? reqHeaders.get("next-url") ?? "";
      if (!pathname.includes("/billing")) {
        redirect("/dashboard/billing");
      }
    }
  }

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <Sidebar
        userName={userName}
        userEmail={userEmail}
        userImageUrl={userImageUrl}
        plan={plan}
        mcpCallsUsed={dbUser?._count.promptRuns ?? 0}
      />
      <main className="flex-1 overflow-auto p-6 min-w-0">{children}</main>
    </div>
  );
}

