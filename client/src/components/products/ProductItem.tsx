'use client';

import { motion } from 'motion/react';
import Image from 'next/image';
import { useTranslations } from 'next-intl';
import { cn } from '@/lib/cn';
import type { Product } from '@/types';

interface Props {
  product: Product;
  showStatus?: boolean;
  onEdit?: () => void;
  onDelete?: () => void;
}

/** Compact product row used in the order details panel and in the delete confirmation. */
export default function ProductItem({ product, showStatus = true, onEdit, onDelete }: Props) {
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
      {product.photo ? (
        <Image className="product-item__photo" src={product.photo} alt="" width={48} height={36} unoptimized />
      ) : (
        <span className="product-item__photo photo-placeholder" aria-hidden>
          <i className="bi bi-image" />
        </span>
      )}
      <div className="product-item__info">
        <span className="product-item__title">{product.title}</span>
        <span className="product-item__serial">{product.serialNumber}</span>
      </div>
      {showStatus && (
        <span className={cn('product-status', `product-status--${product.status}`)}>
          {t(`status.${product.status}`)}
        </span>
      )}
      {(onEdit || onDelete) && (
        <span className="product-item__actions">
          {onEdit && (
            <button
              type="button"
              className="icon-button icon-button--edit"
              onClick={onEdit}
              aria-label={t('edit')}
              title={t('edit')}
            >
              <i className="bi bi-pencil-fill" aria-hidden />
            </button>
          )}
          {onDelete && (
            <button type="button" className="icon-button" onClick={onDelete} aria-label={t('delete')} title={t('delete')}>
              <i className="bi bi-trash3-fill" aria-hidden />
            </button>
          )}
        </span>
      )}
    </motion.li>
  );
}
