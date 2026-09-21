'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslations } from 'next-intl';
import { useId, useState } from 'react';
import { useForm } from 'react-hook-form';
import FormField, { fieldProps } from '@/components/ui/FormField';
import Modal from '@/components/ui/Modal';
import { cn } from '@/lib/cn';
import { toSqlDateTime } from '@/lib/format';
import { productFormSchema, type ProductFormValues } from '@/lib/validation';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { selectOrders, selectProductTypes } from '@/store/selectors';
import { createProduct } from '@/store/slices/productsSlice';
import { productFormClosed } from '@/store/slices/uiSlice';

const today = () => toSqlDateTime(new Date()).slice(0, 10);
const inYears = (years: number) => {
  const date = new Date();
  date.setFullYear(date.getFullYear() + years);
  return toSqlDateTime(date).slice(0, 10);
};

export default function ProductFormModal({ orderId }: { orderId: number | null }) {
  const t = useTranslations('productForm');
  const tp = useTranslations('products');
  const tc = useTranslations('common');
  const dispatch = useAppDispatch();
  const orders = useAppSelector(selectOrders);
  const types = useAppSelector(selectProductTypes);
  const titleId = useId();
  // Prices start empty (undefined), not NaN, so number inputs render blank.
  const [defaults] = useState<Partial<ProductFormValues>>(() => ({
    order: orderId ? String(orderId) : '',
    title: '',
    serialNumber: '',
    type: '',
    specification: '',
    status: 'free',
    condition: 'new',
    guaranteeStart: today(),
    guaranteeEnd: inYears(1),
  }));

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ProductFormValues>({
    resolver: zodResolver(productFormSchema),
    mode: 'onTouched',
    defaultValues: defaults,
  });

  const close = () => dispatch(productFormClosed());

  const onSubmit = handleSubmit(async (values) => {
    const result = await dispatch(
      createProduct({
        order: Number(values.order),
        title: values.title,
        serialNumber: values.serialNumber,
        type: values.type,
        specification: values.specification,
        status: values.status,
        isNew: values.condition === 'new',
        guarantee: { start: `${values.guaranteeStart} 00:00:00`, end: `${values.guaranteeEnd} 23:59:59` },
        price: [
          { value: values.priceUsd, symbol: 'USD', isDefault: false },
          { value: values.priceUah, symbol: 'UAH', isDefault: true },
        ],
      }),
    );
    if (createProduct.fulfilled.match(result)) close();
  });

  const control = (name: keyof ProductFormValues) => cn(errors[name] && 'is-invalid');

  return (
    <Modal titleId={titleId} onClose={close} className="form-modal form-modal--wide">
      <form onSubmit={onSubmit} noValidate>
        <h2 id={titleId} className="form-modal__title">
          {t('title')}
        </h2>

        <div className="form-modal__body">
          <FormField id="product-order" label={t('order')} error={errors.order?.message}>
            <select
              {...fieldProps('product-order', errors.order?.message)}
              {...register('order')}
              className={cn('form-select', control('order'))}
            >
              <option value="">{tc('notSelected')}</option>
              {orders.map((order) => (
                <option key={order.id} value={order.id}>
                  {order.title}
                </option>
              ))}
            </select>
          </FormField>

          <div className="form-modal__row">
            <FormField id="product-title" label={t('name')} error={errors.title?.message}>
              <input
                {...fieldProps('product-title', errors.title?.message)}
                {...register('title')}
                className={cn('form-control', control('title'))}
                autoFocus
              />
            </FormField>
            <FormField id="product-serial" label={t('serialNumber')} error={errors.serialNumber?.message}>
              <input
                {...fieldProps('product-serial', errors.serialNumber?.message)}
                {...register('serialNumber')}
                className={cn('form-control', control('serialNumber'))}
                placeholder="SN-12.3456789"
              />
            </FormField>
          </div>

          <div className="form-modal__row">
            <FormField id="product-type" label={t('type')} error={errors.type?.message}>
              <input
                list="product-types"
                {...fieldProps('product-type', errors.type?.message)}
                {...register('type')}
                className={cn('form-control', control('type'))}
              />
              <datalist id="product-types">
                {types.map((type) => (
                  <option key={type} value={type} />
                ))}
              </datalist>
            </FormField>
            <FormField id="product-spec" label={t('specification')} error={errors.specification?.message}>
              <input
                {...fieldProps('product-spec', errors.specification?.message)}
                {...register('specification')}
                className={cn('form-control', control('specification'))}
              />
            </FormField>
          </div>

          <div className="form-modal__row">
            <FormField id="product-status" label={t('status')}>
              <select id="product-status" {...register('status')} className="form-select">
                <option value="free">{tp('status.free')}</option>
                <option value="repair">{tp('status.repair')}</option>
              </select>
            </FormField>
            <FormField id="product-condition" label={t('condition')}>
              <select id="product-condition" {...register('condition')} className="form-select">
                <option value="new">{tp('condition.new')}</option>
                <option value="used">{tp('condition.used')}</option>
              </select>
            </FormField>
          </div>

          <div className="form-modal__row">
            <FormField id="product-g-start" label={t('guaranteeStart')} error={errors.guaranteeStart?.message}>
              <input
                type="date"
                {...fieldProps('product-g-start', errors.guaranteeStart?.message)}
                {...register('guaranteeStart', { deps: ['guaranteeEnd'] })}
                className={cn('form-control', control('guaranteeStart'))}
              />
            </FormField>
            <FormField id="product-g-end" label={t('guaranteeEnd')} error={errors.guaranteeEnd?.message}>
              <input
                type="date"
                {...fieldProps('product-g-end', errors.guaranteeEnd?.message)}
                {...register('guaranteeEnd')}
                className={cn('form-control', control('guaranteeEnd'))}
              />
            </FormField>
          </div>

          <div className="form-modal__row">
            <FormField id="product-usd" label={t('priceUsd')} error={errors.priceUsd?.message}>
              <input
                type="number"
                min="0"
                step="0.01"
                inputMode="decimal"
                {...fieldProps('product-usd', errors.priceUsd?.message)}
                {...register('priceUsd', { valueAsNumber: true })}
                className={cn('form-control', control('priceUsd'))}
              />
            </FormField>
            <FormField id="product-uah" label={t('priceUah')} error={errors.priceUah?.message}>
              <input
                type="number"
                min="0"
                step="0.01"
                inputMode="decimal"
                {...fieldProps('product-uah', errors.priceUah?.message)}
                {...register('priceUah', { valueAsNumber: true })}
                className={cn('form-control', control('priceUah'))}
              />
            </FormField>
          </div>
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
