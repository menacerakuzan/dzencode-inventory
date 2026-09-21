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
    return [{ source: '/api/:path*', destination: `${apiUrl}/api/:path*` }];
  },
};

export default createNextIntlPlugin('./src/i18n/request.ts')(nextConfig);
