'use client';

import { useState, type ReactNode } from 'react';
import { Provider } from 'react-redux';
import type { Settings, User } from '@/types';
import { makeStore } from './store';

interface Props {
  user: User;
  settings: Settings;
  children: ReactNode;
}

export default function StoreProvider({ user, settings, children }: Props) {
  const [store] = useState(() =>
    makeStore({ session: { user, settings, activeTabs: null, connected: false, warehouses: [] } }),
  );
  return <Provider store={store}>{children}</Provider>;
}
