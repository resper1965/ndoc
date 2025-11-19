// Contentlayer removido - usando next-mdx-remote com Supabase
// import { createContentlayerPlugin } from 'next-contentlayer2';

const nextConfig = {
  // pageExtensions: ['js', 'jsx', 'ts', 'tsx', 'md', 'mdx'],
  webpack: (config: { cache: boolean }) => {
    // Habilitar cache para melhor performance de build
    config.cache = true;
    return config;
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https' as 'https',
        hostname: 'avatars.githubusercontent.com',
      },
    ],
  },
  // Security Headers
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on',
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains; preload',
          },
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin',
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()',
          },
          {
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self'",
              // 'unsafe-eval' necessário para CodeMirror funcionar corretamente
              // Considerar alternativas no futuro para melhorar segurança
              "script-src 'self' 'unsafe-eval' 'unsafe-inline' https://vercel.live",
              "style-src 'self' 'unsafe-inline'",
              "img-src 'self' data: https: blob:",
              "font-src 'self' data:",
              "connect-src 'self' https://*.supabase.co https://*.upstash.io wss://*.supabase.co",
              "frame-ancestors 'self'",
              "base-uri 'self'",
              "form-action 'self'",
            ].join('; '),
          },
        ],
      },
    ];
  },
};

// Contentlayer removido - usando Supabase + next-mdx-remote
// const withContentlayer = createContentlayerPlugin({
//   // Additional Contentlayer config options
// });

export default nextConfig;
