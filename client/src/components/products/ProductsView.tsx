'use client';

import { AnimatePresence } from 'motion/react';
import dynamic from 'next/dynamic';
import { useTranslations } from 'next-intl';
import PageHeader from '@/components/ui/PageHeader';
import { useAppSelector } from '@/store/hooks';
import { selectFilteredProducts, selectOrderTitles, selectTypeCounts } from '@/store/selectors';
import ProductRow from './ProductRow';
import ProductsFilter from './ProductsFilter';

// Lazy loading: recharts is downloaded as a separate chunk, only in the browser.
const TypesChart = dynamic(() => import('./TypesChart'), {
  ssr: false,
  loading: () => <div className="types-chart types-chart--loading" aria-hidden />,
});

export default function ProductsView() {
  const t = useTranslations('products');
  const products = useAppSelector(selectFilteredProducts);
  const orderTitles = useAppSelector(selectOrderTitles);
  const typeCounts = useAppSelector(selectTypeCounts);

  const chartData = typeCounts.map(({ type, count }) => ({ label: type, value: count }));

  return (
    <section className="products">
      <PageHeader title={t('title')} count={products.length}>
        <ProductsFilter />
      </PageHeader>

      {chartData.length > 0 && (
        <article className="panel products__chart">
          <h2 className="panel__title">{t('byType')}</h2>
          <TypesChart data={chartData} valueLabel={t('count')} />
        </article>
      )}

      <ul className="products__list">
        <AnimatePresence initial={false} mode="popLayout">
          {products.map((product, index) => (
            <ProductRow key={product.id} product={product} index={index} orderTitle={orderTitles.get(product.order)} />
          ))}
        </AnimatePresence>
      </ul>
      {products.length === 0 && <p className="empty-state">{t('empty')}</p>}
    </section>
  );
}
