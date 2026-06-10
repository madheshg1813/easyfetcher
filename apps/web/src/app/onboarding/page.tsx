import { auth, currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { PlansClient } from "./plans-client";

export default async function OnboardingPage() {
  const { userId } = await auth();
  if (!userId) redirect("/login");

  const clerkUser = await currentUser();
  const email = clerkUser?.emailAddresses[0]?.emailAddress ?? "";

  return <PlansClient email={email} />;
}
