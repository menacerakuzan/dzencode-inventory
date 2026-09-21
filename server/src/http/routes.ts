import { randomUUID } from 'node:crypto';
import { mkdirSync } from 'node:fs';
import { readdir } from 'node:fs/promises';
import path from 'node:path';
import bcrypt from 'bcryptjs';
import { Router, type CookieOptions } from 'express';
import multer from 'multer';
import { config } from '../config.js';
import type { ProductInput, Repositories } from '../types.js';
import { requireAuth, signToken } from './auth.js';
import { HttpError, parseOrThrow } from './errors.js';
import { idParam, loginSchema, orderInputSchema, productInputSchema, productsQuerySchema } from './schemas.js';

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
    res.status(201).json(await repos.orders.create(parseOrThrow(orderInputSchema, req.body)));
  });

  router.put('/:id', async (req, res) => {
    const id = parseOrThrow(idParam, req.params.id);
    const order = await repos.orders.update(id, parseOrThrow(orderInputSchema, req.body));
    if (!order) throw new HttpError(404, 'Order not found');
    res.json(order);
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

  async function parseProduct(body: unknown): Promise<ProductInput> {
    const input = parseOrThrow(productInputSchema, body);
    if (!(await repos.orders.exists(input.order))) throw new HttpError(404, 'Order not found');
    return { ...input, photo: input.photo ?? config.defaultPhoto };
  }

  router.get('/', async (req, res) => {
    res.json(await repos.products.list(parseOrThrow(productsQuerySchema, req.query)));
  });

  router.post('/', async (req, res) => {
    res.status(201).json(await repos.products.create(await parseProduct(req.body)));
  });

  router.put('/:id', async (req, res) => {
    const id = parseOrThrow(idParam, req.params.id);
    const product = await repos.products.update(id, await parseProduct(req.body));
    if (!product) throw new HttpError(404, 'Product not found');
    res.json(product);
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

/** Settings the client needs to render forms: allowed currencies and the default one. */
export function settingsRouter(): Router {
  const router = Router();
  router.get('/', (_req, res) => {
    res.json({ currencies: config.currencies, defaultCurrency: config.defaultCurrency });
  });
  return router;
}

const ICON_FILE = /\.(svg|png|jpe?g|webp)$/i;

/** Every image in the icons folder is offered as a product photo — add a file to add an icon. */
export function iconsRouter(): Router {
  const router = Router();
  router.get('/', async (_req, res) => {
    const files = (await readdir(config.iconsDir)).filter((file) => ICON_FILE.test(file)).sort();
    res.json(files.map((file) => ({ name: path.parse(file).name, url: `/icons/${file}` })));
  });
  return router;
}

// SVG is not accepted for uploads: an uploaded SVG could carry scripts.
const UPLOAD_TYPES: Record<string, string> = {
  'image/png': '.png',
  'image/jpeg': '.jpg',
  'image/webp': '.webp',
  'image/gif': '.gif',
};

export function uploadsRouter(): Router {
  mkdirSync(config.uploads.dir, { recursive: true });
  const upload = multer({
    storage: multer.diskStorage({
      destination: config.uploads.dir,
      filename: (_req, file, done) => done(null, `${randomUUID()}${UPLOAD_TYPES[file.mimetype]}`),
    }),
    limits: { fileSize: config.uploads.maxBytes, files: 1 },
    fileFilter: (_req, file, done) => {
      if (UPLOAD_TYPES[file.mimetype]) done(null, true);
      else done(new HttpError(400, 'Only PNG, JPEG, WEBP or GIF images are allowed'));
    },
  });

  const router = Router();
  router.post('/', upload.single('file'), (req, res) => {
    if (!req.file) throw new HttpError(400, 'File is required (form field "file")');
    res.status(201).json({ url: `/uploads/${req.file.filename}` });
  });
  return router;
}
