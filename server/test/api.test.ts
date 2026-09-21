import request from 'supertest';
import { beforeEach, describe, expect, it } from 'vitest';
import { createApp } from '../src/app.js';
import { createMemoryRepositories, createRecordingEventBus, DEMO_USER } from './memoryRepositories.js';

function setup() {
  const repos = createMemoryRepositories();
  const events = createRecordingEventBus();
  const app = createApp({ repos, events, corsOrigins: ['http://localhost:3000'] });
  return { app, repos, events };
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

  it('creates an order, normalizes the date and emits an event', async () => {
    const res = await request(ctx.app)
      .post('/api/orders')
      .set('Cookie', cookie)
      .send({ title: 'New order', date: '2026-09-21T10:30', warehouseId: 1 });
    expect(res.status).toBe(201);
    expect(res.body).toMatchObject({ title: 'New order', description: '', date: '2026-09-21 10:30:00' });
    expect(ctx.events.events).toEqual([['order:created', res.body]]);
  });

  it('deletes an order and returns 404 for unknown ids', async () => {
    const del = await request(ctx.app).delete('/api/orders/1').set('Cookie', cookie);
    expect(del.status).toBe(204);
    expect(ctx.events.events).toEqual([['order:deleted', { id: 1 }]]);

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

  it('creates a product', async () => {
    const res = await request(ctx.app).post('/api/products').set('Cookie', cookie).send(validProduct);
    expect(res.status).toBe(201);
    expect(res.body.guarantee).toEqual({ start: '2026-01-01 00:00:00', end: '2027-01-01 00:00:00' });
    expect(ctx.events.events[0]?.[0]).toBe('product:created');
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
