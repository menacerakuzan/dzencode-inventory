export const locales = ['ru', 'uk', 'en'] as const;
export type Locale = (typeof locales)[number];

export const defaultLocale: Locale = 'ru';
export const LOCALE_COOKIE = 'NEXT_LOCALE';
export const TIME_ZONE = 'Europe/Kyiv';

export const isLocale = (value: unknown): value is Locale => locales.includes(value as Locale);
