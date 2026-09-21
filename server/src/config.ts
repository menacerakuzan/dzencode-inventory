import path from 'node:path';
import { fileURLToPath } from 'node:url';

const isProduction = process.env.NODE_ENV === 'production';

function env(name: string, fallback?: string): string {
  const value = process.env[name] ?? fallback;
  if (value === undefined || value === '') {
    throw new Error(`Environment variable ${name} is required`);
  }
  return value;
}

const list = (value: string) =>
  value
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);

const currencies = list(env('CURRENCIES', 'UAH,USD')).map((code) => code.toUpperCase());
const defaultCurrency = env('DEFAULT_CURRENCY', currencies[0]).toUpperCase();
if (!currencies.includes(defaultCurrency)) {
  throw new Error(`DEFAULT_CURRENCY "${defaultCurrency}" must be one of CURRENCIES (${currencies.join(', ')})`);
}

// `public/` sits next to `src/` and `dist/`, so the path works both in dev and in the build.
const serverRoot = fileURLToPath(new URL('..', import.meta.url));

export const config = {
  port: Number(env('PORT', '4000')),
  corsOrigins: list(env('CORS_ORIGINS', 'http://localhost:3000')),
  jwt: {
    secret: env('JWT_SECRET', isProduction ? undefined : 'dev-only-secret-change-me'),
    ttlSeconds: Number(env('JWT_TTL_SECONDS', String(60 * 60 * 8))),
  },
  cookie: {
    name: env('AUTH_COOKIE_NAME', 'token'),
    secure: env('COOKIE_SECURE', 'false') === 'true',
  },
  db: {
    host: env('DB_HOST', 'localhost'),
    port: Number(env('DB_PORT', '3306')),
    user: env('DB_USER', 'inventory'),
    password: env('DB_PASSWORD', 'inventory'),
    database: env('DB_NAME', 'inventory'),
  },
  /** Currencies a product price can be set in; the default one is shown as the main price. */
  currencies,
  defaultCurrency,
  /** Built-in product icons: every image file in this folder can be chosen as a product photo. */
  iconsDir: path.resolve(env('ICONS_DIR', path.join(serverRoot, 'public/icons'))),
  defaultPhoto: env('DEFAULT_PRODUCT_PHOTO', '/icons/default.svg'),
  uploads: {
    dir: path.resolve(env('UPLOAD_DIR', path.join(serverRoot, 'uploads'))),
    maxBytes: Number(env('UPLOAD_MAX_MB', '2')) * 1024 * 1024,
  },
} as const;
