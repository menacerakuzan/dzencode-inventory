import mysql, { type Pool, type ResultSetHeader, type RowDataPacket } from 'mysql2/promise';
import type {
  Currency,
  NewOrder,
  NewProduct,
  Order,
  Price,
  Product,
  ProductStatus,
  Repositories,
  User,
  UserWithPassword,
  Warehouse,
} from '../types.js';

interface DbConfig {
  host: string;
  port: number;
  user: string;
  password: string;
  database: string;
}

export function createPool(db: DbConfig): Pool {
  return mysql.createPool({
    ...db,
    charset: 'utf8mb4',
    connectionLimit: 10,
    dateStrings: true,
    decimalNumbers: true,
  });
}

export async function waitForDatabase(pool: Pool, attempts = 30, delayMs = 2000): Promise<void> {
  for (let attempt = 1; attempt <= attempts; attempt++) {
    try {
      await pool.query('SELECT 1');
      return;
    } catch (error) {
      if (attempt === attempts) throw error;
      console.warn(`Database is not ready (attempt ${attempt}/${attempts}), retrying...`);
      await new Promise((resolve) => setTimeout(resolve, delayMs));
    }
  }
}

const PHOTO_BY_TYPE: Record<string, string> = {
  monitors: '/products/monitors.svg',
  laptops: '/products/laptops.svg',
  keyboards: '/products/keyboards.svg',
  motherboards: '/products/motherboards.svg',
  phones: '/products/phones.svg',
};

export const photoForType = (type: string): string =>
  PHOTO_BY_TYPE[type.trim().toLowerCase()] ?? '/products/default.svg';

interface OrderRow extends RowDataPacket {
  id: number;
  title: string;
  description: string | null;
  date: string;
  warehouse_id: number | null;
}

interface ProductRow extends RowDataPacket {
  id: number;
  serial_number: string;
  is_new: number;
  photo: string | null;
  title: string;
  type: string;
  specification: string;
  status: ProductStatus;
  guarantee_start: string;
  guarantee_end: string;
  order_id: number;
  date: string;
}

interface PriceRow extends RowDataPacket {
  product_id: number;
  value: number;
  symbol: Currency;
  is_default: number;
}

const toOrder = (row: OrderRow): Order => ({
  id: row.id,
  title: row.title,
  description: row.description ?? '',
  date: row.date,
  warehouseId: row.warehouse_id,
});

const toProduct = (row: ProductRow, price: Price[]): Product => ({
  id: row.id,
  serialNumber: row.serial_number,
  isNew: row.is_new === 1,
  photo: row.photo,
  title: row.title,
  type: row.type,
  specification: row.specification,
  status: row.status,
  guarantee: { start: row.guarantee_start, end: row.guarantee_end },
  price,
  order: row.order_id,
  date: row.date,
});

const nowAsSqlDateTime = (): string => {
  const d = new Date();
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
};

export function createMysqlRepositories(pool: Pool): Repositories {
  async function loadPrices(productIds: number[]): Promise<Map<number, Price[]>> {
    const byProduct = new Map<number, Price[]>();
    if (productIds.length === 0) return byProduct;
    const [rows] = await pool.query<PriceRow[]>(
      'SELECT product_id, value, symbol, is_default FROM product_prices WHERE product_id IN (?) ORDER BY is_default ASC, symbol ASC',
      [productIds],
    );
    for (const row of rows) {
      const list = byProduct.get(row.product_id) ?? [];
      list.push({ value: row.value, symbol: row.symbol, isDefault: row.is_default === 1 });
      byProduct.set(row.product_id, list);
    }
    return byProduct;
  }

  async function listProducts(filter: { type?: string; orderId?: number; id?: number } = {}): Promise<Product[]> {
    const where: string[] = [];
    const params: unknown[] = [];
    if (filter.type) {
      where.push('type = ?');
      params.push(filter.type);
    }
    if (filter.orderId) {
      where.push('order_id = ?');
      params.push(filter.orderId);
    }
    if (filter.id) {
      where.push('id = ?');
      params.push(filter.id);
    }
    const [rows] = await pool.query<ProductRow[]>(
      `SELECT * FROM products ${where.length ? `WHERE ${where.join(' AND ')}` : ''} ORDER BY date DESC, id ASC`,
      params,
    );
    const prices = await loadPrices(rows.map((row) => row.id));
    return rows.map((row) => toProduct(row, prices.get(row.id) ?? []));
  }

  return {
    users: {
      async findByEmail(email): Promise<UserWithPassword | null> {
        const [rows] = await pool.query<RowDataPacket[]>(
          'SELECT id, email, name, password_hash FROM users WHERE email = ? LIMIT 1',
          [email],
        );
        const row = rows[0];
        return row
          ? { id: row.id, email: row.email, name: row.name, passwordHash: row.password_hash }
          : null;
      },
      async findById(id): Promise<User | null> {
        const [rows] = await pool.query<RowDataPacket[]>(
          'SELECT id, email, name FROM users WHERE id = ? LIMIT 1',
          [id],
        );
        const row = rows[0];
        return row ? { id: row.id, email: row.email, name: row.name } : null;
      },
    },

    orders: {
      async list() {
        const [rows] = await pool.query<OrderRow[]>('SELECT * FROM orders ORDER BY date DESC, id DESC');
        return rows.map(toOrder);
      },
      async exists(id) {
        const [rows] = await pool.query<RowDataPacket[]>('SELECT 1 FROM orders WHERE id = ? LIMIT 1', [id]);
        return rows.length > 0;
      },
      async create(order: NewOrder) {
        const [result] = await pool.execute<ResultSetHeader>(
          'INSERT INTO orders (title, description, date, warehouse_id) VALUES (?, ?, ?, ?)',
          [order.title, order.description, order.date, order.warehouseId],
        );
        const [rows] = await pool.query<OrderRow[]>('SELECT * FROM orders WHERE id = ?', [result.insertId]);
        return toOrder(rows[0]!);
      },
      async remove(id) {
        const [result] = await pool.execute<ResultSetHeader>('DELETE FROM orders WHERE id = ?', [id]);
        return result.affectedRows > 0;
      },
    },

    products: {
      list: (filter) => listProducts(filter),
      async create(product: NewProduct) {
        const connection = await pool.getConnection();
        try {
          await connection.beginTransaction();
          const [result] = await connection.execute<ResultSetHeader>(
            `INSERT INTO products
              (serial_number, is_new, photo, title, type, specification, status, guarantee_start, guarantee_end, order_id, date)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
              product.serialNumber,
              product.isNew ? 1 : 0,
              photoForType(product.type),
              product.title,
              product.type,
              product.specification,
              product.status,
              product.guarantee.start,
              product.guarantee.end,
              product.order,
              nowAsSqlDateTime(),
            ],
          );
          for (const price of product.price) {
            await connection.execute(
              'INSERT INTO product_prices (product_id, value, symbol, is_default) VALUES (?, ?, ?, ?)',
              [result.insertId, price.value, price.symbol, price.isDefault ? 1 : 0],
            );
          }
          await connection.commit();
          const [created] = await listProducts({ id: result.insertId });
          return created!;
        } catch (error) {
          await connection.rollback();
          throw error;
        } finally {
          connection.release();
        }
      },
      async remove(id) {
        const [result] = await pool.execute<ResultSetHeader>('DELETE FROM products WHERE id = ?', [id]);
        return result.affectedRows > 0;
      },
    },

    warehouses: {
      async list(): Promise<Warehouse[]> {
        const [rows] = await pool.query<RowDataPacket[]>('SELECT * FROM warehouses ORDER BY id');
        return rows.map((row) => ({
          id: row.id,
          name: row.name,
          city: row.city,
          address: row.address,
          lat: Number(row.lat),
          lng: Number(row.lng),
        }));
      },
    },
  };
}
