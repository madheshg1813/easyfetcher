"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Zap, Briefcase, Users, ArrowRight, Loader2, Globe } from "lucide-react";
import Image from "next/image";

type Role = "solo" | "agency";

const roles = [
  {
    id: "solo" as Role,
    icon: Briefcase,
    title: "I manage my own business",
    subtitle: "Solo marketer or business owner tracking one brand",
  },
  {
    id: "agency" as Role,
    icon: Users,
    title: "I manage multiple clients",
    subtitle: "Agency owner or freelancer handling several brands",
  },
];

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState<1 | 2>(1);
  const [role, setRole] = useState<Role | null>(null);
  const [workspaceName, setWorkspaceName] = useState("");
  const [websiteUrl, setWebsiteUrl] = useState("");
  const [faviconUrl, setFaviconUrl] = useState<string | null>(null);
  const [fetchingFavicon, setFetchingFavicon] = useState(false);
  const [isPending, startTransition] = useTransition();

  async function fetchFavicon(url: string) {
    if (!url.trim()) return;
    setFetchingFavicon(true);
    try {
      const res = await fetch(`/api/favicon?url=${encodeURIComponent(url)}`);
      const data = await res.json();
      if (data.faviconUrl) setFaviconUrl(data.faviconUrl);
      else setFaviconUrl(null);
    } catch {
      setFaviconUrl(null);
    } finally {
      setFetchingFavicon(false);
    }
  }

  function handleUrlBlur() {
    if (websiteUrl.trim()) fetchFavicon(websiteUrl);
  }

  async function handleFinish() {
    if (!workspaceName.trim()) return;

    startTransition(async () => {
      await fetch("/api/onboarding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ workspaceName, websiteUrl, faviconUrl }),
      });
      router.push("/dashboard/sources");
    });
  }

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6">
      {/* Logo */}
      <div className="flex items-center gap-2 mb-12">
        <Zap className="w-6 h-6 text-primary" />
        <span className="font-bold text-xl text-primary">EasyFetcher</span>
      </div>

      {/* Progress */}
      <div className="flex gap-2 mb-10">
        {[1, 2].map((s) => (
          <div
            key={s}
            className={`h-1 w-16 rounded-full transition-colors ${
              s <= step ? "bg-primary" : "bg-muted"
            }`}
          />
        ))}
      </div>

      <div className="w-full max-w-lg">
        {/* ── Step 1: Role ─────────────────────────────────── */}
        {step === 1 && (
          <div>
            <h1 className="text-2xl font-bold text-foreground text-center mb-2">
              What brings you to EasyFetcher?
            </h1>
            <p className="text-sm text-muted-foreground text-center mb-8">
              We&apos;ll set up the right experience for you.
            </p>

            <div className="space-y-3">
              {roles.map((r) => {
                const Icon = r.icon;
                return (
                  <button
                    key={r.id}
                    onClick={() => {
                      setRole(r.id);
                      setStep(2);
                    }}
                    className={`w-full flex items-center gap-4 p-4 rounded-xl border-2 text-left transition-all hover:border-primary hover:bg-accent/30 ${
                      role === r.id
                        ? "border-primary bg-accent/40"
                        : "border-border bg-card"
                    }`}
                  >
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                      <Icon className="w-5 h-5 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-foreground text-sm">{r.title}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">{r.subtitle}</p>
                    </div>
                    <ArrowRight className="w-4 h-4 text-muted-foreground shrink-0" />
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* ── Step 2: Workspace setup ───────────────────────── */}
        {step === 2 && (
          <div>
            <h1 className="text-2xl font-bold text-foreground text-center mb-2">
              {role === "agency" ? "Set up your first client" : "Set up your workspace"}
            </h1>
            <p className="text-sm text-muted-foreground text-center mb-8">
              {role === "agency"
                ? "You can add more clients later from the sidebar."
                : "This is your brand inside EasyFetcher."}
            </p>

            <div className="bg-card border border-border rounded-2xl p-6 space-y-5">
              {/* Favicon preview + name row */}
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-xl border-2 border-border bg-muted flex items-center justify-center shrink-0 overflow-hidden">
                  {fetchingFavicon ? (
                    <Loader2 className="w-5 h-5 text-muted-foreground animate-spin" />
                  ) : faviconUrl ? (
                    <Image src={faviconUrl} alt="favicon" width={40} height={40} className="object-contain" unoptimized />
                  ) : (
                    <Globe className="w-6 h-6 text-muted-foreground" />
                  )}
                </div>
                <div className="flex-1">
                  <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    {role === "agency" ? "Client name" : "Business name"}
                  </label>
                  <input
                    autoFocus
                    value={workspaceName}
                    onChange={(e) => setWorkspaceName(e.target.value)}
                    placeholder={role === "agency" ? "e.g. Acme Corp" : "e.g. My Business"}
                    className="mt-1 w-full bg-transparent text-foreground text-base font-medium outline-none placeholder:text-muted-foreground/50 border-b border-input pb-1 focus:border-primary transition-colors"
                  />
                </div>
              </div>

              {/* Website URL */}
              <div>
                <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Website URL <span className="normal-case font-normal">(optional — we&apos;ll grab your favicon)</span>
                </label>
                <div className="mt-1.5 flex items-center gap-2 border border-input rounded-lg px-3 py-2.5 bg-background focus-within:ring-1 focus-within:ring-primary focus-within:border-primary transition-all">
                  <Globe className="w-4 h-4 text-muted-foreground shrink-0" />
                  <input
                    value={websiteUrl}
                    onChange={(e) => setWebsiteUrl(e.target.value)}
                    onBlur={handleUrlBlur}
                    placeholder="yourwebsite.com"
                    className="flex-1 bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground/50"
                  />
                  {fetchingFavicon && <Loader2 className="w-3.5 h-3.5 text-muted-foreground animate-spin shrink-0" />}
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-between mt-6">
              <button
                onClick={() => setStep(1)}
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                ← Back
              </button>
              <button
                onClick={handleFinish}
                disabled={!workspaceName.trim() || isPending}
                className="flex items-center gap-2 px-6 py-2.5 bg-primary text-primary-foreground rounded-lg text-sm font-semibold disabled:opacity-50 disabled:cursor-not-allowed hover:opacity-90 transition-opacity"
              >
                {isPending ? (
                  <><Loader2 className="w-4 h-4 animate-spin" /> Setting up...</>
                ) : (
                  <>Get started <ArrowRight className="w-4 h-4" /></>
                )}
              </button>
            </div>

            <p className="text-center text-xs text-muted-foreground mt-5">
              You&apos;ll connect your data sources next — takes 30 seconds.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
