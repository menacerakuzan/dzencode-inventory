import type { NextConfig } from 'next';
import createNextIntlPlugin from 'next-intl/plugin';

// In Docker nginx routes /api to the backend directly; the rewrite serves `npm run dev`.
const apiUrl = process.env.API_INTERNAL_URL ?? 'http://localhost:4000';

const nextConfig: NextConfig = {
  output: 'standalone',
  reactStrictMode: true,
  poweredByHeader: false,
  agentRules: false,
  async rewrites() {
    return [
      { source: '/api/:path*', destination: `${apiUrl}/api/:path*` },
      { source: '/icons/:path*', destination: `${apiUrl}/icons/:path*` },
      { source: '/uploads/:path*', destination: `${apiUrl}/uploads/:path*` },
      // Browsers request /favicon.ico on their own; serve the SVG icon instead of a 404.
      { source: '/favicon.ico', destination: '/favicon.svg' },
    ];
  },
};

export default createNextIntlPlugin('./src/i18n/request.ts')(nextConfig);
