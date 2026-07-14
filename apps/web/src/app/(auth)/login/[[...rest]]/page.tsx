import { SignIn } from "@clerk/nextjs";
import Link from "next/link";

export const metadata = {
  title: "Sign in",
};

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-4">
      <div className="mb-8 flex flex-col items-center gap-2">
        <Link href="/" className="flex items-center gap-2">
          <img src="/ef-icon.png" alt="" width={32} height={32} className="w-8 h-8 object-contain" aria-hidden />
          <span className="text-xl font-bold tracking-tight text-foreground">
            Easy <span className="text-amber-500">Fetcher</span>
          </span>
        </Link>
        <p className="text-sm text-muted-foreground">
          Sign in to your account
        </p>
      </div>
      <SignIn
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
