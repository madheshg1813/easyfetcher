import { auth, currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { PlansClient } from "./plans-client";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://app.easyfetcher.com";

export default async function OnboardingPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const { userId } = await auth();
  if (!userId) redirect("/login");

  const clerkUser = await currentUser();
  const email = clerkUser?.emailAddresses[0]?.emailAddress ?? "";

  // `next` is the URL to redirect to after payment (e.g. OAuth authorize URL)
  // Only allow redirects back to our own app to prevent open redirects
  const params = await searchParams;
  const rawNext = params.next ?? "";
  const safeNext =
    rawNext.startsWith(`${APP_URL}/api/oauth/authorize`)
      ? rawNext
      : `${APP_URL}/dashboard`;

  return <PlansClient email={email} next={safeNext} />;
}
