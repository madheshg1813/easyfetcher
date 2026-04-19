import { auth, currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { Sidebar } from "@/components/sidebar";
import { Header } from "@/components/header";
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
      include: { workspaces: { orderBy: { sortOrder: "asc" } } },
    }),
  ]);

  const userName =
    [clerkUser?.firstName, clerkUser?.lastName].filter(Boolean).join(" ") ||
    clerkUser?.emailAddresses[0]?.emailAddress ||
    "User";

  const userEmail = clerkUser?.emailAddresses[0]?.emailAddress ?? "";
  const userImageUrl = clerkUser?.imageUrl ?? "";
  // Redirect to onboarding if not completed yet
  if (dbUser && !dbUser.onboarded) {
    redirect("/onboarding");
  }

  const plan: Plan = dbUser?.plan ?? "FREE";
  const workspaces = dbUser?.workspaces ?? [];
  const activeWorkspaceId = dbUser?.activeWorkspaceId ?? workspaces[0]?.id ?? null;

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <Sidebar
        userName={userName}
        userEmail={userEmail}
        userImageUrl={userImageUrl}
        plan={plan}
        workspaces={workspaces}
        activeWorkspaceId={activeWorkspaceId}
      />
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        <Header />
        <main className="flex-1 overflow-auto p-6">{children}</main>
      </div>
    </div>
  );
}
