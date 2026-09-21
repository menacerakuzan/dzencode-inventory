'use client';

import { useLocale, useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { useTransition } from 'react';
import { LOCALE_COOKIE, locales, type Locale } from '@/i18n/config';

const LABELS: Record<Locale, string> = { ru: 'RU', uk: 'UA', en: 'EN' };

export default function LanguageSwitcher() {
  const t = useTranslations('topMenu');
  const locale = useLocale();
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  const change = (next: string) => {
    document.cookie = `${LOCALE_COOKIE}=${next}; path=/; max-age=31536000; samesite=lax`;
    startTransition(() => router.refresh());
  };

  return (
    <select
      className="form-select form-select-sm language-switcher"
      value={locale}
      onChange={(event) => change(event.target.value)}
      aria-label={t('language')}
      disabled={pending}
    >
      {locales.map((value) => (
        <option key={value} value={value}>
          {LABELS[value]}
        </option>
      ))}
    </select>
  );
}
