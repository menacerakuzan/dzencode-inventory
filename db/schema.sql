-- Inventory: Orders & Products
-- MySQL 8.x. Open in MySQL Workbench: File -> Open SQL Script,
-- or Database -> Reverse Engineer / File -> Import -> Reverse Engineer MySQL Create Script (ER diagram).

SET NAMES utf8mb4;

CREATE DATABASE IF NOT EXISTS `inventory`
  DEFAULT CHARACTER SET utf8mb4
  DEFAULT COLLATE utf8mb4_unicode_ci;

USE `inventory`;

-- Users who can sign in (JWT auth)
CREATE TABLE IF NOT EXISTS `users` (
  `id`            INT UNSIGNED    NOT NULL AUTO_INCREMENT,
  `email`         VARCHAR(191)    NOT NULL,
  `password_hash` VARCHAR(100)    NOT NULL,
  `name`          VARCHAR(120)    NOT NULL,
  `created_at`    DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_users_email` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Warehouses where orders (incomes) arrive; coordinates are used by the map
CREATE TABLE IF NOT EXISTS `warehouses` (
  `id`      INT UNSIGNED   NOT NULL AUTO_INCREMENT,
  `name`    VARCHAR(120)   NOT NULL,
  `city`    VARCHAR(80)    NOT NULL,
  `address` VARCHAR(255)   NOT NULL,
  `lat`     DECIMAL(9,6)   NOT NULL,
  `lng`     DECIMAL(9,6)   NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Orders ("приходы")
CREATE TABLE IF NOT EXISTS `orders` (
  `id`           INT UNSIGNED  NOT NULL AUTO_INCREMENT,
  `title`        VARCHAR(255)  NOT NULL,
  `description`  TEXT          NULL,
  `date`         DATETIME      NOT NULL,
  `warehouse_id` INT UNSIGNED  NULL,
  `created_at`   DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_orders_date` (`date`),
  KEY `idx_orders_warehouse` (`warehouse_id`),
  CONSTRAINT `fk_orders_warehouse`
    FOREIGN KEY (`warehouse_id`) REFERENCES `warehouses` (`id`)
    ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Products; every product belongs to exactly one order
CREATE TABLE IF NOT EXISTS `products` (
  `id`              INT UNSIGNED  NOT NULL AUTO_INCREMENT,
  `serial_number`   VARCHAR(64)   NOT NULL,
  `is_new`          TINYINT(1)    NOT NULL DEFAULT 1,
  `photo`           VARCHAR(255)  NULL,
  `title`           VARCHAR(255)  NOT NULL,
  `type`            VARCHAR(64)   NOT NULL,
  `specification`   VARCHAR(255)  NOT NULL,
  `status`          ENUM('free','repair') NOT NULL DEFAULT 'free',
  `guarantee_start` DATETIME      NOT NULL,
  `guarantee_end`   DATETIME      NOT NULL,
  `order_id`        INT UNSIGNED  NOT NULL,
  `date`            DATETIME      NOT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_products_type` (`type`),
  KEY `idx_products_order` (`order_id`),
  CONSTRAINT `fk_products_order`
    FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`)
    ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `chk_products_guarantee` CHECK (`guarantee_end` >= `guarantee_start`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Product prices in several currencies (one row per currency, one of them is default)
CREATE TABLE IF NOT EXISTS `product_prices` (
  `id`         INT UNSIGNED   NOT NULL AUTO_INCREMENT,
  `product_id` INT UNSIGNED   NOT NULL,
  `value`      DECIMAL(12,2)  NOT NULL,
  `symbol`     CHAR(3)        NOT NULL,
  `is_default` TINYINT(1)     NOT NULL DEFAULT 0,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_product_prices_currency` (`product_id`, `symbol`),
  CONSTRAINT `fk_product_prices_product`
    FOREIGN KEY (`product_id`) REFERENCES `products` (`id`)
    ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `chk_product_prices_value` CHECK (`value` >= 0)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
