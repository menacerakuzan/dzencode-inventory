import type { Currency, Price, Product, Totals } from '@/types';

const SHORT_MONTHS: Record<string, readonly string[]> = {
  ru: ['Янв', 'Фев', 'Мар', 'Апр', 'Май', 'Июн', 'Июл', 'Авг', 'Сен', 'Окт', 'Ноя', 'Дек'],
  uk: ['Січ', 'Лют', 'Бер', 'Кві', 'Тра', 'Чер', 'Лип', 'Сер', 'Вер', 'Жов', 'Лис', 'Гру'],
  en: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
};

const pad = (n: number) => String(n).padStart(2, '0');

/** API dates are wall-clock "YYYY-MM-DD HH:mm:ss" without a zone, so they are parsed as local time on both server and client. */
export function parseDateTime(value: string): Date {
  const [date = '', time = '00:00:00'] = value.trim().split(/[ T]/);
  const [y, m, d] = date.split('-').map(Number);
  const [hh = 0, mm = 0, ss = 0] = time.split(':').map(Number);
  return new Date(y!, (m ?? 1) - 1, d, hh, mm, ss);
}

export const toSqlDateTime = (date: Date): string =>
  `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;

/** Value for `<input type="datetime-local">`. */
export const toDateTimeLocal = (date: Date): string => toSqlDateTime(date).slice(0, 16).replace(' ', 'T');

export const shortMonth = (date: Date, locale: string): string =>
  (SHORT_MONTHS[locale] ?? SHORT_MONTHS.en!)[date.getMonth()]!;

/** "06 / 04" */
export const formatDayMonth = (value: string): string => {
  const d = parseDateTime(value);
  return `${pad(d.getDate())} / ${pad(d.getMonth() + 1)}`;
};

/** "06 / Апр / 2017" */
export const formatLongDate = (value: string, locale: string): string => {
  const d = parseDateTime(value);
  return `${pad(d.getDate())} / ${shortMonth(d, locale)} / ${d.getFullYear()}`;
};

/** "06 / 04 / 2017" */
export const formatNumericDate = (value: string): string => {
  const d = parseDateTime(value);
  return `${pad(d.getDate())} / ${pad(d.getMonth() + 1)} / ${d.getFullYear()}`;
};

/** "06 Апр 2017" */
export const formatShortTextDate = (value: string, locale: string): string => {
  const d = parseDateTime(value);
  return `${pad(d.getDate())} ${shortMonth(d, locale)} ${d.getFullYear()}`;
};

/** Header clock: "06 Апр, 2017" */
export const formatHeaderDate = (date: Date, locale: string): string =>
  `${pad(date.getDate())} ${shortMonth(date, locale)}, ${date.getFullYear()}`;

export const formatTime = (date: Date): string =>
  `${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;

export const formatWeekday = (date: Date, locale: string): string => {
  const weekday = new Intl.DateTimeFormat(locale, { weekday: 'long' }).format(date);
  return weekday.charAt(0).toLocaleUpperCase(locale) + weekday.slice(1);
};

const NBSP = ' ';

/** "250 000.50" — grouping with non-breaking spaces, cents only when present. */
export function formatAmount(value: number): string {
  const hasCents = Math.round(value * 100) % 100 !== 0;
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: hasCents ? 2 : 0,
    maximumFractionDigits: 2,
  })
    .format(value)
    .replace(/,/g, NBSP);
}

export const CURRENCY_LABEL: Record<Currency, string> = { USD: '$', UAH: 'UAH' };

export const formatMoney = (value: number, currency: Currency): string =>
  `${formatAmount(value)}${NBSP}${CURRENCY_LABEL[currency]}`;

export const emptyTotals = (): Totals => ({ USD: 0, UAH: 0 });

const round2 = (value: number) => Math.round(value * 100) / 100;

export function sumTotals(products: Pick<Product, 'price'>[]): Totals {
  const totals = emptyTotals();
  for (const product of products) {
    for (const price of product.price) totals[price.symbol] += price.value;
  }
  return { USD: round2(totals.USD), UAH: round2(totals.UAH) };
}

export const totalsToPrices = (totals: Totals): Price[] => [
  { value: totals.USD, symbol: 'USD', isDefault: false },
  { value: totals.UAH, symbol: 'UAH', isDefault: true },
];

/** Splits prices into the default (large) one and the secondary (small) one, as on the mockups. */
export function splitPrices(prices: Price[]): { main: Price | undefined; secondary: Price | undefined } {
  const main = prices.find((p) => p.isDefault) ?? prices[0];
  return { main, secondary: prices.find((p) => p !== main) };
}
