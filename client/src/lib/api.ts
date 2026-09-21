import axios from 'axios';
import type { Icon, Order, OrderInput, Product, ProductInput, User } from '@/types';

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
  create: (order: OrderInput) => api.post<Order>('/orders', order).then((r) => r.data),
  update: (id: number, order: OrderInput) => api.put<Order>(`/orders/${id}`, order).then((r) => r.data),
  remove: (id: number) => api.delete(`/orders/${id}`),
};

export const productsApi = {
  create: (product: ProductInput) => api.post<Product>('/products', product).then((r) => r.data),
  update: (id: number, product: ProductInput) =>
    api.put<Product>(`/products/${id}`, product).then((r) => r.data),
  remove: (id: number) => api.delete(`/products/${id}`),
};

export const iconsApi = {
  list: () => api.get<Icon[]>('/icons').then((r) => r.data),
};

export const uploadsApi = {
  /** Uploads an image and returns its public URL (`/uploads/…`). */
  upload: (file: File) => {
    const form = new FormData();
    form.append('file', file);
    return api.post<{ url: string }>('/uploads', form).then((r) => r.data.url);
  },
};
