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
  
  // Disable ESLint during build
  eslint: {
    ignoreDuringBuilds: true,
  },
  
  // Experimental features
  experimental: {
    // turbo: false, // Disable turbopack if causing issues
  },
};

export default nextConfig;

