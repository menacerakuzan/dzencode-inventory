import { describe, expect, it, vi } from 'vitest';
import { ordersApi, productsApi } from '@/lib/api';
import { makeOrder, makeProduct } from '@/test/fixtures';
import {
  selectFilteredProducts,
  selectOrderSummaries,
  selectSpecifications,
  selectVisibleOrders,
} from './selectors';
import { createOrder, deleteOrder, orderSelected, ordersHydrated } from './slices/ordersSlice';
import {
  deleteProduct,
  productsHydrated,
  specificationFilterChanged,
  typeFilterChanged,
} from './slices/productsSlice';
import { searchChanged } from './slices/uiSlice';
import { makeStore } from './store';

function seededStore() {
  const store = makeStore();
  store.dispatch(
    ordersHydrated([
      makeOrder({ id: 1, title: 'Monitors delivery', date: '2026-01-01 10:00:00' }),
      makeOrder({ id: 2, title: 'Laptops', date: '2026-03-01 10:00:00' }),
    ]),
  );
  store.dispatch(
    productsHydrated([
      makeProduct({ id: 1, order: 1, type: 'Monitors', specification: '27"' }),
      makeProduct({ id: 2, order: 1, type: 'Monitors', specification: '24"', title: 'Dell P2422H' }),
      makeProduct({ id: 3, order: 2, type: 'Laptops', specification: 'M3', serialNumber: 'SN-MAC' }),
    ]),
  );
  return store;
}

describe('orders', () => {
  it('keeps orders sorted by date, newest first, including created ones', async () => {
    const store = seededStore();
    expect(store.getState().orders.items.map((o) => o.id)).toEqual([2, 1]);

    const created = makeOrder({ id: 3, title: 'Phones', date: '2026-05-01 10:00:00' });
    const create = vi.spyOn(ordersApi, 'create').mockResolvedValueOnce(created);
    await store.dispatch(createOrder({ title: 'Phones', description: '', date: created.date, warehouseId: null }));
    expect(store.getState().orders.items.map((o) => o.id)).toEqual([3, 2, 1]);
    create.mockRestore();
  });

  it('computes product count and totals per order', () => {
    const summary = selectOrderSummaries(seededStore().getState()).find((o) => o.id === 1)!;
    expect(summary.productsCount).toBe(2);
    expect(summary.totals).toEqual({ USD: 200, UAH: 5200 });
  });

  it('removes the products of a deleted order and clears the selection', () => {
    const store = seededStore();
    store.dispatch(orderSelected(1));
    store.dispatch(deleteOrder.fulfilled(1, 'request-id', 1));

    const state = store.getState();
    expect(state.orders.items.map((o) => o.id)).toEqual([2]);
    expect(state.orders.selectedId).toBeNull();
    expect(state.products.items.map((p) => p.id)).toEqual([3]);
  });

  it('filters orders by the search query', () => {
    const store = seededStore();
    store.dispatch(searchChanged('  MONITORS '));
    expect(selectVisibleOrders(store.getState()).map((o) => o.id)).toEqual([1]);
  });
});

describe('products', () => {
  it('filters by type, specification and search', () => {
    const store = seededStore();
    store.dispatch(typeFilterChanged('Monitors'));
    expect(selectFilteredProducts(store.getState()).map((p) => p.id)).toEqual([1, 2]);
    expect(selectSpecifications(store.getState())).toEqual(['24"', '27"']);

    store.dispatch(specificationFilterChanged('24"'));
    expect(selectFilteredProducts(store.getState()).map((p) => p.id)).toEqual([2]);

    store.dispatch(typeFilterChanged(''));
    expect(store.getState().products.filters).toEqual({ type: '', specification: '' });

    store.dispatch(searchChanged('sn-mac'));
    expect(selectFilteredProducts(store.getState()).map((p) => p.id)).toEqual([3]);
  });

  it('persists filters to localStorage (Web Storage)', () => {
    const store = seededStore();
    store.dispatch(typeFilterChanged('Laptops'));
    expect(JSON.parse(window.localStorage.getItem('inventory:product-filters')!)).toEqual({
      type: 'Laptops',
      specification: '',
    });
  });

  it('deletes a product through the API and keeps it when the request fails', async () => {
    const store = seededStore();
    const remove = vi.spyOn(productsApi, 'remove');

    remove.mockResolvedValueOnce({} as never);
    await store.dispatch(deleteProduct(1));
    expect(store.getState().products.items.map((p) => p.id)).toEqual([2, 3]);

    remove.mockRejectedValueOnce(new Error('Network Error'));
    const failed = await store.dispatch(deleteProduct(2));
    expect(failed.payload).toBe('Network Error');
    expect(store.getState().products.items.map((p) => p.id)).toEqual([2, 3]);

    remove.mockRestore();
  });
});
