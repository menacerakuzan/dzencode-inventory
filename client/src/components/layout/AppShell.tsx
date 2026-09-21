'use client';

import { MotionConfig } from 'motion/react';
import type { ReactNode } from 'react';
import Toasts from '@/components/ui/Toasts';
import { useRealtime } from '@/hooks/useRealtime';
import ModalsHost from './ModalsHost';
import NavigationMenu from './NavigationMenu';
import TopMenu from './TopMenu';

export default function AppShell({ children }: { children: ReactNode }) {
  useRealtime();

  return (
    <MotionConfig reducedMotion="user">
      <div className="app">
        <TopMenu />
        <div className="app__body">
          <NavigationMenu />
          <main className="app__main" id="main">
            {children}
          </main>
        </div>
        <ModalsHost />
        <Toasts />
      </div>
    </MotionConfig>
  );
}
