import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import LoginForm from '@/components/auth/LoginForm';
import Logo from '@/components/layout/Logo';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('login');
  return { title: t('submit') };
}

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ next?: string }> }) {
  const [{ next }, t] = await Promise.all([searchParams, getTranslations('login')]);
  // Demo credentials are shown only when configured (env DEMO_EMAIL / DEMO_PASSWORD).
  const { DEMO_EMAIL: email, DEMO_PASSWORD: password } = process.env;
  const demo = email && password ? { email, password } : undefined;

  return (
    <main className="login-page">
      <section className="login-card">
        <div className="login-card__brand">
          <Logo size={40} />
          <span className="login-card__brand-name">Inventory</span>
        </div>
        <h1 className="login-card__title">{t('title')}</h1>
        <p className="login-card__subtitle">{t('subtitle')}</p>
        <LoginForm next={next} demo={demo} />
      </section>
    </main>
  );
}
