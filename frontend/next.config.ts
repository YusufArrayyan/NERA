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
  
  // Webpack configuration to handle build errors
  webpack: (config, { isServer }) => {
    // Ignore specific modules that cause issues
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      net: false,
      tls: false,
    };
    
    return config;
  },
};

export default nextConfig;

