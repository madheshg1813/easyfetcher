import { redirect } from "next/navigation";

// Onboarding is no longer needed — users are set up automatically on signup.
export default function OnboardingPage() {
  redirect("/dashboard/sources");
}
