import { z } from 'zod';

// Error messages are i18n keys from the `validation` namespace.

const requiredText = (min: number, max: number) =>
  z
    .string()
    .trim()
    .min(1, 'required')
    .min(min, 'minLength')
    .max(max, 'maxLength');

const positiveNumber = z
  .number({ error: 'positive' })
  .refine((value) => Number.isFinite(value) && value > 0, 'positive');

const dateString = z.string().min(1, 'required').refine((value) => !Number.isNaN(Date.parse(value)), 'date');

export const loginSchema = z.object({
  email: z.string().trim().min(1, 'required').pipe(z.email('email')),
  password: z.string().min(1, 'required').min(6, 'password'),
});
export type LoginValues = z.infer<typeof loginSchema>;

export const orderFormSchema = z.object({
  title: requiredText(3, 255),
  date: dateString,
  warehouseId: z.string(),
  description: z.string().trim().max(1000, 'maxLength'),
});
export type OrderFormValues = z.infer<typeof orderFormSchema>;

export const productFormSchema = z
  .object({
    order: z.string().min(1, 'order'),
    title: requiredText(2, 255),
    serialNumber: requiredText(3, 64),
    type: requiredText(2, 64),
    specification: requiredText(2, 255),
    status: z.enum(['free', 'repair']),
    condition: z.enum(['new', 'used']),
    guaranteeStart: dateString,
    guaranteeEnd: dateString,
    priceUsd: positiveNumber,
    priceUah: positiveNumber,
  })
  .refine((values) => !values.guaranteeStart || !values.guaranteeEnd || values.guaranteeEnd >= values.guaranteeStart, {
    message: 'guaranteeOrder',
    path: ['guaranteeEnd'],
  });
export type ProductFormValues = z.infer<typeof productFormSchema>;
