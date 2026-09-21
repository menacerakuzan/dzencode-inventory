import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import StatsView from '@/components/stats/StatsView';
import { getOrders, getProducts, getWarehouses } from '@/lib/serverApi';
import StoreHydrator from '@/store/StoreHydrator';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('stats');
  return { title: t('title') };
}

export default async function StatsPage() {
  const [orders, products, warehouses] = await Promise.all([getOrders(), getProducts(), getWarehouses()]);

  return (
    <>
      <StoreHydrator orders={orders} products={products} warehouses={warehouses} />
      <StatsView />
    </>
  );
}
