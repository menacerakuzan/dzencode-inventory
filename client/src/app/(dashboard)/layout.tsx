import type { ReactNode } from 'react';
import AppShell from '@/components/layout/AppShell';
import { getCurrentUser, getSettings } from '@/lib/serverApi';
import StoreProvider from '@/store/StoreProvider';

export default async function DashboardLayout({ children }: { children: ReactNode }) {
  const [user, settings] = await Promise.all([getCurrentUser(), getSettings()]);

  return (
    <StoreProvider user={user} settings={settings}>
      <AppShell>{children}</AppShell>
    </StoreProvider>
  );
}
