import { createSelector } from '@reduxjs/toolkit';
import { sumTotals } from '@/lib/format';
import type { OrderSummary, Product } from '@/types';
import type { RootState } from './store';

export const selectOrders = (state: RootState) => state.orders.items;
export const selectSelectedOrderId = (state: RootState) => state.orders.selectedId;
export const selectProducts = (state: RootState) => state.products.items;
export const selectProductFilters = (state: RootState) => state.products.filters;
export const selectSearch = (state: RootState) => state.ui.search;
export const selectWarehouses = (state: RootState) => state.session.warehouses;

const normalize = (value: string) => value.trim().toLowerCase();

export const selectProductsByOrderId = createSelector([selectProducts], (products) => {
  const map = new Map<number, Product[]>();
  for (const product of products) {
    const list = map.get(product.order) ?? [];
    list.push(product);
    map.set(product.order, list);
  }
  return map;
});

export const selectOrderSummaries = createSelector(
  [selectOrders, selectProductsByOrderId],
  (orders, productsByOrder): OrderSummary[] =>
    orders.map((order) => {
      const products = productsByOrder.get(order.id) ?? [];
      return { ...order, productsCount: products.length, totals: sumTotals(products) };
    }),
);

export const selectVisibleOrders = createSelector([selectOrderSummaries, selectSearch], (orders, search) => {
  const query = normalize(search);
  return query ? orders.filter((order) => normalize(order.title).includes(query)) : orders;
});

export const selectSelectedOrder = createSelector(
  [selectOrderSummaries, selectSelectedOrderId],
  (orders, id) => orders.find((order) => order.id === id) ?? null,
);

export const selectOrderTitles = createSelector(
  [selectOrders],
  (orders) => new Map(orders.map((order) => [order.id, order.title])),
);

export const selectProductTypes = createSelector([selectProducts], (products) =>
  [...new Set(products.map((p) => p.type))].sort(),
);

export const selectSpecifications = createSelector([selectProducts, selectProductFilters], (products, filters) =>
  [...new Set(products.filter((p) => !filters.type || p.type === filters.type).map((p) => p.specification))].sort(),
);

export const selectFilteredProducts = createSelector(
  [selectProducts, selectProductFilters, selectSearch],
  (products, filters, search) => {
    const query = normalize(search);
    return products.filter(
      (p) =>
        (!filters.type || p.type === filters.type) &&
        (!filters.specification || p.specification === filters.specification) &&
        (!query || normalize(p.title).includes(query) || normalize(p.serialNumber).includes(query)),
    );
  },
);
