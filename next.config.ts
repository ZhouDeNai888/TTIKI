import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  // allowedDevOrigins: ["local-origin.dev", "*.local-origin.dev"],
  images: {
    domains: [
      "192.168.1.31",
      "localhost",
      "lh3.googleusercontent.com",
      "profile.line-scdn.net",
    ],

    minimumCacheTTL: 60 * 60, // cache 1 ชั่วโมง
  },
};

export default nextConfig;
