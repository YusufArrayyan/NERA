import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Minimal config for Render deployment
  images: {
    unoptimized: true,
  },
  staticPageGenerationTimeout: 300,
  productionBrowserSourceMaps: false,
  
  // Disable strict type checking during build
  typescript: {
    ignoreBuildErrors: true,
  },
  
  // Empty turbopack config to silence warning
  turbopack: {},
};

export default nextConfig;

