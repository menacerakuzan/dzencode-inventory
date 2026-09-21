'use client';

import { AnimatePresence } from 'motion/react';
import dynamic from 'next/dynamic';
import { useAppSelector } from '@/store/hooks';

// Lazy loading: modal code (forms, validation) is downloaded only when a modal is opened.
const ConfirmDeleteModal = dynamic(() => import('@/components/modals/ConfirmDeleteModal'), { ssr: false });
const OrderFormModal = dynamic(() => import('@/components/modals/OrderFormModal'), { ssr: false });
const ProductFormModal = dynamic(() => import('@/components/modals/ProductFormModal'), { ssr: false });

export default function ModalsHost() {
  const deleteTarget = useAppSelector((state) => state.ui.deleteTarget);
  const orderFormOpen = useAppSelector((state) => state.ui.orderFormOpen);
  const productFormOrderId = useAppSelector((state) => state.ui.productFormOrderId);

  return (
    <AnimatePresence>
      {deleteTarget && <ConfirmDeleteModal key="delete" target={deleteTarget} />}
      {orderFormOpen && <OrderFormModal key="order-form" />}
      {productFormOrderId !== null && <ProductFormModal key="product-form" orderId={productFormOrderId || null} />}
    </AnimatePresence>
  );
}
