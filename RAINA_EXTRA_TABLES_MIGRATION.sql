-- RAINA JEWELS: supporting tables/columns used by the PHP API.
-- Safe to run more than once on MySQL/MariaDB versions supporting CREATE TABLE IF NOT EXISTS.

SET @db_name = DATABASE();

SET @sql = IF(
  (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA=@db_name AND TABLE_NAME='payments' AND COLUMN_NAME='provider')=0,
  'ALTER TABLE payments ADD COLUMN provider VARCHAR(50) NULL AFTER method',
  'SELECT "payments.provider already exists"'
);
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @sql = IF(
  (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA=@db_name AND TABLE_NAME='payments' AND COLUMN_NAME='provider_reference')=0,
  'ALTER TABLE payments ADD COLUMN provider_reference VARCHAR(150) NULL AFTER provider',
  'SELECT "payments.provider_reference already exists"'
);
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

CREATE TABLE IF NOT EXISTS wishlist (
  id INT(11) NOT NULL AUTO_INCREMENT,
  user_id INT(11) NOT NULL,
  product_id INT(11) NOT NULL,
  created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_wishlist_user_product (user_id, product_id),
  KEY idx_wishlist_product (product_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS banners (
  id INT(11) NOT NULL AUTO_INCREMENT,
  title VARCHAR(160) NOT NULL,
  image_url VARCHAR(1000) NOT NULL,
  link_url VARCHAR(500) NOT NULL DEFAULT 'shop.html',
  sort_order INT(11) NOT NULL DEFAULT 0,
  is_active TINYINT(1) NOT NULL DEFAULT 1,
  created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS coupons (
  id INT(11) NOT NULL AUTO_INCREMENT,
  code VARCHAR(40) NOT NULL,
  discount_type ENUM('percent','fixed','shipping') NOT NULL,
  discount_value DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  minimum_order DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  max_discount DECIMAL(10,2) NULL DEFAULT NULL,
  expires_at DATETIME NULL DEFAULT NULL,
  is_active TINYINT(1) NOT NULL DEFAULT 1,
  created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_coupons_code (code)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS newsletter_subscribers (
  id INT(11) NOT NULL AUTO_INCREMENT,
  email VARCHAR(190) NOT NULL,
  created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_newsletter_email (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
