'use client';

import { motion } from 'motion/react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { cn } from '@/lib/cn';
import ProfileCard from './ProfileCard';

const ITEMS = [
  { href: '/orders', key: 'orders', icon: 'bi-box-seam' },
  { href: '/products', key: 'products', icon: 'bi-display' },
  { href: '/stats', key: 'stats', icon: 'bi-bar-chart-line' },
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
            const active = pathname.startsWith(item.href);
            return (
              <li key={item.href} className="nav-menu__item">
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
