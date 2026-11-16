-- RAINA JEWELS MySQL 8+ schema. First create/select your database in phpMyAdmin, then import this file.

CREATE TABLE IF NOT EXISTS users (
 id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
 name VARCHAR(100) NOT NULL,
 email VARCHAR(190) NOT NULL UNIQUE,
 phone VARCHAR(25) NULL,
 password_hash VARCHAR(255) NOT NULL,
 role ENUM('customer','admin') NOT NULL DEFAULT 'customer',
 is_active TINYINT(1) NOT NULL DEFAULT 1,
 created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
 updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS categories (
 id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
 name VARCHAR(80) NOT NULL UNIQUE,
 slug VARCHAR(100) NOT NULL UNIQUE,
 created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS products (
 id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
 slug VARCHAR(180) NOT NULL UNIQUE,
 name VARCHAR(160) NOT NULL,
 category_id BIGINT UNSIGNED NULL,
 price DECIMAL(12,2) NOT NULL,
 mrp DECIMAL(12,2) NOT NULL,
 stock INT NOT NULL DEFAULT 0,
 description TEXT NULL,
 image_urls JSON NULL,
 is_active TINYINT(1) NOT NULL DEFAULT 1,
 created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
 updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
 CONSTRAINT fk_products_category FOREIGN KEY(category_id) REFERENCES categories(id) ON DELETE SET NULL,
 INDEX idx_products_active(is_active), INDEX idx_products_category(category_id)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS banners (
 id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
 title VARCHAR(160) NOT NULL,
 image_url VARCHAR(1000) NOT NULL,
 link_url VARCHAR(500) NOT NULL DEFAULT 'shop.html',
 sort_order INT NOT NULL DEFAULT 0,
 is_active TINYINT(1) NOT NULL DEFAULT 1,
 created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS addresses (
 id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
 user_id BIGINT UNSIGNED NOT NULL,
 recipient_name VARCHAR(100) NOT NULL,
 phone VARCHAR(25) NOT NULL,
 address_line VARCHAR(500) NOT NULL,
 landmark VARCHAR(200) NULL,
 pincode VARCHAR(10) NOT NULL,
 city VARCHAR(100) NOT NULL,
 state VARCHAR(100) NOT NULL,
 is_default TINYINT(1) NOT NULL DEFAULT 0,
 created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
 FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE,
 INDEX idx_addresses_user(user_id)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS orders (
 id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
 order_number VARCHAR(40) NOT NULL UNIQUE,
 user_id BIGINT UNSIGNED NOT NULL,
 customer_name VARCHAR(100) NOT NULL,
 email VARCHAR(190) NOT NULL,
 phone VARCHAR(25) NOT NULL,
 address VARCHAR(500) NOT NULL,
 landmark VARCHAR(200) NULL,
 pincode VARCHAR(10) NOT NULL,
 city VARCHAR(100) NOT NULL,
 state VARCHAR(100) NOT NULL,
 delivery_note VARCHAR(1000) NULL,
 subtotal DECIMAL(12,2) NOT NULL,
 shipping DECIMAL(12,2) NOT NULL DEFAULT 0,
 discount DECIMAL(12,2) NOT NULL DEFAULT 0,
 gift_wrap DECIMAL(12,2) NOT NULL DEFAULT 0,
 total DECIMAL(12,2) NOT NULL,
 payment_method VARCHAR(40) NOT NULL,
 payment_status VARCHAR(40) NOT NULL DEFAULT 'Pending',
 confirmation_status ENUM('Pending','Confirmed','Rejected') NOT NULL DEFAULT 'Pending',
 order_status ENUM('Pending','Processing','Shipped','Delivered','Cancelled') NOT NULL DEFAULT 'Pending',
 created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
 updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
 FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE RESTRICT,
 INDEX idx_orders_user(user_id), INDEX idx_orders_created(created_at), INDEX idx_orders_status(order_status)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS order_items (
 id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
 order_id BIGINT UNSIGNED NOT NULL,
 product_id BIGINT UNSIGNED NULL,
 product_name VARCHAR(160) NOT NULL,
 unit_price DECIMAL(12,2) NOT NULL,
 quantity INT NOT NULL,
 line_total DECIMAL(12,2) NOT NULL,
 FOREIGN KEY(order_id) REFERENCES orders(id) ON DELETE CASCADE,
 FOREIGN KEY(product_id) REFERENCES products(id) ON DELETE SET NULL
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS payments (
 id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
 order_id BIGINT UNSIGNED NOT NULL,
 method VARCHAR(40) NOT NULL,
 provider VARCHAR(60) NULL,
 provider_reference VARCHAR(160) NULL,
 status VARCHAR(40) NOT NULL DEFAULT 'Pending',
 amount DECIMAL(12,2) NOT NULL,
 created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
 updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
 FOREIGN KEY(order_id) REFERENCES orders(id) ON DELETE CASCADE,
 INDEX idx_payments_order(order_id)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS cart_items (
 user_id BIGINT UNSIGNED NOT NULL,
 product_id BIGINT UNSIGNED NOT NULL,
 quantity INT NOT NULL DEFAULT 1,
 updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
 PRIMARY KEY(user_id,product_id),
 FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE,
 FOREIGN KEY(product_id) REFERENCES products(id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS wishlist (
 user_id BIGINT UNSIGNED NOT NULL,
 product_id BIGINT UNSIGNED NOT NULL,
 created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
 PRIMARY KEY(user_id,product_id),
 FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE,
 FOREIGN KEY(product_id) REFERENCES products(id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS coupons (
 id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
 code VARCHAR(40) NOT NULL UNIQUE,
 discount_type ENUM('percent','fixed','shipping') NOT NULL,
 discount_value DECIMAL(10,2) NOT NULL DEFAULT 0,
 max_discount DECIMAL(10,2) NULL,
 minimum_order DECIMAL(10,2) NOT NULL DEFAULT 0,
 is_active TINYINT(1) NOT NULL DEFAULT 1,
 expires_at DATETIME NULL,
 created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS login_events (
 id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
 user_id BIGINT UNSIGNED NOT NULL,
 method VARCHAR(50) NOT NULL,
 user_agent VARCHAR(500) NULL,
 ip_address VARCHAR(45) NULL,
 created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
 FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE,
 INDEX idx_login_events_created(created_at)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS newsletter_subscribers (
 id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
 email VARCHAR(190) NOT NULL UNIQUE,
 created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

INSERT IGNORE INTO coupons(code,discount_type,discount_value,max_discount,minimum_order) VALUES
('NEW15','percent',15,300,999),('RAINA10','percent',10,250,1499),('FREESHIP','shipping',0,0,499);

-- Add starter categories. Products can be created from Admin > Products.
INSERT IGNORE INTO categories(name,slug) VALUES
('Rings','rings'),('Earrings','earrings'),('Pendants','pendants'),('Necklaces','necklaces'),
('Bracelets','bracelets'),('Bangles','bangles'),('Chains','chains'),('Anklets','anklets'),('Jewellery Sets','jewellery-sets'),("Men's Jewellery",'mens-jewellery');

INSERT IGNORE INTO products(slug,name,category_id,price,mrp,stock,description,image_urls,is_active) VALUES
-- Starter catalogue from the existing RAINA product collection.,
('silver-flower-studs','Silver Flowery Snowflake Studs',(SELECT id FROM categories WHERE slug='earrings'),1999,3799,20,'Silver Flowery Snowflake Studs', '["https://images.unsplash.com/photo-1630019852942-f89202989a59?auto=format&fit=crop&w=900&q=85"]',1),
('silver-zircon-earrings','Silver Zircon Earrings',(SELECT id FROM categories WHERE slug='earrings'),2099,4699,20,'Silver Zircon Earrings', '["https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&w=900&q=85"]',1),
('rose-gold-deer-necklace','Rose Gold Deer Heart Necklace',(SELECT id FROM categories WHERE slug='necklaces'),1999,6199,20,'Rose Gold Deer Heart Necklace', '["https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=900&q=85"]',1),
('silver-solitaire-ring','Silver Classic Solitaire Ring',(SELECT id FROM categories WHERE slug='rings'),3999,8399,20,'Silver Classic Solitaire Ring', '["https://images.unsplash.com/photo-1605100804763-247f67b3557e?auto=format&fit=crop&w=900&q=85"]',1),
('minimal-gold-hoops','Minimal Gold Hoop Earrings',(SELECT id FROM categories WHERE slug='earrings'),499,999,20,'Minimal Gold Hoop Earrings', '["https://images.unsplash.com/photo-1635767798638-3665a7b5a4b2?auto=format&fit=crop&w=900&q=85"]',1),
('pearl-charm-bracelet','Pearl Charm Bracelet',(SELECT id FROM categories WHERE slug='bracelets'),699,1299,20,'Pearl Charm Bracelet', '["https://images.unsplash.com/photo-1611591437281-460bfbe1220a?auto=format&fit=crop&w=900&q=85"]',1),
('tiny-heart-pendant','Tiny Heart Pendant',(SELECT id FROM categories WHERE slug='pendants'),599,1199,20,'Tiny Heart Pendant', '["https://images.unsplash.com/photo-1617038220319-276d3cfab638?auto=format&fit=crop&w=900&q=85"]',1),
('silver-chain-anklet','Silver Everyday Anklet',(SELECT id FROM categories WHERE slug='anklets'),399,899,20,'Silver Everyday Anklet', '["https://images.unsplash.com/photo-1611652022419-a9419f74343d?auto=format&fit=crop&w=900&q=85"]',1),
('crystal-stud-pair','Crystal Mini Studs',(SELECT id FROM categories WHERE slug='earrings'),299,699,20,'Crystal Mini Studs', '["https://images.unsplash.com/photo-1617038260897-41a1f14a8ca0?auto=format&fit=crop&w=900&q=85"]',1),
('gold-plated-chain','Gold Plated Daily Chain',(SELECT id FROM categories WHERE slug='chains'),799,1599,20,'Gold Plated Daily Chain', '["https://images.unsplash.com/photo-1599459183200-59c7687a0278?auto=format&fit=crop&w=900&q=85"]',1),
('rose-quartz-ring','Rose Quartz Adjustable Ring',(SELECT id FROM categories WHERE slug='rings'),549,1099,20,'Rose Quartz Adjustable Ring', '["https://images.unsplash.com/photo-1603561591411-07134e71a2a9?auto=format&fit=crop&w=900&q=85"]',1),
('everyday-pendant','Everyday Sparkle Pendant',(SELECT id FROM categories WHERE slug='pendants'),449,999,20,'Everyday Sparkle Pendant', '["https://images.unsplash.com/photo-1602173574767-37ac01994b2a?auto=format&fit=crop&w=900&q=85"]',1),
('silver-leaf-bracelet','Silver Leaf Bracelet',(SELECT id FROM categories WHERE slug='bracelets'),649,1399,20,'Silver Leaf Bracelet', '["https://images.unsplash.com/photo-1573408301185-9146fe634ad0?auto=format&fit=crop&w=900&q=85"]',1),
('pearl-drop-earrings','Pearl Drop Earrings',(SELECT id FROM categories WHERE slug='earrings'),899,1799,20,'Pearl Drop Earrings', '["https://images.unsplash.com/photo-1630019852942-f89202989a59?auto=format&fit=crop&w=900&q=85"]',1),
('dainty-star-necklace','Dainty Star Necklace',(SELECT id FROM categories WHERE slug='necklaces'),749,1499,20,'Dainty Star Necklace', '["https://images.unsplash.com/photo-1611652022419-a9419f74343d?auto=format&fit=crop&w=900&q=85"]',1),
('stacking-band-ring','Minimal Stacking Band Ring',(SELECT id FROM categories WHERE slug='rings'),349,799,20,'Minimal Stacking Band Ring', '["https://images.unsplash.com/photo-1605100804763-247f67b3557e?auto=format&fit=crop&w=900&q=85"]',1);
