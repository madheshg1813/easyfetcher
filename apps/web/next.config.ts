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
};

export default nextConfig;
