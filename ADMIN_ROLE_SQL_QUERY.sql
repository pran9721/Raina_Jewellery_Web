-- RAINA JEWELS: promote the specified account to store admin.
-- Step 1: First create this account through login.html > Create Account.
-- Step 2: Select the raina_jewels database in phpMyAdmin > SQL and run this query.
UPDATE users
SET role = 'admin', is_active = 1
WHERE email = 'pranshubatham0@gmail.com';

-- Optional verification: this should return exactly one row.
SELECT id, name, email, role, is_active
FROM users
WHERE email = 'pranshubatham0@gmail.com';

-- Optional: remove admin role from every other account.
UPDATE users
SET role = 'customer'
WHERE email <> 'pranshubatham0@gmail.com' AND role = 'admin';
