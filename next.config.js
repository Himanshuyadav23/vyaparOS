/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Ensure path aliases work correctly
  webpack: (config) => {
    // Ensure path aliases are resolved correctly
    config.resolve.alias = {
      ...config.resolve.alias,
      '@': require('path').resolve(__dirname),
    };
    return config;
  },
};

module.exports = nextConfig;



