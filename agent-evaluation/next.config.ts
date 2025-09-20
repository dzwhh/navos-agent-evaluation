import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'tec-matl-obs.tec-do.cn',
        port: '',
        pathname: '/**',
      },
    ],
  },
};

export default nextConfig;
