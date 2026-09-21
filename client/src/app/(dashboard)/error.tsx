'use client';

import { useTranslations } from 'next-intl';
import { useEffect } from 'react';

export default function DashboardError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  const t = useTranslations('errors');
  const tc = useTranslations('common');

  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="status-page status-page--inline" role="alert">
      <i className="bi bi-exclamation-triangle status-page__icon" aria-hidden />
      <h1 className="status-page__title">{t('title')}</h1>
      <p className="status-page__text">{t('description')}</p>
      <button type="button" className="btn btn-success" onClick={reset}>
        {tc('retry')}
      </button>
    </div>
  );
}
