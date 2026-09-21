'use client';

import { AnimatePresence, LayoutGroup, motion } from 'motion/react';
import { useTranslations } from 'next-intl';
import { useEffect } from 'react';
import PageHeader from '@/components/ui/PageHeader';
import { cn } from '@/lib/cn';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { selectSearch, selectSelectedOrder, selectVisibleOrders } from '@/store/selectors';
import { orderFormToggled } from '@/store/slices/uiSlice';
import OrderCard from './OrderCard';
import OrderDetails from './OrderDetails';

export default function OrdersView() {
  const t = useTranslations('orders');
  const dispatch = useAppDispatch();
  const orders = useAppSelector(selectVisibleOrders);
  const total = useAppSelector((state) => state.orders.items.length);
  const selected = useAppSelector(selectSelectedOrder);
  const search = useAppSelector(selectSearch);
  const selectedId = selected?.id ?? null;

  // Keep ?order=ID in the address bar so an opened order can be shared or restored after reload.
  useEffect(() => {
    const url = new URL(window.location.href);
    if (selectedId === null) url.searchParams.delete('order');
    else url.searchParams.set('order', String(selectedId));
    window.history.replaceState(window.history.state, '', url);
  }, [selectedId]);

  return (
    <section className="orders">
      <PageHeader
        title={t('title')}
        count={total}
        addLabel={t('add')}
        onAdd={() => dispatch(orderFormToggled(true))}
      />

      <LayoutGroup>
        <div className={cn('orders__layout', selected && 'orders__layout--split')}>
          <motion.ul layout className="orders__list">
            <AnimatePresence initial={false} mode="popLayout">
              {orders.map((order, index) => (
                <OrderCard
                  key={order.id}
                  order={order}
                  index={index}
                  compact={selected !== null}
                  active={order.id === selectedId}
                />
              ))}
            </AnimatePresence>
            {orders.length === 0 && (
              <li className="empty-state">{search ? t('noMatches', { query: search }) : t('empty')}</li>
            )}
          </motion.ul>

          <AnimatePresence mode="wait">
            {selected && <OrderDetails key={selected.id} order={selected} />}
          </AnimatePresence>
        </div>
      </LayoutGroup>
    </section>
  );
}
