'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import axios from 'axios';
import { motion } from 'motion/react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { useForm } from 'react-hook-form';
import FormField, { fieldProps } from '@/components/ui/FormField';
import { apiErrorMessage, authApi } from '@/lib/api';
import { cn } from '@/lib/cn';
import { loginSchema, type LoginValues } from '@/lib/validation';

/** Only same-site relative paths are allowed as the post-login target (no open redirect). */
const safeNext = (next: string | undefined) =>
  next && next.startsWith('/') && !next.startsWith('//') && !next.startsWith('/login') ? next : '/orders';

export interface DemoCredentials {
  email: string;
  password: string;
}

export default function LoginForm({ next, demo }: { next?: string; demo?: DemoCredentials }) {
  const t = useTranslations('login');
  const router = useRouter();
  const {
    register,
    handleSubmit,
    setValue,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    mode: 'onTouched',
    defaultValues: { email: '', password: '' },
  });

  const onSubmit = handleSubmit(async (values) => {
    try {
      await authApi.login(values);
      router.replace(safeNext(next));
      router.refresh();
    } catch (error) {
      const invalid = axios.isAxiosError(error) && error.response?.status === 401;
      setError('root', { message: invalid ? t('invalid') : apiErrorMessage(error) });
    }
  });

  const fillDemo = (credentials: DemoCredentials) => {
    setValue('email', credentials.email, { shouldValidate: true });
    setValue('password', credentials.password, { shouldValidate: true });
  };

  return (
    <motion.form
      className="login-card__form"
      onSubmit={onSubmit}
      noValidate
      animate={errors.root ? { x: [0, -8, 8, -5, 5, 0] } : { x: 0 }}
      transition={{ duration: 0.4 }}
    >
      <FormField id="login-email" label={t('email')} error={errors.email?.message}>
        <input
          type="email"
          autoComplete="username"
          {...fieldProps('login-email', errors.email?.message)}
          {...register('email')}
          className={cn('form-control', errors.email && 'is-invalid')}
        />
      </FormField>

      <FormField id="login-password" label={t('password')} error={errors.password?.message}>
        <input
          type="password"
          autoComplete="current-password"
          {...fieldProps('login-password', errors.password?.message)}
          {...register('password')}
          className={cn('form-control', errors.password && 'is-invalid')}
        />
      </FormField>

      {errors.root && (
        <div className="alert alert-danger py-2" role="alert">
          {errors.root.message}
        </div>
      )}

      <button type="submit" className="btn btn-success w-100 login-card__submit" disabled={isSubmitting}>
        {isSubmitting && <span className="spinner-border spinner-border-sm me-2" aria-hidden />}
        {t('submit')}
      </button>

      {demo && (
        <div className="login-card__demo">
          <span>
            {t('demo')}: <code>{demo.email}</code> / <code>{demo.password}</code>
          </span>
          <button type="button" className="btn btn-link btn-sm p-0" onClick={() => fillDemo(demo)}>
            {t('fillDemo')}
          </button>
        </div>
      )}
    </motion.form>
  );
}
