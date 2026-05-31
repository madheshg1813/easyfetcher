import { auth, currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { SettingsClient } from "@/components/settings/settings-client";

export const metadata = { title: "Settings" };

export default async function SettingsPage() {
  const { userId } = await auth();
  if (!userId) redirect("/login");

  const [clerkUser, dbUser] = await Promise.all([
    currentUser(),
    prisma.user.findUnique({
      where: { clerkId: userId },
      include: { workspaces: { orderBy: { sortOrder: "asc" }, take: 1 } },
    }),
  ]);

  const email = clerkUser?.emailAddresses[0]?.emailAddress ?? "";
  const displayName = [clerkUser?.firstName, clerkUser?.lastName].filter(Boolean).join(" ") || "";
  const workspaceName = dbUser?.workspaces[0]?.name ?? "";
  return (
    <div className="space-y-5 max-w-2xl">
      <div>
        <h1 className="text-xl font-semibold text-foreground">Settings</h1>
        <p className="text-sm text-muted-foreground mt-1">Manage your workspace and notifications.</p>
      </div>
      <SettingsClient
        workspaceName={workspaceName}
        email={email}
        displayName={displayName}
      />
    </div>
  );
}
