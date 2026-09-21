import bcrypt from 'bcryptjs';
import { Router, type CookieOptions } from 'express';
import { config } from '../config.js';
import type { Repositories } from '../types.js';
import { requireAuth, signToken } from './auth.js';
import { HttpError, parseOrThrow } from './errors.js';
import { idParam, loginSchema, orderCreateSchema, productCreateSchema, productsQuerySchema } from './schemas.js';

const cookieOptions: CookieOptions = {
  httpOnly: true,
  sameSite: 'lax',
  secure: config.cookie.secure,
  path: '/',
};

export function authRouter(repos: Repositories): Router {
  const router = Router();

  router.post('/login', async (req, res) => {
    const { email, password } = parseOrThrow(loginSchema, req.body);
    const user = await repos.users.findByEmail(email);
    const valid = user ? await bcrypt.compare(password, user.passwordHash) : false;
    if (!user || !valid) throw new HttpError(401, 'Invalid email or password');

    const publicUser = { id: user.id, email: user.email, name: user.name };
    res.cookie(config.cookie.name, signToken(publicUser), {
      ...cookieOptions,
      maxAge: config.jwt.ttlSeconds * 1000,
    });
    res.json({ user: publicUser });
  });

  router.post('/logout', (_req, res) => {
    res.clearCookie(config.cookie.name, cookieOptions);
    res.status(204).end();
  });

  router.get('/me', requireAuth, async (req, res) => {
    const user = await repos.users.findById(req.user!.id);
    if (!user) throw new HttpError(401, 'User no longer exists');
    res.json({ user });
  });

  return router;
}

export function ordersRouter(repos: Repositories): Router {
  const router = Router();

  router.get('/', async (_req, res) => {
    res.json(await repos.orders.list());
  });

  router.post('/', async (req, res) => {
    const order = await repos.orders.create(parseOrThrow(orderCreateSchema, req.body));
    res.status(201).json(order);
  });

  router.delete('/:id', async (req, res) => {
    const id = parseOrThrow(idParam, req.params.id);
    if (!(await repos.orders.remove(id))) throw new HttpError(404, 'Order not found');
    res.status(204).end();
  });

  return router;
}

export function productsRouter(repos: Repositories): Router {
  const router = Router();

  router.get('/', async (req, res) => {
    res.json(await repos.products.list(parseOrThrow(productsQuerySchema, req.query)));
  });

  router.post('/', async (req, res) => {
    const input = parseOrThrow(productCreateSchema, req.body);
    if (!(await repos.orders.exists(input.order))) throw new HttpError(404, 'Order not found');
    const product = await repos.products.create(input);
    res.status(201).json(product);
  });

  router.delete('/:id', async (req, res) => {
    const id = parseOrThrow(idParam, req.params.id);
    if (!(await repos.products.remove(id))) throw new HttpError(404, 'Product not found');
    res.status(204).end();
  });

  return router;
}

export function warehousesRouter(repos: Repositories): Router {
  const router = Router();
  router.get('/', async (_req, res) => {
    res.json(await repos.warehouses.list());
  });
  return router;
}
