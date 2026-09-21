'use client';

import { useLocale } from 'next-intl';
import { useNow } from '@/hooks/useNow';
import { formatHeaderDate, formatTime, formatWeekday } from '@/lib/format';

export default function Clock() {
  const now = useNow();
  const locale = useLocale();

  if (!now) return <div className="clock clock--pending" aria-hidden />;

  return (
    <div className="clock">
      <span className="clock__weekday">{formatWeekday(now, locale)}</span>
      <span className="clock__row">
        <span className="clock__date">{formatHeaderDate(now, locale)}</span>
        <i className="bi bi-clock clock__icon" aria-hidden />
        <time className="clock__time" dateTime={now.toISOString()} suppressHydrationWarning>
          {formatTime(now)}
        </time>
      </span>
    </div>
  );
}
