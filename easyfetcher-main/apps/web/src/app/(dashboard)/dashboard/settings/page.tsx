import { auth, currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";

export const metadata = { title: "Settings" };

export default async function SettingsPage() {
  const { userId } = await auth();
  if (!userId) redirect("/login");

  const [clerkUser, dbUser] = await Promise.all([
    currentUser(),
    prisma.user.findUnique({ where: { clerkId: userId } }),
  ]);

  const email = clerkUser?.emailAddresses[0]?.emailAddress ?? "—";
  const name =
    [clerkUser?.firstName, clerkUser?.lastName].filter(Boolean).join(" ") ||
    "—";

  return (
    <div className="space-y-6 max-w-2xl">
      {/* Profile */}
      <section className="rounded-lg border border-border bg-card p-6">
        <h2 className="text-sm font-semibold text-foreground mb-4">Profile</h2>
        <dl className="space-y-3">
          <div className="flex justify-between text-sm">
            <dt className="text-muted-foreground">Name</dt>
            <dd className="text-foreground font-medium">{name}</dd>
          </div>
          <div className="flex justify-between text-sm">
            <dt className="text-muted-foreground">Email</dt>
            <dd className="text-foreground font-medium">{email}</dd>
          </div>
          <div className="flex justify-between text-sm">
            <dt className="text-muted-foreground">Plan</dt>
            <dd className="text-foreground font-medium">{dbUser?.plan ?? "FREE"}</dd>
          </div>
        </dl>
      </section>

      {/* API Key */}
      <section className="rounded-lg border border-border bg-card p-6">
        <h2 className="text-sm font-semibold text-foreground mb-1">API Key</h2>
        <p className="text-xs text-muted-foreground mb-4">
          Use this key to authenticate the EasyFetcher MCP server.
        </p>
        {dbUser?.apiKey ? (
          <div className="flex items-center gap-2">
            <code className="flex-1 text-xs bg-muted px-3 py-2 rounded-md font-mono text-foreground truncate">
              {dbUser.apiKey}
            </code>
          </div>
        ) : (
          <p className="text-xs text-muted-foreground">
            API key will be generated after account setup completes.
          </p>
        )}
      </section>

      {/* Danger zone */}
      <section className="rounded-lg border border-destructive/30 bg-card p-6">
        <h2 className="text-sm font-semibold text-destructive mb-1">
          Danger Zone
        </h2>
        <p className="text-xs text-muted-foreground mb-4">
          Permanently delete your account and all associated data.
        </p>
        <button
          disabled
          className="px-4 py-2 rounded-md border border-destructive/40 text-destructive text-sm font-medium opacity-50 cursor-not-allowed"
        >
          Delete account
        </button>
      </section>
    </div>
  );
}
