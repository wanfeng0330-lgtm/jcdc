import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Cloudflare Pages 兼容配置
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
