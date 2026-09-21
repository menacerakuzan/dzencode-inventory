import { describe, expect, it } from 'vitest';
import { makeProduct } from '@/test/fixtures';
import {
  formatAmount,
  formatDayMonth,
  formatHeaderDate,
  formatLongDate,
  formatMoney,
  formatNumericDate,
  formatShortTextDate,
  formatTime,
  parseDateTime,
  splitPrices,
  sumTotals,
  toDateTimeLocal,
} from './format';

const NBSP = ' ';

describe('dates', () => {
  it('parses API dates as local wall-clock time', () => {
    const date = parseDateTime('2017-04-06 17:20:05');
    expect([date.getFullYear(), date.getMonth(), date.getDate(), date.getHours(), date.getMinutes()]).toEqual([
      2017, 3, 6, 17, 20,
    ]);
  });

  it('formats a date in the two formats from the mockups', () => {
    expect(formatDayMonth('2017-04-06 12:00:00')).toBe('06 / 04');
    expect(formatLongDate('2017-04-06 12:00:00', 'ru')).toBe('06 / Апр / 2017');
    expect(formatLongDate('2017-09-06 12:00:00', 'uk')).toBe('06 / Вер / 2017');
    expect(formatLongDate('2017-09-06 12:00:00', 'en')).toBe('06 / Sep / 2017');
    expect(formatNumericDate('2025-08-06 00:00:00')).toBe('06 / 08 / 2025');
    expect(formatShortTextDate('2025-08-06 00:00:00', 'ru')).toBe('06 Авг 2025');
  });

  it('formats header date, time and datetime-local value', () => {
    const date = new Date(2017, 2, 12, 9, 5, 7);
    expect(formatHeaderDate(date, 'ru')).toBe('12 Мар, 2017');
    expect(formatTime(date)).toBe('09:05:07');
    expect(toDateTimeLocal(date)).toBe('2017-03-12T09:05');
  });
});

describe('money', () => {
  it('groups thousands and keeps cents only when present', () => {
    expect(formatAmount(250000.5)).toBe(`250${NBSP}000.50`);
    expect(formatAmount(2500)).toBe(`2${NBSP}500`);
    expect(formatMoney(50.25, 'UAH')).toBe(`50.25${NBSP}UAH`);
    expect(formatMoney(100, 'USD')).toBe(`100${NBSP}$`);
  });

  it('sums product prices per currency without float noise', () => {
    const products = [
      makeProduct({ price: [{ value: 0.1, symbol: 'USD', isDefault: false }, { value: 0.2, symbol: 'UAH', isDefault: true }] }),
      makeProduct({ price: [{ value: 0.2, symbol: 'USD', isDefault: false }, { value: 0.1, symbol: 'UAH', isDefault: true }] }),
    ];
    expect(sumTotals(products)).toEqual({ USD: 0.3, UAH: 0.3 });
    expect(sumTotals([])).toEqual({ USD: 0, UAH: 0 });
  });

  it('puts the default currency first as the main price', () => {
    const { main, secondary } = splitPrices(makeProduct().price);
    expect(main?.symbol).toBe('UAH');
    expect(secondary?.symbol).toBe('USD');
  });
});
