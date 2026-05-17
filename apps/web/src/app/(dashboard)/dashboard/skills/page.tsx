import { SkillsLibrary } from "@/components/skills/skills-library";

export const metadata = { title: "Claude Skills" };

export default function SkillsPage() {
  return (
    <div className="space-y-6 max-w-5xl">
      <div>
        <h1 className="text-xl font-semibold text-foreground">Claude Skills</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Download skills as .skill files and use them inside Claude. 100+ SEO tools, all powered by your connected sources.
        </p>
      </div>
      <SkillsLibrary />
    </div>
  );
}
