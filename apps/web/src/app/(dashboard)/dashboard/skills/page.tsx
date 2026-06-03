import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { SkillsLibrary } from "@/components/skills/skills-library";

export const metadata = { title: "Claude Skills" };

export default async function SkillsPage() {
  const { userId } = await auth();
  if (!userId) redirect("/login");

  const dbUser = await prisma.user.findUnique({ where: { clerkId: userId } });
  const plan = dbUser?.plan ?? "FREE";
  const apiKey = dbUser?.apiKey ?? "none";

  return (
    <div className="space-y-6 max-w-5xl">
      <div>
        <h1 className="text-xl font-semibold text-foreground">Claude Skills</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Download skills as .md files and use them inside Claude Desktop. Each
          skill is a pre-built AI workflow powered by your connected data
          sources.
        </p>
      </div>
      <SkillsLibrary userPlan={plan} apiKey={apiKey} />
    </div>
  );
}
