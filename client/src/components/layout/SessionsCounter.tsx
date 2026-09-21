'use client';

import { AnimatePresence, motion } from 'motion/react';
import { useTranslations } from 'next-intl';
import { cn } from '@/lib/cn';
import { useAppSelector } from '@/store/hooks';

/** Number of open tabs of the app in all browsers, pushed by Socket.io in real time. */
export default function SessionsCounter() {
  const t = useTranslations('topMenu');
  const count = useAppSelector((state) => state.session.activeTabs);
  const connected = useAppSelector((state) => state.session.connected);
  const label = connected && count !== null ? t('sessions', { count }) : t('offline');

  return (
    <div className={cn('sessions', !connected && 'sessions--offline')} title={label} role="status">
      <span className="sessions__indicator" aria-hidden />
      <i className="bi bi-people-fill sessions__icon" aria-hidden />
      <span className="sessions__count" aria-hidden>
        <AnimatePresence mode="popLayout" initial={false}>
          <motion.span
            key={count ?? 'none'}
            className="sessions__value"
            initial={{ y: -10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 10, opacity: 0 }}
          >
            {connected && count !== null ? count : '—'}
          </motion.span>
        </AnimatePresence>
      </span>
      <span className="visually-hidden">{label}</span>
    </div>
  );
}
