export const locales = ['ru', 'uk', 'en'] as const;
export type Locale = (typeof locales)[number];

export const isLocale = (value: unknown): value is Locale => locales.includes(value as Locale);

/** Used when the visitor has not chosen a language yet (env DEFAULT_LOCALE). */
export const defaultLocale: Locale = isLocale(process.env.DEFAULT_LOCALE) ? process.env.DEFAULT_LOCALE : 'ru';
export const LOCALE_COOKIE = 'NEXT_LOCALE';
export const TIME_ZONE = process.env.TIME_ZONE ?? 'Europe/Kyiv';
