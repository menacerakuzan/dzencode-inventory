/** ISO 4217 code, e.g. "UAH". The list of allowed currencies comes from the config. */
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

export interface UserWithPassword extends User {
  passwordHash: string;
}

export type OrderInput = Omit<Order, 'id'>;
export type ProductInput = Omit<Product, 'id' | 'date'>;

export interface Repositories {
  users: {
    findByEmail(email: string): Promise<UserWithPassword | null>;
    findById(id: number): Promise<User | null>;
  };
  orders: {
    list(): Promise<Order[]>;
    exists(id: number): Promise<boolean>;
    create(order: OrderInput): Promise<Order>;
    /** `null` when the order does not exist. */
    update(id: number, order: OrderInput): Promise<Order | null>;
    remove(id: number): Promise<boolean>;
  };
  products: {
    list(filter?: { type?: string; orderId?: number }): Promise<Product[]>;
    create(product: ProductInput): Promise<Product>;
    /** `null` when the product does not exist. */
    update(id: number, product: ProductInput): Promise<Product | null>;
    remove(id: number): Promise<boolean>;
  };
  warehouses: {
    list(): Promise<Warehouse[]>;
  };
}
