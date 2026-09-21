'use client';

import { motion } from 'motion/react';
import Image from 'next/image';
import { useTranslations } from 'next-intl';
import { cn } from '@/lib/cn';
import type { Product } from '@/types';

interface Props {
  product: Product;
  showStatus?: boolean;
  onDelete?: () => void;
}

/** Compact product row used in the order details panel and in the delete confirmation. */
export default function ProductItem({ product, showStatus = true, onDelete }: Props) {
  const t = useTranslations('products');

  return (
    <motion.li
      layout="position"
      className="product-item"
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: 24, transition: { duration: 0.2 } }}
    >
      <span className={cn('status-dot', `status-dot--${product.status}`)} aria-hidden />
      <Image
        className="product-item__photo"
        src={product.photo ?? '/products/default.svg'}
        alt=""
        width={48}
        height={36}
        unoptimized
      />
      <div className="product-item__info">
        <span className="product-item__title">{product.title}</span>
        <span className="product-item__serial">{product.serialNumber}</span>
      </div>
      {showStatus && (
        <span className={cn('product-status', `product-status--${product.status}`)}>
          {t(`status.${product.status}`)}
        </span>
      )}
      {onDelete && (
        <button type="button" className="icon-button product-item__delete" onClick={onDelete} aria-label={t('delete')}>
          <i className="bi bi-trash3-fill" aria-hidden />
        </button>
      )}
    </motion.li>
  );
}
