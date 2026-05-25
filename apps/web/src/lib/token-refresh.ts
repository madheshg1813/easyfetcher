import { google } from "googleapis";
import { prisma } from "@/lib/db";
import { encrypt, decrypt } from "@easyfetcher/db";
import type { Connection } from "@easyfetcher/db";

const REFRESH_BUFFER_MS = 5 * 60 * 1000; // 5 minutes

export function isTokenExpiringSoon(connection: Connection): boolean {
  if (!connection.expiresAt) return false;
  return connection.expiresAt.getTime() - Date.now() < REFRESH_BUFFER_MS;
}

export async function refreshGoogleToken(connection: Connection): Promise<Connection> {
  if (!connection.refreshToken) {
    throw new Error("No refresh token available for connection " + connection.id);
  }

  const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URI
  );

  const decryptedRefresh = decrypt(connection.refreshToken);
  oauth2Client.setCredentials({ refresh_token: decryptedRefresh });

  const { credentials } = await oauth2Client.refreshAccessToken();
  const { access_token, expiry_date, refresh_token } = credentials;

  if (!access_token) throw new Error("Failed to refresh token — no access_token returned");

  const updated = await prisma.connection.update({
    where: { id: connection.id },
    data: {
      accessToken: encrypt(access_token),
      refreshToken: refresh_token ? encrypt(refresh_token) : connection.refreshToken,
      expiresAt: expiry_date ? new Date(expiry_date) : null,
      status: "CONNECTED",
    },
  });

  // Log the refresh
  await prisma.activityLog.create({
    data: {
      userId: connection.userId,
      type: "TOKEN_REFRESH",
      message: `${connection.platform} token refreshed automatically`,
      metadata: { platform: connection.platform, connectionId: connection.id },
    },
  });

  return updated;
}

// Get a live OAuth2 client for a connection, refreshing if needed
export async function getGoogleAuthClient(connection: Connection) {
  let conn = connection;
  if (isTokenExpiringSoon(conn)) {
    conn = await refreshGoogleToken(conn);
  }

  const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URI
  );

  oauth2Client.setCredentials({
    access_token: decrypt(conn.accessToken),
    refresh_token: conn.refreshToken ? decrypt(conn.refreshToken) : undefined,
  });

  return oauth2Client;
}
