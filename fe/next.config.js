/** @type {import('next').NextConfig} */
const nextConfig = {
  // 服务器外部包配置
  serverExternalPackages: [],

  // 图片优化配置
  images: {
    domains: [
      'localhost',
      'example.com',
      // 添加你的图片域名
    ],
    formats: ['image/webp', 'image/avif'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 60,
  },

  // 压缩配置
  compress: true,

  // 性能优化
  poweredByHeader: false,
  generateEtags: true,
  trailingSlash: false,

  // 环境变量配置
  env: {
    CUSTOM_KEY: process.env.CUSTOM_KEY,
  },

  // 重定向配置
  async redirects() {
    return [
      // 添加重定向规则
    ]
  },

  // 重写配置
  async rewrites() {
    return [
      // 添加重写规则
    ]
  },

  // 头部配置
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()',
          },
        ],
      },
      {
        source: '/api/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'no-store, max-age=0',
          },
        ],
      },
      {
        source: '/_next/static/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
    ]
  },

  // Webpack 配置
  webpack: (config, { buildId, dev, isServer, defaultLoaders, webpack }) => {
    // 性能优化
    if (!dev && !isServer) {
      config.optimization.splitChunks = {
        chunks: 'all',
        cacheGroups: {
          default: false,
          vendors: false,
          // 将 React 相关库打包到一个 chunk
          react: {
            name: 'react',
            chunks: 'all',
            test: /[\\/]node_modules[\\/](react|react-dom)[\\/]/,
            priority: 20,
          },
          // 将 UI 库打包到一个 chunk
          ui: {
            name: 'ui',
            chunks: 'all',
            test: /[\\/]node_modules[\\/](@radix-ui|lucide-react)[\\/]/,
            priority: 15,
          },
          // 将其他第三方库打包到一个 chunk
          vendor: {
            name: 'vendor',
            chunks: 'all',
            test: /[\\/]node_modules[\\/]/,
            priority: 10,
          },
        },
      }
    }

    // 添加自定义 loader 或插件
    return config
  },

  // TypeScript 配置
  typescript: {
    // 在生产构建时忽略 TypeScript 错误（不推荐）
    // ignoreBuildErrors: false,
  },

  // ESLint 配置
  eslint: {
    // 在生产构建时忽略 ESLint 错误（不推荐）
    // ignoreDuringBuilds: false,
  },

  // 输出配置
  output: 'standalone',

  // 静态导出配置（如果需要）
  // output: 'export',
  // trailingSlash: true,
  // images: {
  //   unoptimized: true,
  // },
}

// Bundle Analyzer 配置（暂时注释掉）
// const withBundleAnalyzer = require('@next/bundle-analyzer')({
//   enabled: process.env.ANALYZE === 'true',
// })

module.exports = nextConfig