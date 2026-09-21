import type { ProductFilters } from '@/store/slices/productsSlice';

const FILTERS_KEY = 'inventory:product-filters';

export function readStoredFilters(): ProductFilters | null {
  try {
    const raw = window.localStorage.getItem(FILTERS_KEY);
    if (!raw) return null;
    const parsed: unknown = JSON.parse(raw);
    if (
      parsed &&
      typeof parsed === 'object' &&
      typeof (parsed as ProductFilters).type === 'string' &&
      typeof (parsed as ProductFilters).specification === 'string'
    ) {
      return parsed as ProductFilters;
    }
    return null;
  } catch {
    return null;
  }
}

export function writeStoredFilters(filters: ProductFilters): void {
  try {
    window.localStorage.setItem(FILTERS_KEY, JSON.stringify(filters));
  } catch {
    // Storage can be unavailable (private mode, quota) — filters just won't persist.
  }
}
