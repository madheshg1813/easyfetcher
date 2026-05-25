import { redirect } from "next/navigation";

// /dashboard redirects to the main Connectors screen
export default function DashboardPage() {
  redirect("/dashboard/sources");
}
