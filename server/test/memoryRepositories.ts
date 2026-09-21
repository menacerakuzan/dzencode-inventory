import bcrypt from 'bcryptjs';
import type { Order, Product, Repositories } from '../src/types.js';

export const DEMO_USER = { id: 1, email: 'admin@inventory.local', name: 'Admin', password: 'Admin123!' };

export function createMemoryRepositories(): Repositories & { data: { orders: Order[]; products: Product[] } } {
  const passwordHash = bcrypt.hashSync(DEMO_USER.password, 4);
  const orders: Order[] = [
    { id: 1, title: 'Order 1', description: 'desc', date: '2017-06-29 12:09:33', warehouseId: 1 },
  ];
  const products: Product[] = [
    {
      id: 1,
      serialNumber: '1234',
      isNew: true,
      photo: '/products/monitors.svg',
      title: 'Product 1',
      type: 'Monitors',
      specification: 'Specification 1',
      status: 'free',
      guarantee: { start: '2017-06-29 12:09:33', end: '2018-06-29 12:09:33' },
      price: [
        { value: 100, symbol: 'USD', isDefault: false },
        { value: 2600, symbol: 'UAH', isDefault: true },
      ],
      order: 1,
      date: '2017-06-29 12:09:33',
    },
  ];

  return {
    data: { orders, products },
    users: {
      findByEmail: async (email) =>
        email === DEMO_USER.email ? { id: DEMO_USER.id, email, name: DEMO_USER.name, passwordHash } : null,
      findById: async (id) =>
        id === DEMO_USER.id ? { id, email: DEMO_USER.email, name: DEMO_USER.name } : null,
    },
    orders: {
      list: async () => [...orders],
      exists: async (id) => orders.some((o) => o.id === id),
      create: async (order) => {
        const created = { ...order, id: orders.length + 1 };
        orders.push(created);
        return created;
      },
      remove: async (id) => {
        const index = orders.findIndex((o) => o.id === id);
        if (index === -1) return false;
        orders.splice(index, 1);
        return true;
      },
    },
    products: {
      list: async (filter = {}) =>
        products.filter(
          (p) => (!filter.type || p.type === filter.type) && (!filter.orderId || p.order === filter.orderId),
        ),
      create: async (product) => {
        const created = { ...product, id: products.length + 1, photo: null, date: '2026-01-01 00:00:00' };
        products.push(created);
        return created;
      },
      remove: async (id) => {
        const index = products.findIndex((p) => p.id === id);
        if (index === -1) return false;
        products.splice(index, 1);
        return true;
      },
    },
    warehouses: {
      list: async () => [{ id: 1, name: 'Main', city: 'Odesa', address: 'Street 1', lat: 46.48, lng: 30.72 }],
    },
  };
}
