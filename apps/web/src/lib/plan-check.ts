import type { Plan, Platform } from "@easyfetcher/db";

const ALL_PLATFORMS: Platform[] = ["GSC", "GA4", "GOOGLE_ADS", "META_ADS", "REDDIT_ADS", "SHOPIFY", "BING_ADS", "INSTAGRAM", "LINKEDIN_ADS", "GOOGLE_MY_BUSINESS", "TIKTOK_ADS"];

// Which platforms each plan can access
const PLAN_PLATFORMS: Record<Plan, Platform[]> = {
  FREE:       ["GSC"],
  STARTER:    ["GSC", "GA4", "GOOGLE_MY_BUSINESS"],
  PRO:        ALL_PLATFORMS,
  AGENCY:     ALL_PLATFORMS,
  ENTERPRISE: ALL_PLATFORMS,
};

// Max connections per workspace
const WORKSPACE_CONNECTION_LIMITS: Record<Plan, number> = {
  FREE:       1,
  STARTER:    5,
  PRO:        999,
  AGENCY:     999,
  ENTERPRISE: 999,
};

// Max workspaces per user
const WORKSPACE_LIMITS: Record<Plan, number> = {
  FREE:       1,
  STARTER:    1,
  PRO:        3,
  AGENCY:     15,
  ENTERPRISE: 999,
};

export function canConnectPlatform(userPlan: Plan, platform: Platform): boolean {
  return PLAN_PLATFORMS[userPlan].includes(platform);
}

export function getConnectionLimit(userPlan: Plan): number {
  return WORKSPACE_CONNECTION_LIMITS[userPlan];
}

export function getWorkspaceLimit(userPlan: Plan): number {
  return WORKSPACE_LIMITS[userPlan];
}

export function canCreateWorkspace(userPlan: Plan, currentCount: number): boolean {
  return currentCount < WORKSPACE_LIMITS[userPlan];
}

// Which plan is required for a platform
export function requiredPlanForPlatform(platform: Platform): Plan {
  if (platform === "GSC") return "FREE";
  if (["GA4", "GOOGLE_MY_BUSINESS"].includes(platform)) return "STARTER";
  return "PRO";
}

export function checkConnectionAllowed(
  userPlan: Plan,
  platform: Platform,
  currentWorkspaceConnectionCount: number
): { allowed: true } | { allowed: false; reason: string; requiredPlan: Plan } {
  if (!canConnectPlatform(userPlan, platform)) {
    return {
      allowed: false,
      reason: `Your ${userPlan} plan does not support ${platform}`,
      requiredPlan: requiredPlanForPlatform(platform),
    };
  }
  if (currentWorkspaceConnectionCount >= getConnectionLimit(userPlan)) {
    return {
      allowed: false,
      reason: `You've reached the connection limit for your ${userPlan} plan`,
      requiredPlan: userPlan === "FREE" ? "STARTER" : userPlan === "STARTER" ? "PRO" : "AGENCY",
    };
  }
  return { allowed: true };
}
