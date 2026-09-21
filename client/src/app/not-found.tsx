import Link from 'next/link';
import { getTranslations } from 'next-intl/server';

export default async function NotFound() {
  const t = await getTranslations('errors');
  return (
    <main className="status-page">
      <p className="status-page__code">404</p>
      <h1 className="status-page__title">{t('notFoundTitle')}</h1>
      <Link href="/orders" className="btn btn-success">
        {t('notFoundLink')}
      </Link>
    </main>
  );
}
