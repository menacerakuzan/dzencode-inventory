import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import type { Order, Product, Settings, User, Warehouse } from '@/types';
import { AUTH_COOKIE } from './config';

const API_URL = process.env.API_INTERNAL_URL ?? 'http://localhost:4000';

/** Server-side (SSR) fetch that forwards the user's JWT cookie to the API. */
async function serverGet<T>(path: string): Promise<T> {
  const token = (await cookies()).get(AUTH_COOKIE)?.value;
  const response = await fetch(`${API_URL}/api${path}`, {
    headers: token ? { Cookie: `${AUTH_COOKIE}=${token}` } : {},
    cache: 'no-store',
  });
  if (response.status === 401) redirect('/login');
  if (!response.ok) throw new Error(`API request ${path} failed with status ${response.status}`);
  return (await response.json()) as T;
}

export const getCurrentUser = () => serverGet<{ user: User }>('/auth/me').then((r) => r.user);
export const getOrders = () => serverGet<Order[]>('/orders');
export const getProducts = () => serverGet<Product[]>('/products');
export const getWarehouses = () => serverGet<Warehouse[]>('/warehouses');
export const getSettings = () => serverGet<Settings>('/settings');
