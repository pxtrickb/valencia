import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
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
