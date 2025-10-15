/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    optimizeCss: false, // forces Next to not use lightningcss
  },
};

module.exports = nextConfig;