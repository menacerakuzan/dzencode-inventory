'use client';

import { useTranslations } from 'next-intl';
import { useEffect } from 'react';
import { readStoredTypeFilter } from '@/lib/storage';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { selectProductTypes, selectTypeFilter } from '@/store/selectors';
import { typeFilterChanged } from '@/store/slices/productsSlice';

export default function ProductsFilter() {
  const t = useTranslations('products');
  const dispatch = useAppDispatch();
  const type = useAppSelector(selectTypeFilter);
  const types = useAppSelector(selectProductTypes);

  // Restore the filter from localStorage after hydration (the server has no access to it).
  useEffect(() => {
    const stored = readStoredTypeFilter();
    if (stored && types.includes(stored)) dispatch(typeFilterChanged(stored));
    // Only on mount: later changes are written by the listener middleware.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <label className="products-filter">
      <span className="products-filter__label">{t('type')}:</span>
      <select
        className="form-select form-select-sm products-filter__select"
        value={type}
        onChange={(event) => dispatch(typeFilterChanged(event.target.value))}
      >
        <option value="">{t('all')}</option>
        {types.map((value) => (
          <option key={value} value={value}>
            {value}
          </option>
        ))}
      </select>
    </label>
  );
}
