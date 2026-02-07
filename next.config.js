/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  webpack: (config) => {
    // Handle MediaPipe files
    config.resolve.alias = {
      ...config.resolve.alias,
    };
    return config;
  },
};

module.exports = nextConfig;
