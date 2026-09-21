import request from 'supertest';
import { beforeEach, describe, expect, it } from 'vitest';
import { createApp } from '../src/app.js';
import { createMemoryRepositories, DEMO_USER } from './memoryRepositories.js';

function setup() {
  const repos = createMemoryRepositories();
  const app = createApp({ repos, corsOrigins: ['http://localhost:3000'] });
  return { app, repos };
}

async function login(app: ReturnType<typeof setup>['app']): Promise<string> {
  const res = await request(app)
    .post('/api/auth/login')
    .send({ email: DEMO_USER.email, password: DEMO_USER.password });
  const cookie = res.headers['set-cookie']?.[0];
  if (!cookie) throw new Error('No auth cookie returned');
  return cookie.split(';')[0]!;
}

describe('auth', () => {
  let ctx: ReturnType<typeof setup>;
  beforeEach(() => {
    ctx = setup();
  });

  it('rejects invalid payload with field errors', async () => {
    const res = await request(ctx.app).post('/api/auth/login').send({ email: 'nope', password: '1' });
    expect(res.status).toBe(400);
    expect(res.body.errors.map((e: { path: string }) => e.path)).toEqual(['email', 'password']);
  });

  it('rejects wrong password', async () => {
    const res = await request(ctx.app)
      .post('/api/auth/login')
      .send({ email: DEMO_USER.email, password: 'wrong-password' });
    expect(res.status).toBe(401);
  });

  it('issues an httpOnly JWT cookie and returns the user', async () => {
    const res = await request(ctx.app)
      .post('/api/auth/login')
      .send({ email: DEMO_USER.email, password: DEMO_USER.password });
    expect(res.status).toBe(200);
    expect(res.body.user).toEqual({ id: 1, email: DEMO_USER.email, name: DEMO_USER.name });
    expect(res.headers['set-cookie']?.[0]).toMatch(/^token=.+HttpOnly/);
  });

  it('returns the current user for a valid token', async () => {
    const cookie = await login(ctx.app);
    const res = await request(ctx.app).get('/api/auth/me').set('Cookie', cookie);
    expect(res.status).toBe(200);
    expect(res.body.user.email).toBe(DEMO_USER.email);
  });

  it('accepts a Bearer token as well', async () => {
    const cookie = await login(ctx.app);
    const token = cookie.replace('token=', '');
    const res = await request(ctx.app).get('/api/orders').set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
  });

  it('rejects a tampered token', async () => {
    const res = await request(ctx.app).get('/api/orders').set('Cookie', 'token=abc.def.ghi');
    expect(res.status).toBe(401);
  });
});

describe('orders', () => {
  let ctx: ReturnType<typeof setup>;
  let cookie: string;
  beforeEach(async () => {
    ctx = setup();
    cookie = await login(ctx.app);
  });

  it('requires authentication', async () => {
    const res = await request(ctx.app).get('/api/orders');
    expect(res.status).toBe(401);
  });

  it('lists orders', async () => {
    const res = await request(ctx.app).get('/api/orders').set('Cookie', cookie);
    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(1);
  });

  it('validates a new order', async () => {
    const res = await request(ctx.app)
      .post('/api/orders')
      .set('Cookie', cookie)
      .send({ title: 'x', date: 'yesterday' });
    expect(res.status).toBe(400);
    expect(res.body.errors.map((e: { path: string }) => e.path)).toEqual(['title', 'date']);
  });

  it('creates an order and normalizes the date', async () => {
    const res = await request(ctx.app)
      .post('/api/orders')
      .set('Cookie', cookie)
      .send({ title: 'New order', date: '2026-09-21T10:30', warehouseId: 1 });
    expect(res.status).toBe(201);
    expect(res.body).toMatchObject({ title: 'New order', description: '', date: '2026-09-21 10:30:00' });
  });

  it('updates an order and returns 404 for unknown ids', async () => {
    const res = await request(ctx.app)
      .put('/api/orders/1')
      .set('Cookie', cookie)
      .send({ title: 'Renamed order', date: '2026-09-21 10:30', warehouseId: null });
    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({ id: 1, title: 'Renamed order', warehouseId: null });

    const missing = await request(ctx.app)
      .put('/api/orders/999')
      .set('Cookie', cookie)
      .send({ title: 'Renamed order', date: '2026-09-21 10:30' });
    expect(missing.status).toBe(404);
  });

  it('deletes an order and returns 404 for unknown ids', async () => {
    const del = await request(ctx.app).delete('/api/orders/1').set('Cookie', cookie);
    expect(del.status).toBe(204);

    const again = await request(ctx.app).delete('/api/orders/1').set('Cookie', cookie);
    expect(again.status).toBe(404);
  });

  it('rejects a non-numeric id', async () => {
    const res = await request(ctx.app).delete('/api/orders/abc').set('Cookie', cookie);
    expect(res.status).toBe(400);
  });
});

describe('products', () => {
  let ctx: ReturnType<typeof setup>;
  let cookie: string;
  const validProduct = {
    title: 'Dell P2422H',
    serialNumber: 'SN-1',
    isNew: true,
    type: 'Monitors',
    specification: '24" Full HD',
    status: 'free',
    guarantee: { start: '2026-01-01 00:00', end: '2027-01-01 00:00' },
    price: [
      { value: 189, symbol: 'USD', isDefault: false },
      { value: 7843.5, symbol: 'UAH', isDefault: true },
    ],
    order: 1,
  };

  beforeEach(async () => {
    ctx = setup();
    cookie = await login(ctx.app);
  });

  it('filters products by type', async () => {
    const res = await request(ctx.app).get('/api/products?type=Phones').set('Cookie', cookie);
    expect(res.status).toBe(200);
    expect(res.body).toEqual([]);
  });

  it('creates a product with the default photo when none is chosen', async () => {
    const res = await request(ctx.app).post('/api/products').set('Cookie', cookie).send(validProduct);
    expect(res.status).toBe(201);
    expect(res.body.guarantee).toEqual({ start: '2026-01-01 00:00:00', end: '2027-01-01 00:00:00' });
    expect(res.body.photo).toBe('/icons/default.svg');
  });

  it('updates a product including its photo and prices', async () => {
    const res = await request(ctx.app)
      .put('/api/products/1')
      .set('Cookie', cookie)
      .send({
        ...validProduct,
        title: 'Edited',
        photo: '/uploads/abc.png',
        price: [{ value: 5000, symbol: 'uah', isDefault: true }],
      });
    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({
      id: 1,
      title: 'Edited',
      photo: '/uploads/abc.png',
      price: [{ value: 5000, symbol: 'UAH', isDefault: true }],
    });
  });

  it('rejects unknown currencies and foreign photo paths', async () => {
    const res = await request(ctx.app)
      .post('/api/products')
      .set('Cookie', cookie)
      .send({
        ...validProduct,
        photo: 'https://evil.example/x.png',
        price: [{ value: 1, symbol: 'EUR', isDefault: true }],
      });
    expect(res.status).toBe(400);
    expect(res.body.errors.map((e: { path: string }) => e.path)).toEqual(['photo', 'price.0.symbol']);
  });

  it('rejects guarantee end before start', async () => {
    const res = await request(ctx.app)
      .post('/api/products')
      .set('Cookie', cookie)
      .send({ ...validProduct, guarantee: { start: '2027-01-01 00:00', end: '2026-01-01 00:00' } });
    expect(res.status).toBe(400);
    expect(res.body.errors[0].path).toBe('guarantee.end');
  });

  it('requires exactly one default price', async () => {
    const res = await request(ctx.app)
      .post('/api/products')
      .set('Cookie', cookie)
      .send({ ...validProduct, price: validProduct.price.map((p) => ({ ...p, isDefault: true })) });
    expect(res.status).toBe(400);
  });

  it('returns 404 when the order does not exist', async () => {
    const res = await request(ctx.app)
      .post('/api/products')
      .set('Cookie', cookie)
      .send({ ...validProduct, order: 999 });
    expect(res.status).toBe(404);
  });

  it('deletes a product', async () => {
    const res = await request(ctx.app).delete('/api/products/1').set('Cookie', cookie);
    expect(res.status).toBe(204);
    expect(ctx.repos.data.products).toHaveLength(0);
  });
});

describe('settings, icons and uploads', () => {
  let ctx: ReturnType<typeof setup>;
  let cookie: string;
  beforeEach(async () => {
    ctx = setup();
    cookie = await login(ctx.app);
  });

  it('returns configured currencies', async () => {
    const res = await request(ctx.app).get('/api/settings').set('Cookie', cookie);
    expect(res.body).toEqual({ currencies: ['UAH', 'USD'], defaultCurrency: 'UAH' });
  });

  it('lists icons from the icons folder and serves them', async () => {
    const res = await request(ctx.app).get('/api/icons').set('Cookie', cookie);
    expect(res.body).toContainEqual({ name: 'monitors', url: '/icons/monitors.svg' });
    expect((await request(ctx.app).get('/icons/monitors.svg')).status).toBe(200);
  });

  it('uploads an image and serves it back', async () => {
    const png = Buffer.from(
      'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=',
      'base64',
    );
    const res = await request(ctx.app)
      .post('/api/uploads')
      .set('Cookie', cookie)
      .attach('file', png, { filename: 'pixel.png', contentType: 'image/png' });
    expect(res.status).toBe(201);
    expect(res.body.url).toMatch(/^\/uploads\/[\w-]+\.png$/);
    expect((await request(ctx.app).get(res.body.url)).status).toBe(200);
  });

  it('rejects non-image uploads and requires auth', async () => {
    const svg = await request(ctx.app)
      .post('/api/uploads')
      .set('Cookie', cookie)
      .attach('file', Buffer.from('<svg/>'), { filename: 'x.svg', contentType: 'image/svg+xml' });
    expect(svg.status).toBe(400);
    expect((await request(ctx.app).post('/api/uploads')).status).toBe(401);
  });
});

describe('misc', () => {
  it('answers health checks and 404s unknown routes', async () => {
    const { app } = setup();
    expect((await request(app).get('/api/health')).body).toEqual({ status: 'ok' });
    expect((await request(app).get('/api/unknown')).status).toBe(404);
  });

  it('reports malformed JSON as 400', async () => {
    const { app } = setup();
    const res = await request(app)
      .post('/api/auth/login')
      .set('Content-Type', 'application/json')
      .send('{"email":');
    expect(res.status).toBe(400);
  });
});
