'use client';

import { motion } from 'motion/react';
import type { ReactNode } from 'react';

interface Props {
  title: string;
  count: number;
  addLabel?: string;
  onAdd?: () => void;
  children?: ReactNode;
}

export default function PageHeader({ title, count, addLabel, onAdd, children }: Props) {
  return (
    <div className="page-header">
      {onAdd && (
        <motion.button
          type="button"
          className="add-button page-header__add"
          onClick={onAdd}
          aria-label={addLabel}
          title={addLabel}
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.94 }}
        >
          <i className="bi bi-plus-lg" aria-hidden />
        </motion.button>
      )}
      <h1 className="page-header__title">
        {title} <span className="page-header__divider">/</span>{' '}
        <motion.span
          key={count}
          className="page-header__count"
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
        >
          {count}
        </motion.span>
      </h1>
      {children && <div className="page-header__extra">{children}</div>}
    </div>
  );
}
