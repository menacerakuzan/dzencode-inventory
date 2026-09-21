const isProduction = process.env.NODE_ENV === 'production';

function env(name: string, fallback?: string): string {
  const value = process.env[name] ?? fallback;
  if (value === undefined || value === '') {
    throw new Error(`Environment variable ${name} is required`);
  }
  return value;
}

export const config = {
  port: Number(env('PORT', '4000')),
  corsOrigins: env('CORS_ORIGINS', 'http://localhost:3000')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean),
  jwt: {
    secret: env('JWT_SECRET', isProduction ? undefined : 'dev-only-secret-change-me'),
    ttlSeconds: Number(env('JWT_TTL_SECONDS', String(60 * 60 * 8))),
  },
  cookie: {
    name: 'token',
    secure: env('COOKIE_SECURE', 'false') === 'true',
  },
  db: {
    host: env('DB_HOST', 'localhost'),
    port: Number(env('DB_PORT', '3306')),
    user: env('DB_USER', 'inventory'),
    password: env('DB_PASSWORD', 'inventory'),
    database: env('DB_NAME', 'inventory'),
  },
} as const;
