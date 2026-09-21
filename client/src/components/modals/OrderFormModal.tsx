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
import { createOrder, orderSelected } from '@/store/slices/ordersSlice';
import { orderFormToggled } from '@/store/slices/uiSlice';

export default function OrderFormModal() {
  const t = useTranslations('orderForm');
  const tc = useTranslations('common');
  const dispatch = useAppDispatch();
  const warehouses = useAppSelector(selectWarehouses);
  const titleId = useId();
  const [defaultDate] = useState(() => toDateTimeLocal(new Date()));

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<OrderFormValues>({
    resolver: zodResolver(orderFormSchema),
    mode: 'onTouched',
    defaultValues: { title: '', date: defaultDate, warehouseId: '', description: '' },
  });

  const close = () => dispatch(orderFormToggled(false));

  const onSubmit = handleSubmit(async (values) => {
    const result = await dispatch(
      createOrder({
        title: values.title,
        description: values.description,
        date: values.date,
        warehouseId: values.warehouseId ? Number(values.warehouseId) : null,
      }),
    );
    if (createOrder.fulfilled.match(result)) {
      dispatch(orderSelected(result.payload.id));
      close();
    }
  });

  return (
    <Modal titleId={titleId} onClose={close} className="form-modal">
      <form onSubmit={onSubmit} noValidate>
        <h2 id={titleId} className="form-modal__title">
          {t('title')}
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
        </div>

        <div className="form-modal__footer">
          <button type="button" className="btn btn-link form-modal__cancel" onClick={close}>
            {tc('cancel')}
          </button>
          <button type="submit" className="btn btn-success form-modal__submit" disabled={isSubmitting}>
            {isSubmitting && <span className="spinner-border spinner-border-sm me-2" aria-hidden />}
            {t('submit')}
          </button>
        </div>
      </form>
    </Modal>
  );
}
