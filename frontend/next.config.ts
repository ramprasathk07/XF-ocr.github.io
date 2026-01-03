import type { NextConfig } from "next";

const isProd = process.env.NODE_ENV === 'production';

const nextConfig: NextConfig = {
  output: 'export',
  // Exactly matching your repository name
  basePath: isProd ? '/XF-ocr.github.io' : '',
  assetPrefix: isProd ? '/XF-ocr.github.io/' : '',
  trailingSlash: true,
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
