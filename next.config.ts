import type { NextConfig } from 'next'

const isDev = process.env.NODE_ENV === 'development'

// NOTE on script-src: the public pages are statically prerendered, so their
// inline framework scripts are emitted at build time without a per-request
// nonce. A strict nonce/'strict-dynamic' CSP would therefore require forcing
// the whole site to dynamic rendering. As the app has no custom inline scripts,
// no dangerouslySetInnerHTML and React-escaped CMS content, we keep
// 'unsafe-inline' for scripts but otherwise lock the policy down (object-src,
// base-uri, form-action, frame-ancestors).
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
  "base-uri 'self'",
  "form-action 'self'",
  "object-src 'none'",
].join('; ')

const config: NextConfig = {
  transpilePackages: ['@vercel/analytics'],
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'public.blob.vercel-storage.com' },
      { protocol: 'https', hostname: '*.public.blob.vercel-storage.com' },
      { protocol: 'https', hostname: 'images.unsplash.com' },
      { protocol: 'https', hostname: '*.googleusercontent.com' },
    ],
  },
  headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'Content-Security-Policy',       value: csp },
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
