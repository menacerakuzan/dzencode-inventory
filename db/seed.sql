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
  (3, 'Периферия: клавиатуры Logitech и Keychron', 'Клавиатуры для рабочих мест', '2026-04-22 09:05:00', 1),
  (4, 'Серверное оборудование Gigabyte', 'Материнские платы для сборки серверов', '2026-05-18 16:40:00', 3),
  (5, 'Смартфоны для курьеров', 'Корпоративные телефоны службы доставки', '2026-07-01 11:20:00', 4),
  (6, 'Мониторы для дизайн-студии', 'Профессиональные мониторы с калибровкой', '2026-08-27 13:00:00', 2);

INSERT INTO `products`
  (`id`, `serial_number`, `is_new`, `photo`, `title`, `type`, `specification`, `status`, `guarantee_start`, `guarantee_end`, `order_id`, `date`) VALUES
  (1,  'SN-26.0204101', 1, '/products/monitors.svg',     'Samsung Odyssey G5 27" (LS27CG552)', 'Monitors', '27" QHD, 165 Hz, VA', 'free',   '2026-02-04 10:15:00', '2028-02-04 10:15:00', 1, '2026-02-04 10:15:00'),
  (2,  'SN-26.0204102', 0, '/products/monitors.svg',     'Samsung Odyssey G5 27" (LS27CG552)', 'Monitors', '27" QHD, 165 Hz, VA', 'repair', '2026-02-04 10:15:00', '2028-02-04 10:15:00', 1, '2026-02-04 10:15:00'),
  (3,  'SN-26.0204103', 1, '/products/monitors.svg',     'Dell UltraSharp U2723QE',            'Monitors', '27" 4K UHD, IPS Black, USB-C', 'free', '2026-02-04 10:15:00', '2029-02-04 10:15:00', 1, '2026-02-04 10:15:00'),
  (4,  'SN-26.0204104', 1, '/products/monitors.svg',     'Dell UltraSharp U2723QE',            'Monitors', '27" 4K UHD, IPS Black, USB-C', 'free', '2026-02-04 10:15:00', '2029-02-04 10:15:00', 1, '2026-02-04 10:15:00'),
  (5,  'SN-26.0204105', 0, '/products/monitors.svg',     'Dell P2422H',                        'Monitors', '24" Full HD, IPS', 'free', '2026-02-04 10:15:00', '2027-02-04 10:15:00', 1, '2026-02-04 10:15:00'),

  (6,  'SN-26.0312201', 1, '/products/laptops.svg',      'Lenovo ThinkPad T14 Gen 5',          'Laptops', 'Intel Core Ultra 7, 32 GB RAM, 1 TB SSD', 'free', '2026-03-12 14:30:00', '2029-03-12 14:30:00', 2, '2026-03-12 14:30:00'),
  (7,  'SN-26.0312202', 1, '/products/laptops.svg',      'Lenovo ThinkPad T14 Gen 5',          'Laptops', 'Intel Core Ultra 7, 32 GB RAM, 1 TB SSD', 'free', '2026-03-12 14:30:00', '2029-03-12 14:30:00', 2, '2026-03-12 14:30:00'),
  (8,  'SN-26.0312203', 1, '/products/laptops.svg',      'Apple MacBook Air 13 M3',            'Laptops', 'Apple M3, 16 GB RAM, 512 GB SSD', 'free', '2026-03-12 14:30:00', '2027-03-12 14:30:00', 2, '2026-03-12 14:30:00'),
  (9,  'SN-26.0312204', 0, '/products/laptops.svg',      'Dell Latitude 5440',                 'Laptops', 'Intel Core i5-1345U, 16 GB RAM, 512 GB SSD', 'repair', '2026-03-12 14:30:00', '2027-03-12 14:30:00', 2, '2026-03-12 14:30:00'),

  (10, 'SN-26.0422301', 1, '/products/keyboards.svg',    'Logitech MX Keys S',                 'Keyboards', 'Wireless, backlit, UA/EN layout', 'free', '2026-04-22 09:05:00', '2028-04-22 09:05:00', 3, '2026-04-22 09:05:00'),
  (11, 'SN-26.0422302', 1, '/products/keyboards.svg',    'Logitech MX Keys S',                 'Keyboards', 'Wireless, backlit, UA/EN layout', 'free', '2026-04-22 09:05:00', '2028-04-22 09:05:00', 3, '2026-04-22 09:05:00'),
  (12, 'SN-26.0422303', 0, '/products/keyboards.svg',    'Logitech MX Keys S',                 'Keyboards', 'Wireless, backlit, UA/EN layout', 'repair', '2026-04-22 09:05:00', '2028-04-22 09:05:00', 3, '2026-04-22 09:05:00'),
  (13, 'SN-26.0422304', 1, '/products/keyboards.svg',    'Keychron K8 Pro',                    'Keyboards', 'Mechanical, Gateron Brown, TKL', 'free', '2026-04-22 09:05:00', '2027-04-22 09:05:00', 3, '2026-04-22 09:05:00'),
  (14, 'SN-26.0422305', 1, '/products/keyboards.svg',    'Logitech K380',                      'Keyboards', 'Bluetooth, multi-device, compact', 'free', '2026-04-22 09:05:00', '2027-04-22 09:05:00', 3, '2026-04-22 09:05:00'),

  (15, 'SN-12.3456789', 0, '/products/motherboards.svg', 'Gigabyte Technology X58-USB3 (Socket 1366) 6 X58-USB3', 'Motherboards', 'Socket 1366, Intel X58, ATX', 'free', '2026-05-18 16:40:00', '2027-05-18 16:40:00', 4, '2026-05-18 16:40:00'),
  (16, 'SN-12.3456790', 0, '/products/motherboards.svg', 'Gigabyte Technology X58-USB3 (Socket 1366) 6 X58-USB3', 'Motherboards', 'Socket 1366, Intel X58, ATX', 'repair', '2026-05-18 16:40:00', '2027-05-18 16:40:00', 4, '2026-05-18 16:40:00'),
  (17, 'SN-26.0518403', 1, '/products/motherboards.svg', 'Gigabyte B650 AORUS Elite AX',       'Motherboards', 'Socket AM5, AMD B650, ATX, Wi-Fi 6E', 'free', '2026-05-18 16:40:00', '2029-05-18 16:40:00', 4, '2026-05-18 16:40:00'),
  (18, 'SN-26.0518404', 1, '/products/motherboards.svg', 'Gigabyte Z790 AORUS Pro X',          'Motherboards', 'Socket LGA1700, Intel Z790, ATX', 'free', '2026-05-18 16:40:00', '2029-05-18 16:40:00', 4, '2026-05-18 16:40:00'),

  (19, 'SN-26.0701501', 1, '/products/phones.svg',       'Samsung Galaxy A55 5G',              'Phones', '8/256 GB, 6.6" Super AMOLED', 'free', '2026-07-01 11:20:00', '2027-07-01 11:20:00', 5, '2026-07-01 11:20:00'),
  (20, 'SN-26.0701502', 1, '/products/phones.svg',       'Samsung Galaxy A55 5G',              'Phones', '8/256 GB, 6.6" Super AMOLED', 'free', '2026-07-01 11:20:00', '2027-07-01 11:20:00', 5, '2026-07-01 11:20:00'),
  (21, 'SN-26.0701503', 1, '/products/phones.svg',       'Samsung Galaxy A55 5G',              'Phones', '8/256 GB, 6.6" Super AMOLED', 'repair', '2026-07-01 11:20:00', '2027-07-01 11:20:00', 5, '2026-07-01 11:20:00'),
  (22, 'SN-26.0701504', 1, '/products/phones.svg',       'Apple iPhone 16',                    'Phones', '128 GB, 6.1" Super Retina XDR', 'free', '2026-07-01 11:20:00', '2027-07-01 11:20:00', 5, '2026-07-01 11:20:00'),

  (23, 'SN-26.0827601', 1, '/products/monitors.svg',     'Apple Studio Display',               'Monitors', '27" 5K Retina, Nano-texture', 'free', '2026-08-27 13:00:00', '2027-08-27 13:00:00', 6, '2026-08-27 13:00:00'),
  (24, 'SN-26.0827602', 1, '/products/monitors.svg',     'Dell UltraSharp U3225QE',            'Monitors', '32" 4K UHD, IPS Black, 120 Hz', 'free', '2026-08-27 13:00:00', '2029-08-27 13:00:00', 6, '2026-08-27 13:00:00'),
  (25, 'SN-26.0827603', 0, '/products/monitors.svg',     'BenQ PD2706UA',                      'Monitors', '27" 4K UHD, IPS, Pantone Validated', 'free', '2026-08-27 13:00:00', '2029-08-27 13:00:00', 6, '2026-08-27 13:00:00');

INSERT INTO `product_prices` (`product_id`, `value`, `symbol`, `is_default`) VALUES
  (1, 289, 'USD', 0),  (1, 11993.50, 'UAH', 1),
  (2, 289, 'USD', 0),  (2, 11993.50, 'UAH', 1),
  (3, 579, 'USD', 0),  (3, 24028.50, 'UAH', 1),
  (4, 579, 'USD', 0),  (4, 24028.50, 'UAH', 1),
  (5, 189, 'USD', 0),  (5, 7843.50, 'UAH', 1),
  (6, 1450, 'USD', 0), (6, 60175.00, 'UAH', 1),
  (7, 1450, 'USD', 0), (7, 60175.00, 'UAH', 1),
  (8, 1299, 'USD', 0), (8, 53908.50, 'UAH', 1),
  (9, 899, 'USD', 0),  (9, 37308.50, 'UAH', 1),
  (10, 109, 'USD', 0), (10, 4523.50, 'UAH', 1),
  (11, 109, 'USD', 0), (11, 4523.50, 'UAH', 1),
  (12, 109, 'USD', 0), (12, 4523.50, 'UAH', 1),
  (13, 119, 'USD', 0), (13, 4938.50, 'UAH', 1),
  (14, 39, 'USD', 0),  (14, 1618.50, 'UAH', 1),
  (15, 149, 'USD', 0), (15, 6183.50, 'UAH', 1),
  (16, 149, 'USD', 0), (16, 6183.50, 'UAH', 1),
  (17, 219, 'USD', 0), (17, 9088.50, 'UAH', 1),
  (18, 389, 'USD', 0), (18, 16143.50, 'UAH', 1),
  (19, 429, 'USD', 0), (19, 17803.50, 'UAH', 1),
  (20, 429, 'USD', 0), (20, 17803.50, 'UAH', 1),
  (21, 429, 'USD', 0), (21, 17803.50, 'UAH', 1),
  (22, 829, 'USD', 0), (22, 34403.50, 'UAH', 1),
  (23, 1899, 'USD', 0), (23, 78808.50, 'UAH', 1),
  (24, 899, 'USD', 0), (24, 37308.50, 'UAH', 1),
  (25, 549, 'USD', 0), (25, 22783.50, 'UAH', 1);
