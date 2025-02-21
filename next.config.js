/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    minimumCacheTTL: 2592000, // 30 days
    domains: ['raw.githubusercontent.com'], // Allow PokeAPI images
    unoptimized: process.env.NODE_ENV === 'development', // Disable optimization in development
    deviceSizes: [640, 750, 828, 1080, 1200], // Limit device sizes
    imageSizes: [16, 32, 48, 64, 96, 128, 256], // Limit image sizes
    formats: ['image/webp'],
  },
  // Add remote patterns for security
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'raw.githubusercontent.com',
        pathname: '/PokeAPI/sprites/**',
      },
    ],
  },
}

module.exports = nextConfig 