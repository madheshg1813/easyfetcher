import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log:
      process.env.NODE_ENV === "development"
        ? ["query", "error", "warn"]
        : ["error"],
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

export * from "@prisma/client";
// Explicit re-exports so IDEs resolve these types without traversing the Prisma re-export chain
export type {
  Platform,
  Plan,
  ConnectionStatus,
  User,
  Workspace,
  Connection,
  PendingConnection,
} from "@prisma/client";
export { encrypt, decrypt } from "./crypto";
