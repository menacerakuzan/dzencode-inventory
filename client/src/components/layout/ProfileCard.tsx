'use client';

import { AnimatePresence, motion } from 'motion/react';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { authApi } from '@/lib/api';
import { useAppSelector } from '@/store/hooks';

const initials = (name: string) =>
  name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]!.toUpperCase())
    .join('');

export default function ProfileCard() {
  const t = useTranslations('profile');
  const user = useAppSelector((state) => state.session.user);
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false);
    };
    document.addEventListener('pointerdown', onPointerDown);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('pointerdown', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [open]);

  const logout = async () => {
    try {
      await authApi.logout();
    } finally {
      router.replace('/login');
      router.refresh();
    }
  };

  if (!user) return null;

  return (
    <div className="profile" ref={rootRef}>
      <div className="profile__avatar" aria-hidden>
        {initials(user.name)}
      </div>
      <button
        type="button"
        className="profile__settings"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        aria-haspopup="menu"
        aria-label={t('menu')}
      >
        <i className="bi bi-gear-fill" aria-hidden />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            className="profile__menu"
            role="menu"
            initial={{ opacity: 0, y: -6, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.97 }}
          >
            <p className="profile__name">{user.name}</p>
            <p className="profile__email">{user.email}</p>
            <button type="button" className="btn btn-sm btn-outline-secondary w-100" role="menuitem" onClick={logout}>
              <i className="bi bi-box-arrow-right me-2" aria-hidden />
              {t('logout')}
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
