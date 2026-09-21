'use client';

import { useEffect, useState } from 'react';

/** Current time, updated every second. `null` until mounted to avoid SSR/client time mismatch. */
export function useNow(intervalMs = 1000): Date | null {
  const [now, setNow] = useState<Date | null>(null);

  useEffect(() => {
    const tick = () => setNow(new Date());
    tick();
    const id = window.setInterval(tick, intervalMs);
    return () => window.clearInterval(id);
  }, [intervalMs]);

  return now;
}
