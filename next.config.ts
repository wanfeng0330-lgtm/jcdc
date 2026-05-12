import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Cloudflare Pages 兼容配置
  // @cloudflare/next-on-pages 需要静态导出图片优化
  images: {
    unoptimized: true,
  },
  // 强制所有服务端路由使用 Edge Runtime (Cloudflare Workers 要求)
  experimental: {
    runtime: 'edge',
  },
};

export default nextConfig;
