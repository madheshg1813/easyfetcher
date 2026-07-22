import type { Plan, Platform } from "@easyfetcher/db";

const ALL_PLATFORMS: Platform[] = ["GSC", "GA4", "GOOGLE_ADS", "META_ADS", "REDDIT_ADS", "SHOPIFY", "BING_ADS", "INSTAGRAM", "LINKEDIN_ADS", "TIKTOK_ADS"];

// Which platforms each plan can access
const PLAN_PLATFORMS: Record<Plan, Platform[]> = {
  FREE:       ["GSC"],
  TRY:        ["GSC", "GA4"],
  STARTER:    ["GSC", "GA4"],
  PRO:        ALL_PLATFORMS,
  AGENCY:     ALL_PLATFORMS,
  ENTERPRISE: ALL_PLATFORMS,
};

// Max connections per workspace
const WORKSPACE_CONNECTION_LIMITS: Record<Plan, number> = {
  FREE:       1,
  TRY:        5,
  STARTER:    5,
  PRO:        999,
  AGENCY:     999,
  ENTERPRISE: 999,
};

// Max workspaces per user
const WORKSPACE_LIMITS: Record<Plan, number> = {
  FREE:       1,
  TRY:        1,
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

// Monthly MCP call limits per plan (-1 = unlimited)
export const MCP_CALL_LIMITS: Record<Plan, number> = {
  FREE:       0,
  TRY:        75,
  STARTER:    500,
  PRO:        2000,
  AGENCY:     10000,
  ENTERPRISE: -1,
};

export function getMcpCallLimit(plan: Plan): number {
  return MCP_CALL_LIMITS[plan];
}

// Which plan is required for a platform
export function requiredPlanForPlatform(platform: Platform): Plan {
  if (platform === "GSC") return "FREE";
  if (["GA4"].includes(platform)) return "TRY";
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
      requiredPlan: userPlan === "FREE" || userPlan === "TRY" ? "STARTER" : userPlan === "STARTER" ? "PRO" : "AGENCY",
    };
  }
  return { allowed: true };
}
