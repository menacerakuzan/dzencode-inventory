'use client';

import { useTranslations } from 'next-intl';
import type { ReactNode } from 'react';
import { cn } from '@/lib/cn';

interface Props {
  id: string;
  label: string;
  /** Key from the `validation` namespace. */
  error?: string;
  className?: string;
  children: ReactNode;
}

export default function FormField({ id, label, error, className, children }: Props) {
  const t = useTranslations('validation');
  return (
    <div className={cn('form-field', className)}>
      <label htmlFor={id} className="form-label form-field__label">
        {label}
      </label>
      {children}
      {error && (
        <div id={`${id}-error`} className="invalid-feedback d-block">
          {t.has(error) ? t(error) : error}
        </div>
      )}
    </div>
  );
}

/** Props for an input connected to FormField: Bootstrap invalid state + a11y wiring. */
export const fieldProps = (id: string, error: string | undefined) => ({
  id,
  'aria-invalid': error ? true : undefined,
  'aria-describedby': error ? `${id}-error` : undefined,
});
