'use client';

import { motion } from 'motion/react';
import { useTranslations } from 'next-intl';
import DateStack from '@/components/ui/DateStack';
import PriceStack from '@/components/ui/PriceStack';
import { cn } from '@/lib/cn';
import { totalsToPrices } from '@/lib/format';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { selectSettings } from '@/store/selectors';
import { orderSelected } from '@/store/slices/ordersSlice';
import { deleteRequested, orderFormOpened } from '@/store/slices/uiSlice';
import type { OrderSummary } from '@/types';

interface Props {
  order: OrderSummary;
  compact: boolean;
  active: boolean;
  index: number;
}

export default function OrderCard({ order, compact, active, index }: Props) {
  const t = useTranslations('orders');
  const dispatch = useAppDispatch();
  const { currencies, defaultCurrency } = useAppSelector(selectSettings);

  return (
    <motion.li
      layout
      className={cn('order-card', compact && 'order-card--compact', active && 'order-card--active')}
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0, transition: { delay: Math.min(index, 10) * 0.035 } }}
      exit={{ opacity: 0, x: -40, transition: { duration: 0.2 } }}
      transition={{ layout: { type: 'spring', stiffness: 420, damping: 38 } }}
    >
      <button
        type="button"
        className="order-card__main"
        onClick={() => dispatch(orderSelected(active ? null : order.id))}
        aria-expanded={active}
        aria-label={t('open', { title: order.title })}
      >
        {!compact && <span className="order-card__title">{order.title}</span>}
        <span className="order-card__icon" aria-hidden>
          <i className="bi bi-list-ul" />
        </span>
        <span className="order-card__count">
          <span className="order-card__count-value">{order.productsCount}</span>
          <span className="order-card__count-label">{t('productsCount', { count: order.productsCount })}</span>
        </span>
        <DateStack className="order-card__date" date={order.date} />
        {!compact && <PriceStack className="order-card__price" prices={totalsToPrices(order.totals, currencies, defaultCurrency)} />}
      </button>

      {!compact && (
        <span className="order-card__actions">
          <button
            type="button"
            className="icon-button icon-button--edit"
            onClick={() => dispatch(orderFormOpened({ id: order.id }))}
            aria-label={t('edit')}
            title={t('edit')}
          >
            <i className="bi bi-pencil-fill" aria-hidden />
          </button>
          <button
            type="button"
            className="icon-button"
            onClick={() => dispatch(deleteRequested({ kind: 'order', id: order.id }))}
            aria-label={t('delete')}
            title={t('delete')}
          >
            <i className="bi bi-trash3-fill" aria-hidden />
          </button>
        </span>
      )}

      {active && (
        <motion.span
          className="order-card__arrow"
          aria-hidden
          initial={{ opacity: 0, x: -8 }}
          animate={{ opacity: 1, x: 0 }}
        >
          <i className="bi bi-chevron-right" />
        </motion.span>
      )}
    </motion.li>
  );
}
