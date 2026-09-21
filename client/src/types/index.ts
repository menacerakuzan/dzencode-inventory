export type Currency = 'USD' | 'UAH';
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

export type Totals = Record<Currency, number>;

export interface OrderSummary extends Order {
  productsCount: number;
  totals: Totals;
}

export interface NewOrder {
  title: string;
  description: string;
  date: string;
  warehouseId: number | null;
}

export interface NewProduct {
  title: string;
  serialNumber: string;
  isNew: boolean;
  type: string;
  specification: string;
  status: ProductStatus;
  guarantee: { start: string; end: string };
  price: Price[];
  order: number;
}
