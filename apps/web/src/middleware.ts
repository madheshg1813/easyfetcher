import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

const isPublicRoute = createRouteMatcher([
  "/",
  "/login(.*)",
  "/signup(.*)",
  "/api/favicon(.*)",
  "/api/stripe/webhook",
  "/api/webhooks/clerk",
  "/api/webhooks/dodo",
  // MCP endpoints — public so Claude can connect via Bearer token
  "/api/mcp(.*)",
  "/mcp(.*)",
  // OAuth well-known endpoints
  "/.well-known/(.*)",
  // Google OAuth flow — these must be public (Google redirects to callback, user initiates connect)
  "/api/connect/google",
  "/api/connect/free(.*)",
  "/api/connect/confirm",
  "/api/connect/disconnect(.*)",
  "/api/callback/(.*)",
  "/api/debug-confirm",
  "/api/debug/connections",
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
