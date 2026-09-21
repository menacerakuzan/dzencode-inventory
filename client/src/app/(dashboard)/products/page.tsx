import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import ProductsView from '@/components/products/ProductsView';
import { getOrders, getProducts } from '@/lib/serverApi';
import StoreHydrator from '@/store/StoreHydrator';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('products');
  return { title: t('title') };
}

export default async function ProductsPage() {
  const [orders, products] = await Promise.all([getOrders(), getProducts()]);

  return (
    <>
      <StoreHydrator orders={orders} products={products} />
      <ProductsView />
    </>
  );
}
