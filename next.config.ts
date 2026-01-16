import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'standalone',
  async rewrites() {
    return [
      {
        source: '/usercontent/images/:path*',
        destination: '/api/images/serve/:path*',
      },
    ];
  },
};

export default nextConfig;
