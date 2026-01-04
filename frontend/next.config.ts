import type { NextConfig } from "next";

const isProd = process.env.NODE_ENV === 'production';

const nextConfig: NextConfig = {
  output: 'export',
  // Strictly following the provided GitHub Pages guide
  basePath: isProd ? '/XF-ocr.github.io' : undefined,
  assetPrefix: isProd ? '/XF-ocr.github.io/' : undefined,
  trailingSlash: true,
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
