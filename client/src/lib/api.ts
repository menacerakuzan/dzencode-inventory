import axios from 'axios';
import type { NewOrder, NewProduct, Order, Product, User, Warehouse } from '@/types';

export const api = axios.create({
  baseURL: '/api',
  withCredentials: true,
  timeout: 15_000,
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const unauthorized = axios.isAxiosError(error) && error.response?.status === 401;
    // Expired session: a full reload to /login also drops the in-memory Redux state.
    if (unauthorized && typeof window !== 'undefined' && !window.location.pathname.startsWith('/login')) {
      // eslint-disable-next-line @next/next/no-location-assign-relative-destination
      window.location.href = `/login?next=${encodeURIComponent(window.location.pathname)}`;
    }
    return Promise.reject(error);
  },
);

export function apiErrorMessage(error: unknown): string {
  if (axios.isAxiosError<{ message?: string }>(error)) {
    return error.response?.data?.message ?? error.message;
  }
  return error instanceof Error ? error.message : String(error);
}

export const authApi = {
  login: (credentials: { email: string; password: string }) =>
    api.post<{ user: User }>('/auth/login', credentials).then((r) => r.data.user),
  logout: () => api.post('/auth/logout'),
};

export const ordersApi = {
  create: (order: NewOrder) => api.post<Order>('/orders', order).then((r) => r.data),
  remove: (id: number) => api.delete(`/orders/${id}`),
};

export const productsApi = {
  create: (product: NewProduct) => api.post<Product>('/products', product).then((r) => r.data),
  remove: (id: number) => api.delete(`/products/${id}`),
};

export const warehousesApi = {
  list: () => api.get<Warehouse[]>('/warehouses').then((r) => r.data),
};
