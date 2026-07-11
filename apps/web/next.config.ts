import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ["@cyberguard/types", "@cyberguard/shared"],
  devIndicators: false,
};

export default nextConfig;
