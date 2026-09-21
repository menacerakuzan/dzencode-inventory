'use client';

import { useState, type ReactNode } from 'react';
import { Provider } from 'react-redux';
import type { User } from '@/types';
import { makeStore } from './store';

export default function StoreProvider({ user, children }: { user: User; children: ReactNode }) {
  const [store] = useState(() =>
    makeStore({ session: { user, activeTabs: null, connected: false, warehouses: [] } }),
  );
  return <Provider store={store}>{children}</Provider>;
}
