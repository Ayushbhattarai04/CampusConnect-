import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  allowedDevOrigins: [
    "http://localhost:3000",
    "http://localhost:3001",
    "http://localhost:3002",
    "http://192.168.56.1:3000",
    "http://192.168.56.1:3001",
    "http://192.168.56.1:3002",
  ],
};

export default nextConfig;
