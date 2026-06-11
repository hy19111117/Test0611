/** @type {import('next').NextConfig} */
const nextConfig = {
  // 直接解决卡在 Linting 不动
  typescript: {
    ignoreBuildErrors: true
  },
  eslint: {
    ignoreDuringBuilds: true
  }
}

module.exports = nextConfig
