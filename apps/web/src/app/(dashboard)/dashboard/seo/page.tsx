import { SeoFeaturesSection } from "@/components/sources/seo-features-section";

export const metadata = { title: "SEO Features" };

export default function SeoPage() {
  return (
    <div className="space-y-6 max-w-5xl">
      <div>
        <h1 className="text-xl font-semibold text-foreground">SEO Features</h1>
        <p className="text-sm text-muted-foreground mt-1">
          AI-powered SEO tools built into your Claude connection — use them by chatting with Claude.
        </p>
      </div>
      <SeoFeaturesSection />
    </div>
  );
}
