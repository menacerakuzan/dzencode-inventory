import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import OrdersView from '@/components/orders/OrdersView';
import { getOrders, getProducts, getWarehouses } from '@/lib/serverApi';
import StoreHydrator from '@/store/StoreHydrator';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('orders');
  return { title: t('title') };
}

export default async function OrdersPage({ searchParams }: { searchParams: Promise<{ order?: string }> }) {
  const [{ order }, orders, products, warehouses] = await Promise.all([
    searchParams,
    getOrders(),
    getProducts(),
    getWarehouses(),
  ]);
  const requested = Number(order);
  const selectedOrderId = orders.some((o) => o.id === requested) ? requested : null;

  return (
    <>
      <StoreHydrator orders={orders} products={products} warehouses={warehouses} selectedOrderId={selectedOrderId} />
      <OrdersView />
    </>
  );
}
