import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "*.ibb.co",
      },
      {
        protocol: "https",
        hostname: "*.ibb.co.com",
      },
    ],
  },
};

export default nextConfig;