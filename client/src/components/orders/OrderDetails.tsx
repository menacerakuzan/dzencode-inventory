'use client';

import { AnimatePresence, motion } from 'motion/react';
import dynamic from 'next/dynamic';
import { useTranslations } from 'next-intl';
import { useEffect, useRef } from 'react';
import ProductItem from '@/components/products/ProductItem';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { selectProductsByOrderId, selectWarehouses } from '@/store/selectors';
import { orderSelected } from '@/store/slices/ordersSlice';
import { deleteRequested, productFormOpened } from '@/store/slices/uiSlice';
import type { OrderSummary } from '@/types';

const EMPTY: never[] = [];

// Lazy loading: leaflet is downloaded only when an order with a warehouse is opened.
const WarehouseMap = dynamic(() => import('./WarehouseMap'), {
  ssr: false,
  loading: () => <div className="warehouse-map warehouse-map--loading" aria-hidden />,
});

export default function OrderDetails({ order }: { order: OrderSummary }) {
  const t = useTranslations('orders');
  const tc = useTranslations('common');
  const dispatch = useAppDispatch();
  const products = useAppSelector(selectProductsByOrderId).get(order.id) ?? EMPTY;
  const warehouse = useAppSelector(selectWarehouses).find((w) => w.id === order.warehouseId);
  const sectionRef = useRef<HTMLElement>(null);

  // On narrow screens the panel is rendered above the list, so bring it into view.
  useEffect(() => {
    if (window.matchMedia?.('(max-width: 991.98px)').matches) {
      sectionRef.current?.scrollIntoView?.({ behavior: 'smooth', block: 'start' });
    }
  }, []);

  return (
    <motion.section
      ref={sectionRef}
      className="order-details"
      aria-label={t('details')}
      initial={{ opacity: 0, x: 48 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 48, transition: { duration: 0.18 } }}
      transition={{ type: 'spring', stiffness: 320, damping: 32 }}
    >
      <button
        type="button"
        className="round-button order-details__close"
        onClick={() => dispatch(orderSelected(null))}
        aria-label={tc('close')}
      >
        <i className="bi bi-x-lg" aria-hidden />
      </button>

      <header className="order-details__header">
        <h2 className="order-details__title">{order.title}</h2>
        {(warehouse || order.description) && (
          <p className="order-details__meta">
            {warehouse && (
              <span className="order-details__warehouse">
                <i className="bi bi-geo-alt-fill" aria-hidden /> {warehouse.name}, {warehouse.city}
              </span>
            )}
            {order.description && <span className="order-details__description">{order.description}</span>}
          </p>
        )}
        {warehouse && <WarehouseMap key={warehouse.id} warehouse={warehouse} />}
        <button type="button" className="add-link" onClick={() => dispatch(productFormOpened(order.id))}>
          <span className="add-link__icon" aria-hidden>
            <i className="bi bi-plus" />
          </span>
          {t('addProduct')}
        </button>
      </header>

      {products.length > 0 ? (
        <ul className="order-details__products">
          <AnimatePresence initial={false}>
            {products.map((product) => (
              <ProductItem
                key={product.id}
                product={product}
                onDelete={() => dispatch(deleteRequested({ kind: 'product', id: product.id }))}
              />
            ))}
          </AnimatePresence>
        </ul>
      ) : (
        <p className="empty-state order-details__empty">{t('emptyProducts')}</p>
      )}
    </motion.section>
  );
}
