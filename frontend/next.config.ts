import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* Optimize for Vercel */
  experimental: {
    optimizePackageImports: ["@tailwindcss/postcss"],
  },
};

export default nextConfig;
