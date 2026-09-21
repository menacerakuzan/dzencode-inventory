'use client';

import { AnimatePresence, motion } from 'motion/react';
import { useTranslations } from 'next-intl';
import { useEffect } from 'react';
import { cn } from '@/lib/cn';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { toastDismissed, type Toast } from '@/store/slices/uiSlice';

const LIFETIME_MS = 4000;

function ToastItem({ toast }: { toast: Toast }) {
  const t = useTranslations('toast');
  const tc = useTranslations('common');
  const dispatch = useAppDispatch();

  useEffect(() => {
    const id = window.setTimeout(() => dispatch(toastDismissed(toast.id)), LIFETIME_MS);
    return () => window.clearTimeout(id);
  }, [dispatch, toast.id]);

  return (
    <motion.li
      layout
      className={cn('toast-item', `toast-item--${toast.kind}`)}
      role={toast.kind === 'error' ? 'alert' : 'status'}
      initial={{ opacity: 0, x: 48 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 48 }}
    >
      <i
        className={cn('bi toast-item__icon', toast.kind === 'error' ? 'bi-exclamation-circle' : 'bi-check-circle')}
        aria-hidden
      />
      <span className="toast-item__text">{t(toast.messageKey, toast.values)}</span>
      <button
        type="button"
        className="toast-item__close"
        onClick={() => dispatch(toastDismissed(toast.id))}
        aria-label={tc('close')}
      >
        <i className="bi bi-x" aria-hidden />
      </button>
    </motion.li>
  );
}

export default function Toasts() {
  const toasts = useAppSelector((state) => state.ui.toasts);
  return (
    <ul className="toasts" aria-live="polite">
      <AnimatePresence initial={false}>
        {toasts.map((toast) => (
          <ToastItem key={toast.id} toast={toast} />
        ))}
      </AnimatePresence>
    </ul>
  );
}
