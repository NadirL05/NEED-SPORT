import type { NextConfig } from 'next'

const isDev = process.env.NODE_ENV === 'development'

const csp = [
  "default-src 'self'",
  isDev
    ? "script-src 'self' 'unsafe-inline' 'unsafe-eval'"
    : "script-src 'self' 'unsafe-inline'",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: https: blob:",
  "font-src 'self' data: https:",
  isDev ? "connect-src 'self' https: ws: wss:" : "connect-src 'self' https:",
  "frame-ancestors 'none'",
].join('; ')

const config: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'public.blob.vercel-storage.com' },
      { protocol: 'https', hostname: '*.public.blob.vercel-storage.com' },
      { protocol: 'https', hostname: 'images.unsplash.com' },
      { protocol: 'https', hostname: '*.googleusercontent.com' },
    ],
  },
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: csp,
          },
          { key: 'X-Frame-Options',              value: 'DENY' },
          { key: 'X-Content-Type-Options',        value: 'nosniff' },
          { key: 'Referrer-Policy',               value: 'strict-origin-when-cross-origin' },
          { key: 'Permissions-Policy',            value: 'camera=(), microphone=(), geolocation=()' },
          { key: 'Strict-Transport-Security',     value: 'max-age=31536000; includeSubDomains; preload' },
        ],
      },
    ]
  },
}

export default config
