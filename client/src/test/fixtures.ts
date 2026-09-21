import type { Order, Product } from '@/types';

export const makeOrder = (overrides: Partial<Order> = {}): Order => ({
  id: 1,
  title: 'Order 1',
  description: 'desc',
  date: '2017-06-29 12:09:33',
  warehouseId: null,
  ...overrides,
});

export const makeProduct = (overrides: Partial<Product> = {}): Product => ({
  id: 1,
  serialNumber: 'SN-1234',
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
  ...overrides,
});
