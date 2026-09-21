'use client';

import { motion } from 'motion/react';
import dynamic from 'next/dynamic';
import { useTranslations } from 'next-intl';
import { useMemo } from 'react';
import { formatAmount } from '@/lib/format';
import { useAppSelector } from '@/store/hooks';
import { selectOrderSummaries, selectProducts, selectWarehouses } from '@/store/selectors';

const ChartSkeleton = () => <div className="chart-skeleton" aria-hidden />;

// Lazy loading: recharts and leaflet are split into separate chunks and loaded in the browser only.
const BarChartCard = dynamic(() => import('./BarChartCard'), { ssr: false, loading: ChartSkeleton });
const WarehousesMap = dynamic(() => import('./WarehousesMap'), { ssr: false, loading: ChartSkeleton });

export default function StatsView() {
  const t = useTranslations('stats');
  const tp = useTranslations('products');
  const orders = useAppSelector(selectOrderSummaries);
  const products = useAppSelector(selectProducts);
  const warehouses = useAppSelector(selectWarehouses);

  const byType = useMemo(() => {
    const counts = new Map<string, number>();
    for (const product of products) counts.set(product.type, (counts.get(product.type) ?? 0) + 1);
    return [...counts]
      .map(([type, value]) => ({ label: tp.has(`types.${type}`) ? tp(`types.${type}`) : type, value }))
      .sort((a, b) => b.value - a.value);
  }, [products, tp]);

  const byOrder = useMemo(
    () =>
      orders
        .map((order) => ({ label: order.title, value: order.totals.UAH }))
        .sort((a, b) => b.value - a.value),
    [orders],
  );

  const points = useMemo(
    () =>
      warehouses.map((warehouse) => {
        const own = orders.filter((order) => order.warehouseId === warehouse.id);
        return {
          ...warehouse,
          ordersCount: own.length,
          totalUah: own.reduce((sum, order) => sum + order.totals.UAH, 0),
        };
      }),
    [warehouses, orders],
  );

  const tiles = [
    { label: t('orders'), value: String(orders.length), icon: 'bi-box-seam' },
    { label: t('products'), value: String(products.length), icon: 'bi-display' },
    {
      label: t('totalUah'),
      value: formatAmount(orders.reduce((sum, order) => sum + order.totals.UAH, 0)),
      icon: 'bi-cash-stack',
    },
    {
      label: t('inRepair'),
      value: String(products.filter((product) => product.status === 'repair').length),
      icon: 'bi-tools',
    },
  ];

  return (
    <section className="stats">
      <div className="page-header">
        <h1 className="page-header__title">{t('title')}</h1>
      </div>

      <ul className="stats__tiles">
        {tiles.map((tile, index) => (
          <motion.li
            key={tile.label}
            className="stat-tile"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0, transition: { delay: index * 0.05 } }}
          >
            <i className={`bi ${tile.icon} stat-tile__icon`} aria-hidden />
            <span className="stat-tile__value">{tile.value}</span>
            <span className="stat-tile__label">{tile.label}</span>
          </motion.li>
        ))}
      </ul>

      <div className="stats__grid">
        <article className="panel">
          <h2 className="panel__title">{t('byType')}</h2>
          {byType.length ? (
            <BarChartCard data={byType} valueLabel={t('products')} />
          ) : (
            <p className="empty-state">{t('noData')}</p>
          )}
        </article>
        <article className="panel">
          <h2 className="panel__title">{t('byOrder')}</h2>
          {byOrder.length ? (
            <BarChartCard data={byOrder} valueLabel={t('totalUah')} formatValue={formatAmount} />
          ) : (
            <p className="empty-state">{t('noData')}</p>
          )}
        </article>
        <article className="panel panel--wide">
          <h2 className="panel__title">{t('map')}</h2>
          <WarehousesMap points={points} />
        </article>
      </div>
    </section>
  );
}
