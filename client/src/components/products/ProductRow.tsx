'use client';

import { motion } from 'motion/react';
import Image from 'next/image';
import Link from 'next/link';
import { useLocale, useTranslations } from 'next-intl';
import DateStack from '@/components/ui/DateStack';
import PriceStack from '@/components/ui/PriceStack';
import { cn } from '@/lib/cn';
import { formatNumericDate, formatShortTextDate } from '@/lib/format';
import { useAppDispatch } from '@/store/hooks';
import { deleteRequested } from '@/store/slices/uiSlice';
import type { Product } from '@/types';

interface Props {
  product: Product;
  orderTitle: string | undefined;
  index: number;
}

export default function ProductRow({ product, orderTitle, index }: Props) {
  const t = useTranslations('products');
  const locale = useLocale();
  const dispatch = useAppDispatch();
  const typeLabel = t.has(`types.${product.type}`) ? t(`types.${product.type}`) : product.type;

  return (
    <motion.li
      layout="position"
      className="product-row"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0, transition: { delay: Math.min(index, 12) * 0.025 } }}
      exit={{ opacity: 0, x: -32, transition: { duration: 0.2 } }}
    >
      <span className={cn('status-dot', `status-dot--${product.status}`)} aria-hidden />
      <Image
        className="product-row__photo"
        src={product.photo ?? '/products/default.svg'}
        alt=""
        width={48}
        height={36}
        unoptimized
      />
      <div className="product-row__info">
        <span className="product-row__title" title={product.title}>{product.title}</span>
        <span className="product-row__serial">{product.serialNumber}</span>
      </div>
      <span className="product-row__state">
        <span className={cn('product-status', `product-status--${product.status}`)}>
          {t(`status.${product.status}`)}
        </span>
        <span className="product-row__condition">{t(product.isNew ? 'condition.new' : 'condition.used')}</span>
      </span>
      <span className="product-row__guarantee">
        {(['start', 'end'] as const).map((edge) => (
          <span key={edge} className="product-row__guarantee-line">
            <span className="product-row__muted">{t(edge === 'start' ? 'from' : 'to')}</span>{' '}
            {formatNumericDate(product.guarantee[edge])}{' '}
            <span className="product-row__muted">{formatShortTextDate(product.guarantee[edge], locale)}</span>
          </span>
        ))}
      </span>
      <PriceStack className="product-row__price" prices={product.price} />
      <span className="product-row__type">
        <span className="product-row__type-name">{typeLabel}</span>
        <span className="product-row__spec" title={product.specification}>{product.specification}</span>
      </span>
      <span className="product-row__order">
        {orderTitle ? (
          <Link href={`/orders?order=${product.order}`} className="link-underline product-row__order-link" title={orderTitle}>
            {orderTitle}
          </Link>
        ) : (
          '—'
        )}
      </span>
      <DateStack className="product-row__date" date={product.date} />
      <button
        type="button"
        className="icon-button product-row__delete"
        onClick={() => dispatch(deleteRequested({ kind: 'product', id: product.id }))}
        aria-label={t('delete')}
      >
        <i className="bi bi-trash3-fill" aria-hidden />
      </button>
    </motion.li>
  );
}
