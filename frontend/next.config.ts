import type { NextConfig } from "next";

const isProd = process.env.NODE_ENV === 'production';

const nextConfig: NextConfig = {
  output: 'export',
  // Strictly following the provided GitHub Pages guide
  basePath: '/XF-ocr.github.io',
  assetPrefix: '/XF-ocr.github.io/',
  trailingSlash: true,
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
