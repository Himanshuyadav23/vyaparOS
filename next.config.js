/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Ensure path aliases work correctly
  experimental: {
    // This helps with module resolution
  },
};

module.exports = nextConfig;

