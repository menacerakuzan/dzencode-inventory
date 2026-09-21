const TYPE_FILTER_KEY = 'inventory:product-type';

export function readStoredTypeFilter(): string | null {
  try {
    return window.localStorage.getItem(TYPE_FILTER_KEY);
  } catch {
    return null;
  }
}

export function writeStoredTypeFilter(type: string): void {
  try {
    window.localStorage.setItem(TYPE_FILTER_KEY, type);
  } catch {
    // Storage can be unavailable (private mode, quota) — the filter just won't persist.
  }
}
