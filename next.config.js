/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['img.clerk.com'],
  },
  webpack: (config, { isServer }) => {
    // Externalize canvas for server-side to avoid bundling issues
    if (isServer) {
      config.externals.push('canvas')
    }
    return config
  },
}

module.exports = nextConfig
