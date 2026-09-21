'use client';

import Image from 'next/image';
import { useTranslations } from 'next-intl';
import { useEffect, useRef, useState } from 'react';
import { apiErrorMessage, iconsApi, uploadsApi } from '@/lib/api';
import { cn } from '@/lib/cn';
import type { Icon } from '@/types';

interface Props {
  value: string | null;
  onChange: (photo: string | null) => void;
}

/** Product photo: one of the icons configured on the server or an uploaded image. */
export default function PhotoPicker({ value, onChange }: Props) {
  const t = useTranslations('productForm');
  const tc = useTranslations('common');
  const fileRef = useRef<HTMLInputElement>(null);
  const [icons, setIcons] = useState<Icon[]>([]);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    iconsApi
      .list()
      .then(setIcons)
      .catch((reason) => setError(tc('actionFailed', { message: apiErrorMessage(reason) })));
  }, [tc]);

  const upload = async (file: File | undefined) => {
    if (!file) return;
    setUploading(true);
    setError(null);
    try {
      onChange(await uploadsApi.upload(file));
    } catch (reason) {
      setError(tc('actionFailed', { message: apiErrorMessage(reason) }));
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = '';
    }
  };

  const uploaded = value && !icons.some((icon) => icon.url === value) ? value : null;
  const options = [...(uploaded ? [{ name: t('photo'), url: uploaded }] : []), ...icons];

  return (
    <div className="photo-picker">
      <div className="photo-picker__options" role="radiogroup" aria-label={t('photo')}>
        <button
          type="button"
          role="radio"
          aria-checked={value === null}
          className={cn('photo-picker__option photo-picker__option--none', value === null && 'photo-picker__option--selected')}
          onClick={() => onChange(null)}
          title={t('noPhoto')}
        >
          <i className="bi bi-slash-circle" aria-hidden />
          <span className="visually-hidden">{t('noPhoto')}</span>
        </button>
        {options.map((option) => (
          <button
            key={option.url}
            type="button"
            role="radio"
            aria-checked={value === option.url}
            className={cn('photo-picker__option', value === option.url && 'photo-picker__option--selected')}
            onClick={() => onChange(option.url)}
            title={option.name}
          >
            <Image src={option.url} alt={option.name} width={48} height={36} unoptimized />
          </button>
        ))}
      </div>

      <div className="photo-picker__upload">
        <button
          type="button"
          className="btn btn-outline-secondary btn-sm"
          onClick={() => fileRef.current?.click()}
          disabled={uploading}
        >
          {uploading ? (
            <span className="spinner-border spinner-border-sm me-2" aria-hidden />
          ) : (
            <i className="bi bi-upload me-2" aria-hidden />
          )}
          {uploading ? t('uploading') : t('upload')}
        </button>
        <span className="photo-picker__hint">{t('uploadHint')}</span>
        <input
          ref={fileRef}
          type="file"
          accept="image/png,image/jpeg,image/webp,image/gif"
          className="d-none"
          onChange={(event) => upload(event.target.files?.[0])}
        />
      </div>
      {error && (
        <div className="invalid-feedback d-block" role="alert">
          {error}
        </div>
      )}
    </div>
  );
}
