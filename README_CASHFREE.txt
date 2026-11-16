RAINA JEWELS — CASHFREE PHP + MYSQL SANDBOX INTEGRATION

WHAT WAS CONNECTED
- Existing checkout.html now offers Cash on Delivery and Cashfree Online Payment.
- checkout.js creates Cashfree orders through the existing PHP API router.
- api/cashfree.php makes server-side Cashfree API calls using PHP HTTPS streams (OpenSSL); PHP cURL is not required.
- api/index.php creates a local MySQL order using server-side product prices, opens a Cashfree payment session, and verifies payment status server-to-server.
- payment-return.html verifies the order with the PHP backend before showing success.
- A signed webhook endpoint is available at api/index.php?action=cashfree-webhook.

SETUP (XAMPP / WINDOWS)
1. Copy api/config/cashfree.example.php to api/config/cashfree.php.
2. Open api/config/cashfree.php and enter your NEW Sandbox Client ID and Client Secret.
3. Keep environment = sandbox. Do not put credentials in HTML or JavaScript.
4. In XAMPP Control Panel, enable PHP cURL: open the active php.ini, find ;extension=curl, remove the leading semicolon, save, and restart Apache. If cURL is already enabled, no change is needed.
5. Start Apache and MySQL.
6. Open http://localhost/RAINA_JEWELS/checkout.html after adding an item and signing in.
7. Fill delivery details, select Pay Online with Cashfree, then continue. Cashfree Sandbox Checkout should open.
8. Complete a Sandbox test payment. Cashfree redirects to payment-return.html; the PHP backend checks the actual Cashfree order/payment status before marking MySQL orders/payments as Paid.

DATABASE
Uses the existing orders, order_items, payments, addresses, products, users, and coupons tables from this RAINA JEWELS MySQL schema. No new payment table is required. The payments table must include provider and provider_reference columns as in database.sql.

IMPORTANT SECURITY
- Never share Client Secret in chat, screenshots, frontend files, or GitHub.
- If a credential has ever been exposed, rotate it in Cashfree Dashboard and use a fresh key.
- Keep api/config/cashfree.php private. It is excluded by .gitignore and protected by api/config/.htaccess.
- Browser redirects are not trusted as payment proof. The server calls Cashfree's order and payments APIs.
- Webhook signature verification is implemented, but localhost cannot receive Cashfree webhooks directly. For webhook testing, expose the site using a secure HTTPS tunnel and configure the webhook URL in Cashfree Dashboard. The return-page server verification works without a webhook.
- Do not switch to production until Cashfree merchant onboarding/KYC is approved, HTTPS is configured, and live credentials are installed in a separately secured production config.

TROUBLESHOOTING
- “Cashfree is not configured”: ensure api/config/cashfree.php exists and contains Sandbox keys.
- cURL extension error: enable extension=curl in XAMPP php.ini and restart Apache.
- 401/403 from Cashfree: confirm Client ID and Secret belong to Sandbox, not Production.
- Order create error: inspect Apache error.log and the message shown on checkout; ensure outbound HTTPS is available.
- Do not retry a payment if money was debited but the page says pending. Check Cashfree Dashboard and the MySQL order first.

API VERSION: 2025-01-01
SANDBOX API BASE: https://sandbox.cashfree.com/pg
PRODUCTION API BASE (only after approval): https://api.cashfree.com/pg
