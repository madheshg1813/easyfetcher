import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ["@easyfetcher/db", "@easyfetcher/auth", "@easyfetcher/ui"],
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "img.clerk.com",
      },
    ],
  },
  async rewrites() {
    return [
      // Clean MCP URL: mcp.easyfetcher.com/mcp → /api/mcp
      {
        source: "/mcp",
        destination: "/api/mcp",
      },
      {
        source: "/mcp/:path*",
        destination: "/api/mcp/:path*",
      },
    ];
  },
};

export default nextConfig;
