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
  const orderForm = useAppSelector((state) => state.ui.orderForm);
  const productForm = useAppSelector((state) => state.ui.productForm);

  return (
    <AnimatePresence>
      {deleteTarget && <ConfirmDeleteModal key="delete" target={deleteTarget} />}
      {orderForm && <OrderFormModal key="order-form" id={orderForm.id} />}
      {productForm && <ProductFormModal key="product-form" {...productForm} />}
    </AnimatePresence>
  );
}
