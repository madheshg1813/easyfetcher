import { redirect } from "next/navigation";

// Redirect to the marketing pricing page — all plan changes happen there via Dodo Payments
export default function PlanPage() {
  redirect("https://easyfetcher.com/pricing");
}
