import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import type { Plan, PromptCategory } from "@easyfetcher/db";

const categoryLabels: Record<PromptCategory, string> = {
  SEO: "SEO",
  ANALYTICS: "Analytics",
  PAID_ADS: "Paid Ads",
  SOCIAL: "Social",
  ECOMMERCE: "E-commerce",
};

const planBadgeStyles: Record<Plan, string> = {
  FREE: "bg-green-500/15 text-green-600 dark:text-green-400",
  STARTER: "bg-blue-500/20 text-blue-600 dark:text-blue-400",
  PRO: "bg-amber-500/20 text-amber-600 dark:text-amber-400",
  AGENCY: "bg-purple-500/20 text-purple-600 dark:text-purple-400",
  ENTERPRISE: "bg-blue-500/20 text-blue-600 dark:text-blue-400",
};

export const metadata = { title: "Prompt Library" };

export default async function PromptsPage() {
  const { userId } = await auth();
  if (!userId) redirect("/login");

  const [dbUser, prompts] = await Promise.all([
    prisma.user.findUnique({ where: { clerkId: userId } }),
    prisma.prompt.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: "asc" },
    }),
  ]);

  const userPlan: Plan = dbUser?.plan ?? "FREE";
  const planOrder: Plan[] = ["FREE", "STARTER", "PRO", "AGENCY", "ENTERPRISE"];
  const userPlanIndex = planOrder.indexOf(userPlan);

  const grouped = prompts.reduce(
    (acc, prompt) => {
      const cat = prompt.category as PromptCategory;
      if (!acc[cat]) acc[cat] = [];
      acc[cat].push(prompt);
      return acc;
    },
    {} as Record<PromptCategory, typeof prompts>
  );

  return (
    <div className="space-y-8 max-w-4xl">
      <div>
        <p className="text-sm text-muted-foreground">
          {prompts.length} templates across {Object.keys(grouped).length}{" "}
          categories
        </p>
      </div>

      {(Object.entries(grouped) as [PromptCategory, typeof prompts][]).map(
        ([category, categoryPrompts]) => (
          <section key={category}>
            <h2 className="text-sm font-semibold text-foreground mb-3 uppercase tracking-wider text-muted-foreground">
              {categoryLabels[category]}
            </h2>
            <div className="space-y-2">
              {categoryPrompts.map((prompt) => {
                const promptPlanIndex = planOrder.indexOf(
                  prompt.requiredPlan as Plan
                );
                const locked = promptPlanIndex > userPlanIndex;

                return (
                  <div
                    key={prompt.id}
                    className={`rounded-lg border border-border bg-card p-4 ${locked ? "opacity-60" : ""}`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="text-sm font-medium text-foreground">
                            {prompt.title}
                          </h3>
                          {locked && (
                            <span className="text-xs text-muted-foreground">
                              🔒
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground line-clamp-2">
                          {prompt.description}
                        </p>
                        <div className="flex items-center gap-2 mt-2">
                          {(prompt.requiredSources as string[]).map((src) => (
                            <span
                              key={src}
                              className="text-[10px] px-1.5 py-0.5 rounded bg-muted text-muted-foreground font-medium"
                            >
                              {src}
                            </span>
                          ))}
                        </div>
                      </div>
                      <span
                        className={`shrink-0 text-[10px] px-2 py-0.5 rounded font-semibold ${planBadgeStyles[prompt.requiredPlan as Plan]}`}
                      >
                        {prompt.requiredPlan}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        )
      )}
    </div>
  );
}
