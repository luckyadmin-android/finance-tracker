import type { NextConfig } from "next";

const allowedOrigins = process.env.NEXT_PUBLIC_SITE_URL
  ? [process.env.NEXT_PUBLIC_SITE_URL, "localhost:3000"]
  : ["localhost:3000"];

const nextConfig: NextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  experimental: {
    serverActions: { allowedOrigins },
  },
};

export default nextConfig;
