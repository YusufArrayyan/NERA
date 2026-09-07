import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* Disable lightningcss for Vercel compatibility */
  experimental: {
    optimizePackageImports: ["@tailwindcss/postcss"],
  },
  /* Use SWC instead of lightningcss */
  swcMinify: true,
};

export default nextConfig;
