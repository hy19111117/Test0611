/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "standalone",
  // 线上忽略TS/ESLint错误
  typescript: {
    ignoreBuildErrors: true
  },
  eslint: {
    ignoreDuringBuilds: true
  },
  // 强制客户端渲染，解决页面闪烁白屏
  reactStrictMode: false
}

module.exports = nextConfig
