'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslations } from 'next-intl';
import { useId, useState } from 'react';
import { useForm } from 'react-hook-form';
import FormField, { fieldProps } from '@/components/ui/FormField';
import Modal from '@/components/ui/Modal';
import { cn } from '@/lib/cn';
import { toDateTimeLocal } from '@/lib/format';
import { orderFormSchema, type OrderFormValues } from '@/lib/validation';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { selectWarehouses } from '@/store/selectors';
import { createOrder, orderSelected, updateOrder } from '@/store/slices/ordersSlice';
import { orderFormClosed } from '@/store/slices/uiSlice';
import type { Order } from '@/types';

const toFormValues = (order: Order | undefined): OrderFormValues => ({
  title: order?.title ?? '',
  // API date "YYYY-MM-DD HH:mm:ss" -> datetime-local "YYYY-MM-DDTHH:mm"
  date: order ? order.date.slice(0, 16).replace(' ', 'T') : toDateTimeLocal(new Date()),
  warehouseId: order?.warehouseId ? String(order.warehouseId) : '',
  description: order?.description ?? '',
});

/** Creates a new order (`id: null`) or edits an existing one. */
export default function OrderFormModal({ id }: { id: number | null }) {
  const t = useTranslations('orderForm');
  const tc = useTranslations('common');
  const dispatch = useAppDispatch();
  const warehouses = useAppSelector(selectWarehouses);
  const existing = useAppSelector((state) => state.orders.items.find((order) => order.id === id));
  const titleId = useId();
  const [defaultValues] = useState(() => toFormValues(existing));

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<OrderFormValues>({
    resolver: zodResolver(orderFormSchema),
    mode: 'onSubmit',
    reValidateMode: 'onChange',
    defaultValues,
  });

  const close = () => dispatch(orderFormClosed());

  const onSubmit = handleSubmit(async (values) => {
    const order = {
      title: values.title,
      description: values.description,
      date: values.date,
      warehouseId: values.warehouseId ? Number(values.warehouseId) : null,
    };
    const result = id === null ? await dispatch(createOrder(order)) : await dispatch(updateOrder({ id, order }));

    if (result.meta.requestStatus === 'fulfilled') {
      if (id === null && createOrder.fulfilled.match(result)) dispatch(orderSelected(result.payload.id));
      close();
    } else {
      setError('root', { message: tc('actionFailed', { message: String(result.payload ?? '') }) });
    }
  });

  return (
    <Modal titleId={titleId} onClose={close} className="form-modal">
      <form onSubmit={onSubmit} noValidate>
        <h2 id={titleId} className="form-modal__title">
          {t(id === null ? 'title' : 'editTitle')}
        </h2>

        <div className="form-modal__body">
          <FormField id="order-title" label={t('name')} error={errors.title?.message}>
            <input
              {...fieldProps('order-title', errors.title?.message)}
              {...register('title')}
              className={cn('form-control', errors.title && 'is-invalid')}
              placeholder={t('namePlaceholder')}
              autoFocus
            />
          </FormField>

          <div className="form-modal__row">
            <FormField id="order-date" label={t('date')} error={errors.date?.message}>
              <input
                type="datetime-local"
                {...fieldProps('order-date', errors.date?.message)}
                {...register('date')}
                className={cn('form-control', errors.date && 'is-invalid')}
              />
            </FormField>

            <FormField id="order-warehouse" label={t('warehouse')}>
              <select id="order-warehouse" {...register('warehouseId')} className="form-select">
                <option value="">{tc('notSelected')}</option>
                {warehouses.map((warehouse) => (
                  <option key={warehouse.id} value={warehouse.id}>
                    {warehouse.name}, {warehouse.city}
                  </option>
                ))}
              </select>
            </FormField>
          </div>

          <FormField id="order-description" label={t('description')} error={errors.description?.message}>
            <textarea
              rows={3}
              {...fieldProps('order-description', errors.description?.message)}
              {...register('description')}
              className={cn('form-control', errors.description && 'is-invalid')}
            />
          </FormField>

          {errors.root && (
            <div className="alert alert-danger py-2 mb-0" role="alert">
              {errors.root.message}
            </div>
          )}
        </div>

        <div className="form-modal__footer">
          <button type="button" className="btn btn-link form-modal__cancel" onClick={close}>
            {tc('cancel')}
          </button>
          <button type="submit" className="btn btn-success form-modal__submit" disabled={isSubmitting}>
            {isSubmitting && <span className="spinner-border spinner-border-sm me-2" aria-hidden />}
            {t(id === null ? 'submit' : 'save')}
          </button>
        </div>
      </form>
    </Modal>
  );
}
