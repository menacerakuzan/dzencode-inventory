'use client';

import { useTranslations } from 'next-intl';
import { useId, useState } from 'react';
import ProductItem from '@/components/products/ProductItem';
import Modal from '@/components/ui/Modal';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { selectProductsByOrderId } from '@/store/selectors';
import { deleteOrder } from '@/store/slices/ordersSlice';
import { deleteProduct } from '@/store/slices/productsSlice';
import { deleteDismissed, type DeleteTarget } from '@/store/slices/uiSlice';

export default function ConfirmDeleteModal({ target }: { target: DeleteTarget }) {
  const t = useTranslations('deleteModal');
  const tc = useTranslations('common');
  const dispatch = useAppDispatch();
  const titleId = useId();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const order = useAppSelector((state) =>
    target.kind === 'order' ? state.orders.items.find((o) => o.id === target.id) : undefined,
  );
  const product = useAppSelector((state) =>
    target.kind === 'product' ? state.products.items.find((p) => p.id === target.id) : undefined,
  );
  const orderProducts = useAppSelector(selectProductsByOrderId).get(target.id);
  const products = target.kind === 'order' ? (orderProducts ?? []) : product ? [product] : [];

  const close = () => dispatch(deleteDismissed());

  const confirm = async () => {
    setPending(true);
    setError(null);
    const result =
      target.kind === 'order' ? await dispatch(deleteOrder(target.id)) : await dispatch(deleteProduct(target.id));
    setPending(false);

    if (result.meta.requestStatus === 'fulfilled') {
      close();
    } else {
      setError(tc('actionFailed', { message: String(result.payload ?? '') }));
    }
  };

  return (
    <Modal titleId={titleId} onClose={close} className="confirm-modal">
      <div className="confirm-modal__header">
        <h2 id={titleId} className="confirm-modal__title">
          {t(target.kind)}
        </h2>
        {order && <p className="confirm-modal__subtitle">{order.title}</p>}
      </div>

      {products.length > 0 && (
        <ul className="confirm-modal__products">
          {products.map((item) => (
            <ProductItem key={item.id} product={item} showStatus={false} />
          ))}
        </ul>
      )}
      {order && products.length > 0 && (
        <p className="confirm-modal__hint">{t('orderProducts', { count: products.length })}</p>
      )}
      {error && (
        <p className="confirm-modal__error" role="alert">
          {error}
        </p>
      )}

      <div className="confirm-modal__footer">
        <button type="button" className="confirm-modal__cancel" onClick={close}>
          {t('cancel')}
        </button>
        <button type="button" className="confirm-modal__confirm" onClick={confirm} disabled={pending}>
          {pending ? (
            <span className="spinner-border spinner-border-sm" aria-hidden />
          ) : (
            <i className="bi bi-trash3-fill" aria-hidden />
          )}
          {t('confirm')}
        </button>
      </div>
    </Modal>
  );
}
