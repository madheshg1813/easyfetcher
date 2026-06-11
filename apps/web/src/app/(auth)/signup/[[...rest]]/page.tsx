import { SignUp } from "@clerk/nextjs";
import { Zap } from "lucide-react";
import Link from "next/link";

export const metadata = {
  title: "Sign up",
};

export default function SignUpPage() {
  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-4">
      <div className="mb-8 flex flex-col items-center gap-2">
        <Link href="/" className="flex items-center gap-2">
          <Zap className="w-6 h-6 text-primary" />
          <span className="text-xl font-bold text-primary">EasyFetcher</span>
        </Link>
        <p className="text-sm text-muted-foreground">
          Start your 7-day free trial
        </p>
      </div>
      <SignUp
        forceRedirectUrl="/onboarding"
        appearance={{
          elements: {
            rootBox: "w-full max-w-md",
            card: "shadow-none border border-border bg-card rounded-lg",
            headerTitle: "text-foreground",
            headerSubtitle: "text-muted-foreground",
            formButtonPrimary:
              "bg-primary text-primary-foreground hover:bg-primary/90",
            footerActionLink: "text-primary hover:text-primary/90",
            // Hide Clerk branding badge
            footer: { "& .cl-powered-by-clerk": { display: "none" } },
            internal_poweredByClerk: { display: "none" },
            poweredByClerk: { display: "none" },
          },
        }}
      />
    </div>
  );
}
