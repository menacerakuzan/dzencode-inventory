-- Demo data. Demo user: admin@inventory.local / Admin123!
SET NAMES utf8mb4;
USE `inventory`;

INSERT INTO `users` (`id`, `email`, `password_hash`, `name`) VALUES
  (1, 'admin@inventory.local', '$2b$10$GkK6itX2WcA/rkWq79Zycum3Q3vL.OLmWnFtU6TS5hiG9fCzRe2iK', 'Illya Dovzhenko');

INSERT INTO `warehouses` (`id`, `name`, `city`, `address`, `lat`, `lng`) VALUES
  (1, 'Склад «Южный»', 'Одесса', 'ул. Балковская, 120', 46.466914, 30.694451),
  (2, 'Склад «Столичный»', 'Киев', 'ул. Магнитогорская, 1', 50.459420, 30.638140),
  (3, 'Склад «Западный»', 'Львов', 'ул. Городоцкая, 355', 49.815810, 23.945460),
  (4, 'Склад «Днепр»', 'Днепр', 'ул. Криворожская, 27', 48.427150, 34.977630);

INSERT INTO `orders` (`id`, `title`, `description`, `date`, `warehouse_id`) VALUES
  (1, 'Поставка мониторов Samsung и Dell', 'Мониторы для нового офиса в Одессе', '2026-02-04 10:15:00', 1),
  (2, 'Ноутбуки для отдела продаж', 'Плановое обновление парка ноутбуков', '2026-03-12 14:30:00', 2),
  (3, 'Периферия и комплектующие', 'Клавиатуры и материнские платы', '2026-05-18 16:40:00', 3),
  (4, 'Смартфоны для курьеров', 'Корпоративные телефоны службы доставки', '2026-07-01 11:20:00', 4);

INSERT INTO `products`
  (`id`, `serial_number`, `is_new`, `photo`, `title`, `type`, `specification`, `status`, `guarantee_start`, `guarantee_end`, `order_id`, `date`) VALUES
  (1, 'SN-26.0204101', 1, '/icons/monitors.svg',     'Samsung Odyssey G5 27" (LS27CG552)', 'Мониторы', '27" QHD, 165 Hz, VA', 'free',   '2026-02-04 10:15:00', '2028-02-04 10:15:00', 1, '2026-02-04 10:15:00'),
  (2, 'SN-26.0204102', 0, '/icons/monitors.svg',     'Samsung Odyssey G5 27" (LS27CG552)', 'Мониторы', '27" QHD, 165 Hz, VA', 'repair', '2026-02-04 10:15:00', '2028-02-04 10:15:00', 1, '2026-02-04 10:15:00'),
  (3, 'SN-26.0204103', 0, '/icons/monitors.svg',     'Dell P2422H',                        'Мониторы', '24" Full HD, IPS', 'free', '2026-02-04 10:15:00', '2027-02-04 10:15:00', 1, '2026-02-04 10:15:00'),

  (4, 'SN-26.0312201', 1, '/icons/laptops.svg',      'Lenovo ThinkPad T14 Gen 5',          'Ноутбуки', 'Intel Core Ultra 7, 32 GB RAM, 1 TB SSD', 'free', '2026-03-12 14:30:00', '2029-03-12 14:30:00', 2, '2026-03-12 14:30:00'),
  (5, 'SN-26.0312202', 1, '/icons/laptops.svg',      'Apple MacBook Air 13 M3',            'Ноутбуки', 'Apple M3, 16 GB RAM, 512 GB SSD', 'free', '2026-03-12 14:30:00', '2027-03-12 14:30:00', 2, '2026-03-12 14:30:00'),

  (6, 'SN-26.0518301', 1, '/icons/keyboards.svg',    'Logitech MX Keys S',                 'Клавиатуры', 'Wireless, backlit, UA/EN layout', 'free', '2026-05-18 16:40:00', '2028-05-18 16:40:00', 3, '2026-05-18 16:40:00'),
  (7, 'SN-12.3456789', 0, '/icons/motherboards.svg', 'Gigabyte Technology X58-USB3 (Socket 1366) 6 X58-USB3', 'Материнские платы', 'Socket 1366, Intel X58, ATX', 'repair', '2026-05-18 16:40:00', '2027-05-18 16:40:00', 3, '2026-05-18 16:40:00'),

  (8, 'SN-26.0701401', 1, '/icons/phones.svg',       'Samsung Galaxy A55 5G',              'Телефоны', '8/256 GB, 6.6" Super AMOLED', 'free', '2026-07-01 11:20:00', '2027-07-01 11:20:00', 4, '2026-07-01 11:20:00'),
  (9, 'SN-26.0701402', 1, '/icons/phones.svg',       'Apple iPhone 16',                    'Телефоны', '128 GB, 6.1" Super Retina XDR', 'free', '2026-07-01 11:20:00', '2027-07-01 11:20:00', 4, '2026-07-01 11:20:00');

INSERT INTO `product_prices` (`product_id`, `value`, `symbol`, `is_default`) VALUES
  (1, 289, 'USD', 0),  (1, 11993.50, 'UAH', 1),
  (2, 289, 'USD', 0),  (2, 11993.50, 'UAH', 1),
  (3, 189, 'USD', 0),  (3, 7843.50, 'UAH', 1),
  (4, 1450, 'USD', 0), (4, 60175.00, 'UAH', 1),
  (5, 1299, 'USD', 0), (5, 53908.50, 'UAH', 1),
  (6, 109, 'USD', 0),  (6, 4523.50, 'UAH', 1),
  (7, 149, 'USD', 0),  (7, 6183.50, 'UAH', 1),
  (8, 429, 'USD', 0),  (8, 17803.50, 'UAH', 1),
  (9, 829, 'USD', 0),  (9, 34403.50, 'UAH', 1);
