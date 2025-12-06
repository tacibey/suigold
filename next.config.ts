import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'export', // BU SATIR HAYATİ ÖNEM TAŞIYOR
  images: {
    unoptimized: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;