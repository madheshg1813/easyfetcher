// Server-side Clerk helpers (use in Server Components and API routes)
export { auth, currentUser, clerkClient } from "@clerk/nextjs/server";

// Client-side Clerk helpers (use in Client Components)
export { useAuth, useUser, useClerk, SignIn, SignUp, SignOutButton, UserButton } from "@clerk/nextjs";

// Types
export type { User } from "@clerk/nextjs/server";
