# Administrator Manual

## Access

Visit `/admin` and sign in with an account that has an administrative role.

- Demo administrator: `admin@aurelia.demo` / `Aurelia!2026`
- Change the password immediately before using the platform publicly.

The left sidebar groups all back-office functions. Only the roles assigned to your account are permitted server-side; hiding a link is not the only control — every action re-checks permissions.

## Overview

Shows revenue, orders, customers, product count, low-stock variants, average order value and recent activity. Use the **7d / 30d / 90d** switch to change the reporting window. Charts cover revenue, order trends and best-selling products.

## Products

- **Add product** opens a drawer. Provide a name, description, brand, category, price (in pesewas), image URLs (one per line), colours as JSON (`[{"name":"Black","hex":"#161616"}]`) and comma-separated sizes.
- New products get generated variants (one per colour × size) with 10 units each. Adjust stock later in **Inventory**.
- Flags: *Featured* (homepage), *New arrival*, *Trending*.
- Status: *Draft* (hidden), *Published* (live), *Archived*.
- Edit with the pencil icon; delete with the trash icon (confirmation required).

## Categories & Brands

Create top-level categories or subcategories, set display order, image, gender and active state. Brands support name, logo, description and active state. Deleting a category also removes its direct children in demo mode.

## Inventory

Every product variant is listed with its SKU and current stock. Use **Adjust** to add/remove units and record a reason. All movements appear in the history table at the bottom, and order placement records automatic deductions.

## Orders

The orders table shows order number, customer, date, total, payment status and fulfilment status. Use the **Status** dropdown to move an order through:

`Pending Payment → Payment Confirmed → Processing → Packed → Dispatched → In Transit → Delivered`

Cancelled and refunded are terminal states. **Refund** marks an order refunded; always process the actual refund in Paystack first. The detail page shows items, totals, address, payment reference and the full activity timeline.

## Promotions

Create codes with:
- Type: percentage, fixed amount (pesewas) or free shipping.
- Minimum order value, usage limit, start/end dates.
- First-order-only restriction.
- Active toggle.

Common seed codes: `WELCOME10`, `SUMMER20`, `SAVE50`, `FREESHIP`.

## Customers & Staff

**Customers** lists registered accounts with order counts and roles. Passwords and payment data are never displayed.

**Staff & roles** toggles roles per user. Available roles: super admin, admin, product manager, order manager, inventory manager, customer support, marketing manager, customer. Changes take effect on the next request.

## Reviews

Approve or reject submitted reviews. Only approved reviews appear on product pages and update the product's average rating.

## Reports

Download CSV files for orders, products, customers, promotion usage and a 30-day summary. Use date filters on the dashboard for a narrower view.

## Homepage & Settings

- **Homepage**: edit the JSON blob controlling editorial copy and campaign cards. Save and check the storefront immediately.
- **Settings**: store name, announcement bar, contact details, shipping prices/free-shipping threshold and hero content.

## Order fulfilment workflow (recommended)

1. Customer places order → status **Pending Payment**.
2. Paystack webhook verifies payment → status **Payment Confirmed**.
3. Pick items → **Processing** → **Packed**.
4. Hand to courier → **Dispatched** → **In Transit**.
5. Confirm delivery → **Delivered**.
6. For returns, process the refund in Paystack then set **Refunded**.

## Security reminders

- Never share the `APPWRITE_API_KEY`, `PAYSTACK_SECRET_KEY` or `SESSION_SECRET`.
- Keep demo passwords out of production source.
- Review the audit log regularly for unexpected changes.
