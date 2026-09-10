import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Minimal config for Vercel stability
  
  // Image optimization - disable for stability
  images: {
    unoptimized: true,
  },

  // Compression
  compress: true,

  // Static generation timeout - very generous
  staticPageGenerationTimeout: 300,

  // Disable source maps in production
  productionBrowserSourceMaps: false,
};

export default nextConfig;
