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

export interface UserWithPassword extends User {
  passwordHash: string;
}

export type NewOrder = Omit<Order, 'id'>;
export type NewProduct = Omit<Product, 'id' | 'photo' | 'date'>;

export interface Repositories {
  users: {
    findByEmail(email: string): Promise<UserWithPassword | null>;
    findById(id: number): Promise<User | null>;
  };
  orders: {
    list(): Promise<Order[]>;
    exists(id: number): Promise<boolean>;
    create(order: NewOrder): Promise<Order>;
    remove(id: number): Promise<boolean>;
  };
  products: {
    list(filter?: { type?: string; orderId?: number }): Promise<Product[]>;
    create(product: NewProduct): Promise<Product>;
    remove(id: number): Promise<boolean>;
  };
  warehouses: {
    list(): Promise<Warehouse[]>;
  };
}

export interface InventoryEvents {
  'order:created': Order;
  'order:deleted': { id: number };
  'product:created': Product;
  'product:deleted': { id: number };
}

export interface EventBus {
  emit<K extends keyof InventoryEvents>(event: K, payload: InventoryEvents[K]): void;
}
