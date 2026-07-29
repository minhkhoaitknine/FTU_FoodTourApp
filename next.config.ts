import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  allowedDevOrigins: ["100.91.99.2"],
  outputFileTracingIncludes: {
    "/*": ["./music/**/*"]
  },
  reactStrictMode: true
};

export default nextConfig;
