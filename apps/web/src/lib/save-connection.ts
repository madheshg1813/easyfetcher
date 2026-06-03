import { prisma } from "@/lib/db";
import type { Platform } from "@easyfetcher/db";

/**
 * Upsert a single OAuth Connection record.
 * Handles null workspaceId correctly (Prisma compound-unique requires non-null fields).
 */
export async function saveConnection(
  dbUserId: string,
  workspaceId: string | null,
  platform: Platform,
  accessToken: string,    // AES-256 encrypted
  refreshToken: string | null,
  tokenExpiry: Date | null,
  userEmail: string | null,
  siteUrl: string,
  label: string,
): Promise<void> {
  if (workspaceId) {
    await prisma.connection.upsert({
      where: {
        workspaceId_platform_siteUrl: { workspaceId, platform, siteUrl },
      },
      create: {
        userId: dbUserId,
        workspaceId,
        platform,
        accessToken,
        refreshToken,
        expiresAt: tokenExpiry,
        status: "CONNECTED",
        siteUrl,
        label,
        metadata: { email: userEmail },
      },
      update: {
        accessToken,
        refreshToken: refreshToken ?? undefined,
        expiresAt: tokenExpiry,
        status: "CONNECTED",
        label,
        metadata: { email: userEmail },
      },
    });
  } else {
    // workspaceId is null — Prisma compound-unique key can't be used with null fields
    const existing = await prisma.connection.findFirst({
      where: { userId: dbUserId, platform, siteUrl, workspaceId: null },
    });
    if (existing) {
      await prisma.connection.update({
        where: { id: existing.id },
        data: {
          accessToken,
          refreshToken: refreshToken ?? undefined,
          expiresAt: tokenExpiry,
          status: "CONNECTED",
          label,
          metadata: { email: userEmail },
        },
      });
    } else {
      await prisma.connection.create({
        data: {
          userId: dbUserId,
          workspaceId: null,
          platform,
          accessToken,
          refreshToken,
          expiresAt: tokenExpiry,
          status: "CONNECTED",
          siteUrl,
          label,
          metadata: { email: userEmail },
        },
      });
    }
  }

  await prisma.activityLog.create({
    data: {
      userId: dbUserId,
      type: "CONNECTED",
      message: `Connected ${platform} (${label})`,
      metadata: { platform, siteUrl, workspaceId },
    },
  });
}
