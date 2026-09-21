'use client';

import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { searchChanged } from '@/store/slices/uiSlice';
import Clock from './Clock';
import LanguageSwitcher from './LanguageSwitcher';
import Logo from './Logo';
import SessionsCounter from './SessionsCounter';

export default function TopMenu() {
  const t = useTranslations('topMenu');
  const dispatch = useAppDispatch();
  const search = useAppSelector((state) => state.ui.search);

  return (
    <header className="top-menu">
      <div className="top-menu__inner">
        <Link href="/orders" className="top-menu__brand" aria-label={t('home')}>
          <Logo />
          <span className="top-menu__brand-name">Inventory</span>
        </Link>

        <div className="top-menu__search" role="search">
          <i className="bi bi-search top-menu__search-icon" aria-hidden />
          <input
            type="search"
            className="form-control top-menu__search-input"
            placeholder={t('search')}
            aria-label={t('searchLabel')}
            value={search}
            onChange={(event) => dispatch(searchChanged(event.target.value))}
          />
        </div>

        <div className="top-menu__aside">
          <LanguageSwitcher />
          <SessionsCounter />
          <Clock />
        </div>
      </div>
    </header>
  );
}
