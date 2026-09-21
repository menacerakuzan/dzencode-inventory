'use client';

import { AnimatePresence } from 'motion/react';
import { useTranslations } from 'next-intl';
import PageHeader from '@/components/ui/PageHeader';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { selectFilteredProducts, selectOrderTitles } from '@/store/selectors';
import { productFormOpened } from '@/store/slices/uiSlice';
import ProductRow from './ProductRow';
import ProductsFilter from './ProductsFilter';

export default function ProductsView() {
  const t = useTranslations('products');
  const dispatch = useAppDispatch();
  const products = useAppSelector(selectFilteredProducts);
  const orderTitles = useAppSelector(selectOrderTitles);

  return (
    <section className="products">
      <PageHeader
        title={t('title')}
        count={products.length}
        addLabel={t('add')}
        onAdd={() => dispatch(productFormOpened(undefined))}
      >
        <ProductsFilter />
      </PageHeader>

      <div className="products__scroller">
        <ul className="products__list">
          <AnimatePresence initial={false} mode="popLayout">
            {products.map((product, index) => (
              <ProductRow
                key={product.id}
                product={product}
                index={index}
                orderTitle={orderTitles.get(product.order)}
              />
            ))}
          </AnimatePresence>
        </ul>
        {products.length === 0 && <p className="empty-state">{t('empty')}</p>}
      </div>
    </section>
  );
}
