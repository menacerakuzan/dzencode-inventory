import cookieParser from 'cookie-parser';
import cors from 'cors';
import express, { type Express } from 'express';
import helmet from 'helmet';
import { requireAuth } from './http/auth.js';
import { errorHandler, notFound } from './http/errors.js';
import { config } from './config.js';
import {
  authRouter,
  iconsRouter,
  ordersRouter,
  productsRouter,
  settingsRouter,
  uploadsRouter,
  warehousesRouter,
} from './http/routes.js';
import type { Repositories } from './types.js';

interface AppDeps {
  repos: Repositories;
  corsOrigins: string[];
}

export function createApp({ repos, corsOrigins }: AppDeps): Express {
  const app = express();

  app.disable('x-powered-by');
  app.set('trust proxy', 1);
  app.use(helmet());
  app.use(cors({ origin: corsOrigins, credentials: true }));
  app.use(express.json({ limit: '100kb' }));
  app.use(cookieParser());

  app.use('/icons', express.static(config.iconsDir, { maxAge: '7d' }));
  app.use('/uploads', express.static(config.uploads.dir, { maxAge: '30d', immutable: true }));

  app.get('/api/health', (_req, res) => {
    res.json({ status: 'ok' });
  });
  app.use('/api/auth', authRouter(repos));
  app.use('/api/orders', requireAuth, ordersRouter(repos));
  app.use('/api/products', requireAuth, productsRouter(repos));
  app.use('/api/warehouses', requireAuth, warehousesRouter(repos));
  app.use('/api/settings', requireAuth, settingsRouter());
  app.use('/api/icons', requireAuth, iconsRouter());
  app.use('/api/uploads', requireAuth, uploadsRouter());

  app.use(notFound);
  app.use(errorHandler);

  return app;
}
