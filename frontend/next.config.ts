import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Minimal config
  images: {
    unoptimized: true,
  },
  staticPageGenerationTimeout: 300,
  productionBrowserSourceMaps: false,
};

export default nextConfig;

