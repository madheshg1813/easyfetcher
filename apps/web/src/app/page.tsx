import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

export default async function HomePage() {
  const { userId } = await auth();
  // Authenticated users go straight to the dashboard
  if (userId) redirect("/dashboard");
  // Everyone else → sign in / sign up
  redirect("/login");
}
