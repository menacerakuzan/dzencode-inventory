/** ISO 4217 code, e.g. "UAH". Allowed currencies come from the server settings. */
export type Currency = string;
export type ProductStatus = 'free' | 'repair';

export interface Price {
  value: number;
  symbol: Currency;
  isDefault: boolean;
}

export interface Product {
  id: number;
  serialNumber: string;
  isNew: boolean;
  photo: string | null;
  title: string;
  type: string;
  specification: string;
  status: ProductStatus;
  guarantee: { start: string; end: string };
  price: Price[];
  order: number;
  date: string;
}

export interface Order {
  id: number;
  title: string;
  description: string;
  date: string;
  warehouseId: number | null;
}

export interface Warehouse {
  id: number;
  name: string;
  city: string;
  address: string;
  lat: number;
  lng: number;
}

export interface User {
  id: number;
  email: string;
  name: string;
}

/** App settings configured on the server. */
export interface Settings {
  currencies: Currency[];
  defaultCurrency: Currency;
}

export interface Icon {
  name: string;
  url: string;
}

export type Totals = Record<Currency, number>;

export interface OrderSummary extends Order {
  productsCount: number;
  totals: Totals;
}

export type OrderInput = Omit<Order, 'id'>;
export type ProductInput = Omit<Product, 'id' | 'date'>;
