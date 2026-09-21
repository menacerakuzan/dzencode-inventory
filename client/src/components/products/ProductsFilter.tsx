'use client';

import { useTranslations } from 'next-intl';
import { useEffect } from 'react';
import { readStoredFilters } from '@/lib/storage';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { selectProductFilters, selectProductTypes, selectSpecifications } from '@/store/selectors';
import {
  emptyFilters,
  filtersRestored,
  specificationFilterChanged,
  typeFilterChanged,
} from '@/store/slices/productsSlice';

export default function ProductsFilter() {
  const t = useTranslations('products');
  const dispatch = useAppDispatch();
  const filters = useAppSelector(selectProductFilters);
  const types = useAppSelector(selectProductTypes);
  const specifications = useAppSelector(selectSpecifications);

  // Restore filters from localStorage after hydration (the server has no access to it).
  useEffect(() => {
    const stored = readStoredFilters();
    if (stored && (stored.type === '' || types.includes(stored.type))) {
      dispatch(filtersRestored(stored));
    }
    // Only on mount: later changes are written by the listener middleware.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const typeLabel = (type: string) => (t.has(`types.${type}`) ? t(`types.${type}`) : type);
  const isFiltered = filters.type !== '' || filters.specification !== '';

  return (
    <div className="products-filter">
      <label className="products-filter__field">
        <span className="products-filter__label">{t('type')}:</span>
        <select
          className="form-select form-select-sm products-filter__select"
          value={filters.type}
          onChange={(event) => dispatch(typeFilterChanged(event.target.value))}
        >
          <option value="">{t('all')}</option>
          {types.map((type) => (
            <option key={type} value={type}>
              {typeLabel(type)}
            </option>
          ))}
        </select>
      </label>

      <label className="products-filter__field">
        <span className="products-filter__label">{t('specification')}:</span>
        <select
          className="form-select form-select-sm products-filter__select"
          value={specifications.includes(filters.specification) ? filters.specification : ''}
          onChange={(event) => dispatch(specificationFilterChanged(event.target.value))}
        >
          <option value="">{t('all')}</option>
          {specifications.map((specification) => (
            <option key={specification} value={specification}>
              {specification}
            </option>
          ))}
        </select>
      </label>

      {isFiltered && (
        <button
          type="button"
          className="btn btn-link btn-sm products-filter__reset"
          onClick={() => dispatch(filtersRestored(emptyFilters))}
        >
          {t('reset')}
        </button>
      )}
    </div>
  );
}
