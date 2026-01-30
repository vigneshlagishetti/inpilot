/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['img.clerk.com'],
  },
  async headers() {
    return [
      {
        // Apply headers to the main landing page
        source: '/',
        headers: [
          {
            key: 'X-Robots-Tag',
            value: 'index, follow',
          },
        ],
      },
      {
        // Apply headers to sign-in and sign-up pages
        source: '/sign-:path*',
        headers: [
          {
            key: 'X-Robots-Tag',
            value: 'index, follow',
          },
        ],
      },
    ];
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
