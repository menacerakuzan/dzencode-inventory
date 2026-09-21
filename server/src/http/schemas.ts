import { z } from 'zod';
import { config } from '../config.js';

const DATE_TIME = /^(\d{4}-\d{2}-\d{2})[ T](\d{2}:\d{2})(:\d{2})?$/;

/** Accepts "YYYY-MM-DD HH:mm[:ss]" or the HTML datetime-local format and normalizes to SQL DATETIME. */
export const dateTime = z
  .string()
  .trim()
  .regex(DATE_TIME, 'Expected a date in format YYYY-MM-DD HH:mm:ss')
  .transform((value) => {
    const [, date, time, seconds] = DATE_TIME.exec(value)!;
    return `${date} ${time}${seconds ?? ':00'}`;
  })
  .refine((value) => !Number.isNaN(Date.parse(value.replace(' ', 'T'))), 'Invalid date');

export const idParam = z.coerce.number().int().positive();

export const loginSchema = z.object({
  email: z.email('Invalid email').trim().toLowerCase(),
  password: z.string().min(6, 'Password must contain at least 6 characters').max(128),
});

export const orderInputSchema = z.object({
  title: z.string().trim().min(3, 'Title must contain at least 3 characters').max(255),
  description: z.string().trim().max(1000).default(''),
  date: dateTime,
  warehouseId: z.number().int().positive().nullable().default(null),
});

const priceSchema = z.object({
  value: z.number().nonnegative().max(1_000_000_000),
  symbol: z
    .string()
    .trim()
    .toUpperCase()
    .refine((code) => config.currencies.includes(code), `Currency must be one of: ${config.currencies.join(', ')}`),
  isDefault: z.boolean(),
});

/** Built-in icon (`/icons/…`) or an uploaded image (`/uploads/…`); `null` — the default icon. */
const photoPath = z
  .string()
  .regex(/^\/(icons|uploads)\/[\w.-]+$/, 'Photo must be an uploaded file or a built-in icon')
  .nullable()
  .default(null);

export const productInputSchema = z.object({
  photo: photoPath,
  title: z.string().trim().min(2).max(255),
  serialNumber: z.string().trim().min(3).max(64),
  isNew: z.boolean(),
  type: z.string().trim().min(2).max(64),
  specification: z.string().trim().min(2).max(255),
  status: z.enum(['free', 'repair']),
  guarantee: z
    .object({ start: dateTime, end: dateTime })
    .refine((g) => g.end >= g.start, { message: 'Guarantee end must not be before start', path: ['end'] }),
  price: z
    .array(priceSchema)
    .min(1)
    .refine((prices) => new Set(prices.map((p) => p.symbol)).size === prices.length, 'Currencies must be unique')
    .refine((prices) => prices.filter((p) => p.isDefault).length === 1, 'Exactly one default price is required'),
  order: z.number().int().positive(),
});

export const productsQuerySchema = z.object({
  type: z.string().trim().min(1).optional(),
  orderId: idParam.optional(),
});
