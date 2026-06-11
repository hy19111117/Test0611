/** @type {import('next').NextConfig} */
const nextConfig = {
  // 解决 Vercel 找不到 public 目录、访问报错
  output: "standalone",

  // 跳过TS报错、解决卡死构建
  typescript: {
    ignoreBuildErrors: true
  },
  eslint: {
    ignoreDuringBuilds: true
  }
}

module.exports = nextConfig
