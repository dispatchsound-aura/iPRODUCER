/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // ensure Next.js ignores TypeScript errors for this MVP
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  }
}

module.exports = nextConfig
