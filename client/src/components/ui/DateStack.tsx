'use client';

import { useLocale } from 'next-intl';
import { cn } from '@/lib/cn';
import { formatDayMonth, formatLongDate, parseDateTime, toSqlDateTime } from '@/lib/format';

/** A date in two formats, as on the mockups: small "06 / 04" above "06 / Апр / 2017". */
export default function DateStack({ date, className }: { date: string; className?: string }) {
  const locale = useLocale();
  return (
    <time className={cn('date-stack', className)} dateTime={toSqlDateTime(parseDateTime(date)).replace(' ', 'T')}>
      <span className="date-stack__small">{formatDayMonth(date)}</span>
      <span className="date-stack__main">{formatLongDate(date, locale)}</span>
    </time>
  );
}
