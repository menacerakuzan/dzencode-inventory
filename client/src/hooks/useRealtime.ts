'use client';

import { useEffect } from 'react';
import { io } from 'socket.io-client';
import { useAppDispatch } from '@/store/hooks';
import { orderRemoved, orderUpserted } from '@/store/slices/ordersSlice';
import { productRemoved, productUpserted } from '@/store/slices/productsSlice';
import { activeTabsChanged, connectionChanged } from '@/store/slices/sessionSlice';
import type { Order, Product } from '@/types';

const WS_URL = process.env.NEXT_PUBLIC_WS_URL;

/**
 * One socket per tab: the server counts sockets to show active tabs and
 * broadcasts data changes so every open tab stays in sync.
 */
export function useRealtime(): void {
  const dispatch = useAppDispatch();

  useEffect(() => {
    const socket = WS_URL ? io(WS_URL) : io();

    socket.on('connect', () => dispatch(connectionChanged(true)));
    socket.on('disconnect', () => dispatch(connectionChanged(false)));
    socket.on('sessions:count', (count: number) => dispatch(activeTabsChanged(count)));
    socket.on('order:created', (order: Order) => dispatch(orderUpserted(order)));
    socket.on('order:deleted', ({ id }: { id: number }) => dispatch(orderRemoved(id)));
    socket.on('product:created', (product: Product) => dispatch(productUpserted(product)));
    socket.on('product:deleted', ({ id }: { id: number }) => dispatch(productRemoved(id)));

    return () => {
      socket.disconnect();
    };
  }, [dispatch]);
}
