import type { ReactNode } from 'react';
import AppShell from '@/components/layout/AppShell';
import { getCurrentUser } from '@/lib/serverApi';
import StoreProvider from '@/store/StoreProvider';

export default async function DashboardLayout({ children }: { children: ReactNode }) {
  const user = await getCurrentUser();

  return (
    <StoreProvider user={user}>
      <AppShell>{children}</AppShell>
    </StoreProvider>
  );
}
