'use client';

import { motion } from 'motion/react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { cn } from '@/lib/cn';
import ProfileCard from './ProfileCard';

// Items from the mockup; only Orders and Products are part of the spec, the rest are shown disabled.
const ITEMS = [
  { key: 'orders', href: '/orders', icon: 'bi-box-seam' },
  { key: 'groups', href: null, icon: 'bi-collection' },
  { key: 'products', href: '/products', icon: 'bi-display' },
  { key: 'users', href: null, icon: 'bi-people' },
  { key: 'settings', href: null, icon: 'bi-gear' },
] as const;

export default function NavigationMenu() {
  const t = useTranslations('nav');
  const pathname = usePathname();

  return (
    <aside className="nav-menu">
      <ProfileCard />
      <nav aria-label={t('label')}>
        <ul className="nav-menu__list">
          {ITEMS.map((item) => {
            if (!item.href) {
              return (
                <li key={item.key} className="nav-menu__item nav-menu__item--disabled">
                  <span className="nav-menu__link nav-menu__link--disabled" aria-disabled="true" title={t('soon')}>
                    <i className={cn('bi nav-menu__icon', item.icon)} aria-hidden />
                    <span className="nav-menu__text">{t(item.key)}</span>
                  </span>
                </li>
              );
            }

            const active = pathname.startsWith(item.href);
            return (
              <li key={item.key} className="nav-menu__item">
                <Link
                  href={item.href}
                  className={cn('nav-menu__link', active && 'nav-menu__link--active')}
                  aria-current={active ? 'page' : undefined}
                >
                  <i className={cn('bi nav-menu__icon', item.icon)} aria-hidden />
                  <span className="nav-menu__text">{t(item.key)}</span>
                  {active && <motion.span layoutId="nav-underline" className="nav-menu__underline" />}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </aside>
  );
}
