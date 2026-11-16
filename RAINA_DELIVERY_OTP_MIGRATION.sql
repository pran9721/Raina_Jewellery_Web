-- RAINA JEWELS: delivery tracking + OTP migration
-- Select your RAINA JEWELS database in phpMyAdmin before running this file.
ALTER TABLE orders
  ADD COLUMN tracking_number VARCHAR(100) NULL AFTER order_status,
  ADD COLUMN expected_delivery DATE NULL AFTER tracking_number,
  ADD COLUMN shipped_at DATETIME NULL AFTER expected_delivery,
  ADD COLUMN delivered_at DATETIME NULL AFTER shipped_at,
  ADD COLUMN delivery_otp CHAR(6) NULL AFTER delivered_at,
  ADD COLUMN otp_verified_at DATETIME NULL AFTER delivery_otp;
