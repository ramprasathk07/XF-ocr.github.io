import type { NextConfig } from "next";

const isProd = process.env.NODE_ENV === 'production';

const nextConfig: NextConfig = {
  output: 'export',
  // Strictly following the provided GitHub Pages guide
  basePath: process.env.NEXT_PUBLIC_BASE_PATH || (isProd ? '/XF-ocr.github.io' : undefined),
  assetPrefix: process.env.NEXT_PUBLIC_BASE_PATH ? `${process.env.NEXT_PUBLIC_BASE_PATH}/` : (isProd ? '/XF-ocr.github.io/' : undefined),
  trailingSlash: true,
};

export default nextConfig;
