import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Cloudflare Pages 兼容配置
  // @cloudflare/next-on-pages 需要静态导出图片优化
  images: {
    unoptimized: true,
  },
  // 确保服务端组件正确渲染
  serverExternalPackages: [],
};

export default nextConfig;
