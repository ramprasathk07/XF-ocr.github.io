import type { NextConfig } from "next";

const isProd = process.env.NODE_ENV === 'production';

const nextConfig: NextConfig = {
  output: 'export',
  // Replace 'xfinite-ocr' with your actual repository name
  basePath: isProd ? '/xfinite-ocr' : '',
  assetPrefix: isProd ? '/xfinite-ocr/' : '',
  trailingSlash: true,
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
