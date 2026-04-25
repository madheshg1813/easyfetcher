import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

const isPublicRoute = createRouteMatcher([
  "/",
  "/login(.*)",
  "/signup(.*)",
  "/onboarding(.*)",
  "/api/onboarding(.*)",
  "/api/favicon(.*)",
  "/api/stripe/webhook",
  "/api/webhooks/clerk",
  // MCP + OAuth endpoints — must be public so Claude can connect
  "/api/mcp(.*)",
  "/api/oauth/(.*)",
  "/api/callback/(.*)",
  "/api/connect/(.*)",
  "/.well-known/(.*)",
]);

export default clerkMiddleware(async (auth, request) => {
  if (!isPublicRoute(request)) {
    await auth.protect();
  }
});

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};
