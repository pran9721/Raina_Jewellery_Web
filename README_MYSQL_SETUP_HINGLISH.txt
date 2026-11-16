RAINA JEWELS — PHP + MYSQL EDITION
=================================

This build replaces Firebase/Supabase data services with PHP 8+ and MySQL.
The website pages are still HTML/CSS/JavaScript; all account, catalogue, cart,
wishlist, address, coupon, order, payment record, banner and admin data is stored in MySQL.

REQUIREMENTS
------------
- PHP 8.1 or newer
- MySQL 8.0+ (MariaDB 10.5+ should also work)
- PHP extensions: PDO, pdo_mysql, mbstring, fileinfo
- Apache/Nginx hosting that executes PHP (XAMPP, WAMP, Laragon or cPanel)

IMPORTANT: VS Code Live Server does NOT execute PHP. Use XAMPP Apache or PHP hosting.

LOCAL XAMPP SETUP
-----------------
1. Install XAMPP and start Apache + MySQL.
2. Extract the project folder into: C:\\xampp\\htdocs\\raina
3. Open http://localhost/phpmyadmin
4. In phpMyAdmin create a database named raina_jewels, select it, then choose Import and import database.sql.
   It creates all tables, default coupons and starter products inside the selected database.
5. Open api/config/ inside the project.
6. Copy database.example.php and rename the copy to database.php.
7. Open database.php and set:
   host      = localhost
   database  = raina_jewels
   username  = root (default XAMPP)
   password  = blank only if your local MySQL root has no password
   On hosting use the database username/password supplied by your host.
8. Create the first admin from Command Prompt:
   cd C:\\xampp\\htdocs\\raina
   php create_admin.php pranshubatham0@gmail.com "Use-A-Strong-Password-Here" "Pranshu Batham"
   Use the specified admin email and choose your own strong password (at least 12 characters).
   Never share the admin password.
9. Open http://localhost/raina/login.html
10. Register a customer account and test login/signup.
11. Sign in to the admin account at the same login page; it will open /admin/index.html.

CPANEL / LIVE HOSTING
--------------------
1. Create a MySQL database and database user in cPanel.
2. Assign the user ALL PRIVILEGES on that database.
3. Select the database you created, then import database.sql using phpMyAdmin.
4. Upload the project files to public_html (or your chosen subfolder).
5. Copy api/config/database.example.php to api/config/database.php.
6. Enter the exact host, database name, database username and password from cPanel.
7. Create the admin using your hosting terminal/SSH:
   php create_admin.php pranshubatham0@gmail.com "Use-A-Strong-Password-Here" "Pranshu Batham"
   If terminal access is unavailable, ask your hosting provider to run this one-time command.
8. Visit your domain/login.html. Use HTTPS in production.

HOW ORDERS WORK
---------------
- Customer signup/login uses PHP password_hash/password_verify and PHP sessions.
- Checkout sends product references and quantities to the PHP API.
- The server checks current MySQL product prices and stock; it does not trust the browser's total.
- COD orders, order items, delivery address and payment record are written in one MySQL transaction.
- Admin > Orders & Payments reads MySQL and can Confirm, Reject, Process, Ship or Deliver.
- When marked Delivered, the COD payment record is marked Paid.
- Product stock is reserved when an order is placed and restored if an order is cancelled.
- Customer cart and wishlist sync to MySQL after login; browser local storage is used for the guest cart.
- Product/banner images are uploaded to this website's /uploads/products folder; image URLs are stored in MySQL.

SECURITY
--------
- Passwords are stored as PHP password hashes, never as plain text.
- PHP sessions use HttpOnly cookies and same-site protection.
- Write requests use a session CSRF token.
- Admin permissions are checked server-side from users.role='admin'.
- MySQL credentials belong only in api/config/database.php. Do not upload it to GitHub.
- Keep api/config protected; .htaccess denies direct access.
- Keep uploads writable by PHP but do not allow PHP execution in uploads.

ADMIN ACCOUNT
-------------
There is no hard-coded admin password. Create the first admin using create_admin.php.
To promote another account, run from a trusted terminal after editing the email:
  php create_admin.php admin@example.com "A-New-Strong-Password" "Admin Name"

MIGRATION NOTE
--------------
This is a new MySQL database. Existing Firebase users, Firestore products and past orders
are NOT automatically copied into MySQL. Export the old records and import them separately
if you need historical data. Starter products are included; update images/prices from Admin.

PAYMENTS
--------
Cash on Delivery is connected to the MySQL order flow.
The existing Cashfree backend folder is retained as a separate online-payment integration,
but this MySQL edition does not automatically configure Cashfree credentials. Set fresh
Cashfree credentials on the PHP/Node backend and test online payments separately before
enabling UPI in production. Do not put Cashfree secret keys in browser JavaScript.

KNOWN CONFIGURATION
-------------------
- Email verification and forgot-password email delivery require SMTP/mail configuration.
- Google login has been removed from this MySQL-only edition; email/password accounts are used.
- Set up HTTPS before taking real customer details.


ADMIN EMAIL ROUTING (IMPORTANT)
-------------------------------
The only permitted admin email is: pranshubatham0@gmail.com
1. Open login.html and create this account using the signup form.
2. Open phpMyAdmin > raina_jewels database > SQL.
3. Open ADMIN_ROLE_SQL_QUERY.sql, copy its first UPDATE query, and run it.
4. Sign out and sign in again. This account opens admin.html.
5. Every other account opens dashboard.html.
The backend checks both the MySQL role and the exact admin email; changing a browser-side URL cannot grant admin access.

You can alternatively use the command-line create_admin.php script with this exact email.
