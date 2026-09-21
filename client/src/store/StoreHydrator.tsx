'use client';

import { useRef } from 'react';
import type { Order, Product, Warehouse } from '@/types';
import { useAppStore } from './hooks';
import { orderSelected, ordersHydrated } from './slices/ordersSlice';
import { productsHydrated } from './slices/productsSlice';
import { warehousesHydrated } from './slices/sessionSlice';

interface Props {
  orders?: Order[];
  products?: Product[];
  warehouses?: Warehouse[];
  selectedOrderId?: number | null;
}

/**
 * Puts data fetched by a Server Component into the Redux store before the page's
 * client components render, so the SSR HTML already contains the lists.
 */
export default function StoreHydrator({ orders, products, warehouses, selectedOrderId }: Props) {
  const store = useAppStore();
  const hydrated = useRef<true | null>(null);

  if (hydrated.current == null) {
    hydrated.current = true;
    if (orders) store.dispatch(ordersHydrated(orders));
    if (products) store.dispatch(productsHydrated(products));
    if (warehouses) store.dispatch(warehousesHydrated(warehouses));
    if (selectedOrderId !== undefined) store.dispatch(orderSelected(selectedOrderId));
  }

  return null;
}
