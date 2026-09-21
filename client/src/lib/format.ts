import type { Currency, Price, Product, Totals } from '@/types';

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

/** Three-letter month from the locale data: "Апр", "Кві", "Apr". */
export const shortMonth = (date: Date, locale: string): string => {
  const name = new Intl.DateTimeFormat(locale, { month: 'short' }).format(date).replace('.', '');
  return name.charAt(0).toLocaleUpperCase(locale) + name.slice(1, 3);
};

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

export const formatMoney = (value: number, currency: Currency): string =>
  `${formatAmount(value)}${NBSP}${currency}`;

const round2 = (value: number) => Math.round(value * 100) / 100;

/** Sum of product prices per currency, e.g. `{ UAH: 5200, USD: 200 }`. */
export function sumTotals(products: Pick<Product, 'price'>[]): Totals {
  const totals: Totals = {};
  for (const product of products) {
    for (const price of product.price) totals[price.symbol] = (totals[price.symbol] ?? 0) + price.value;
  }
  return Object.fromEntries(Object.entries(totals).map(([currency, value]) => [currency, round2(value)]));
}

/** Totals as a price list: every configured currency, the default one marked as main. */
export const totalsToPrices = (totals: Totals, currencies: Currency[], defaultCurrency: Currency): Price[] =>
  currencies.map((symbol) => ({ value: totals[symbol] ?? 0, symbol, isDefault: symbol === defaultCurrency }));

/** The default price is shown large, the other currencies small above it, as on the mockups. */
export function splitPrices(prices: Price[]): { main: Price | undefined; secondary: Price[] } {
  const main = prices.find((p) => p.isDefault) ?? prices[0];
  return { main, secondary: prices.filter((p) => p !== main) };
}
