/** @type {import('next').NextConfig} */
const nextConfig = {
  allowedDevOrigins: [
    "http://192.168.56.1:3000",
    "http://localhost:3000",
    "http://127.0.0.1:3000",
  ],
};

module.exports = nextConfig;
