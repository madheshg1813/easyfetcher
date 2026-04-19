import { prisma } from "@/lib/db";

export type UserWithWorkspaces = NonNullable<Awaited<ReturnType<typeof getUser>>>;
export type Connection = UserWithWorkspaces["workspaces"][0]["connections"][0];
export type TextFn = (t: string) => { content: { type: string; text: string }[] };

async function getUser() {
  return prisma.user.findFirst({
    where: { apiKey: "placeholder" },
    include: {
      workspaces: {
        orderBy: { sortOrder: "asc" },
        include: { connections: { where: { status: "CONNECTED" } } },
      },
    },
  });
}

export interface McpTool {
  name: string;
  description: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  inputSchema: Record<string, any>;
}
