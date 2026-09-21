import cookieParser from 'cookie-parser';
import cors from 'cors';
import express, { type Express } from 'express';
import helmet from 'helmet';
import { requireAuth } from './http/auth.js';
import { errorHandler, notFound } from './http/errors.js';
import { authRouter, ordersRouter, productsRouter, warehousesRouter } from './http/routes.js';
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

  app.get('/api/health', (_req, res) => {
    res.json({ status: 'ok' });
  });
  app.use('/api/auth', authRouter(repos));
  app.use('/api/orders', requireAuth, ordersRouter(repos));
  app.use('/api/products', requireAuth, productsRouter(repos));
  app.use('/api/warehouses', requireAuth, warehousesRouter(repos));

  app.use(notFound);
  app.use(errorHandler);

  return app;
}
