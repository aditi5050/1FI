/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    instrumentationHook: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'fdn2.gsmarena.com',
      },
      {
        protocol: 'https',
        hostname: 'fdn.gsmarena.com',
      },
    ],
  },
};

module.exports = nextConfig;
