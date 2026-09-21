import { describe, expect, it } from 'vitest';
import { loginSchema, makeProductFormSchema, orderFormSchema, type ProductFormValues } from './validation';

/** First message per field — the one react-hook-form displays. */
const messages = (result: { success: boolean; error?: { issues: { path: PropertyKey[]; message: string }[] } }) => {
  const byField: Record<string, string> = {};
  for (const issue of result.error?.issues ?? []) byField[issue.path.join('.')] ??= issue.message;
  return byField;
};

describe('loginSchema', () => {
  it('requires a valid email and a 6+ characters password', () => {
    expect(messages(loginSchema.safeParse({ email: '', password: '' }))).toEqual({
      email: 'required',
      password: 'required',
    });
    expect(messages(loginSchema.safeParse({ email: 'nope', password: '123' }))).toEqual({
      email: 'email',
      password: 'password',
    });
    expect(loginSchema.safeParse({ email: ' admin@inventory.local ', password: 'Admin123!' }).success).toBe(true);
  });
});

describe('orderFormSchema', () => {
  it('validates title length and date', () => {
    const result = orderFormSchema.safeParse({ title: 'ab', date: 'not a date', warehouseId: '', description: '' });
    expect(messages(result)).toEqual({ title: 'minLength', date: 'date' });
  });

  it('accepts a datetime-local value', () => {
    const result = orderFormSchema.safeParse({
      title: 'Monitors',
      date: '2026-09-21T10:30',
      warehouseId: '1',
      description: '',
    });
    expect(result.success).toBe(true);
  });
});

describe('makeProductFormSchema', () => {
  const productFormSchema = makeProductFormSchema(['UAH', 'USD']);
  const valid: ProductFormValues = {
    order: '1',
    title: 'Dell P2422H',
    serialNumber: 'SN-1',
    type: 'Мониторы',
    specification: '24" Full HD',
    status: 'free',
    condition: 'new',
    guaranteeStart: '2026-01-01',
    guaranteeEnd: '2027-01-01',
    photo: null,
    prices: { UAH: 7843.5, USD: 189 },
  };

  it('accepts a valid product', () => {
    expect(productFormSchema.safeParse(valid).success).toBe(true);
  });

  it('rejects guarantee end before start', () => {
    const result = productFormSchema.safeParse({ ...valid, guaranteeEnd: '2025-01-01' });
    expect(messages(result)).toEqual({ guaranteeEnd: 'guaranteeOrder' });
  });

  it('reports the guarantee order together with other field errors', () => {
    const result = productFormSchema.safeParse({ ...valid, title: '', guaranteeEnd: '2025-01-01' });
    expect(messages(result)).toEqual({ title: 'required', guaranteeEnd: 'guaranteeOrder' });
  });

  it('requires a positive price in every configured currency and an order', () => {
    const result = productFormSchema.safeParse({ ...valid, order: '', prices: { UAH: 0 } });
    expect(messages(result)).toEqual({ order: 'order', 'prices.UAH': 'positive', 'prices.USD': 'positive' });
  });

  it('builds price fields from the given currencies', () => {
    const eurOnly = makeProductFormSchema(['EUR']);
    expect(eurOnly.safeParse({ ...valid, prices: { EUR: 10 } }).success).toBe(true);
    expect(eurOnly.safeParse(valid).success).toBe(false);
  });
});
