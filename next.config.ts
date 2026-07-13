import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  typescript: {
    ignoreBuildErrors: true,
  },
  reactStrictMode: false,
  allowedDevOrigins: [
    "preview-chat-8ffd9bff-9755-4117-b81d-2eb40c71e1f7.space-z.ai",
    "*.space-z.ai",
    "preview-21.0.3.58.space-z.ai",
  ],
};

export default nextConfig;
