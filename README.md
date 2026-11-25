# AURELIA — Premium Fashion E-Commerce Platform

A complete, production-oriented fashion retail platform built with **Next.js 15 (App Router)**, **TypeScript**, **Tailwind CSS** and **Appwrite** (database, auth, storage). It runs out of the box in demo mode with 47 seeded products, and switches to a real Appwrite backend as soon as credentials are supplied.

Payments (Paystack / Stripe), transactional email (Resend), SEO, RBAC, inventory, order tracking and a full admin dashboard are implemented behind environment variables.

---

## Quick start

```bash
npm install
cp .env.example .env.local
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

No credentials needed for demo mode. A local JSON store is created at `.data/store.json` on first run.

**Demo accounts**

| Role | Email | Password |
|---|---|---|
| Administrator | `admin@aurelia.demo` | `Aurelia!2026` |
| Customer | `customer@aurelia.demo` | `Aurelia!2026` |

Change these before using the platform publicly.

---

## What's implemented

### Storefront
- Editorial homepage: announcement bar, mega-menu navigation, campaign hero, category cards, new arrivals, trending products, seasonal campaigns, editorial section, brand showcase, newsletter, full footer.
- Category listing pages with server-side filtering (category, brand, price, size, colour, gender, availability, material, style, discount, rating), seven sort modes and pagination — all backed by the data layer, no hardcoded arrays.
- Product detail pages with gallery, colour/size variants, live stock, size guide, accordions, reviews, related products and Product JSON-LD.
- Autocomplete search (name, brand, category, SKU, style) with thumbnails and a results page.
- Shopping bag with guest persistence, quantity/variant controls and server-verified discount codes.
- Wishlist with guest persistence that follows the account after sign-in.
- Four-step checkout (information → address → shipping → payment) with server-authoritative repricing and stock re-checks.
- Customer accounts: registration, login, password reset, profile, addresses, order history, tracking, reviews and wishlist.
- Responsive layouts, focus states, reduced-motion support and semantic markup.

### Admin (`/admin`)
- Dashboard with revenue/order charts, best sellers, status breakdown, recent orders and audit log.
- Product CRUD with variants, images, pricing, status and merchandising flags.
- Category, brand, coupon, inventory, order, customer, review and staff-role management.
- Homepage content editor and store settings.
- CSV exports for orders, products, customers, promotions and summaries.
- Role-based access control (super admin, admin, product/order/inventory managers, support, marketing).

### Backend & integrations
- Appwrite service layer (`src/lib/data/`) with a demo fallback store for local development.
- Paystack initialization, server verification, signed webhook handling and duplicate prevention; optional Stripe checkout.
- Resend transactional email templates (order, payment, welcome, newsletter).
- Zod validation on every mutation, rate-friendly API routes, HTTP security headers.

---

## Switching to Appwrite

1. Create a project at [Appwrite Cloud](https://cloud.appwrite.io) (or self-host).
2. Add an API key with database and users scopes.
3. Fill in `NEXT_PUBLIC_APPWRITE_PROJECT_ID`, `APPWRITE_API_KEY` and optionally `NEXT_PUBLIC_APPWRITE_ENDPOINT` in `.env.local`.
4. Run `npm run appwrite:setup` to create the database, collections, attributes and indexes.
5. Run `npm run appwrite:seed` to load categories, brands, 46 products with variants, coupons and content.

The app automatically stops using the demo store when both the project ID and API key are present. See [docs/SETUP.md](docs/SETUP.md) for the full guide and [docs/ADMIN_MANUAL.md](docs/ADMIN_MANUAL.md) for daily operations.

---

## Scripts

| Command | Purpose |
|---|---|
| `npm run dev` | Development server |
| `npm run build` | Production build |
| `npm run start` | Serve production build |
| `npm run typecheck` | TypeScript check |
| `npm run lint` | ESLint |
| `npm run test` | Vitest suite |
| `npm run appwrite:setup` | Create Appwrite schema |
| `npm run appwrite:seed` | Load demo data into Appwrite |

---

## Project structure

```
src/
  app/
    (store)/            # Customer-facing routes (home, catalogue, PDP, cart, checkout, account…)
    admin/              # Admin dashboard
    api/                # Route handlers (search, pricing, webhooks, exports, auth)
    actions.ts          # Server actions
  components/
    layout/ products/ cart/ checkout/ account/ catalogue/ admin/ marketing/ ui/ auth/ store/
  lib/
    appwrite/           # Appwrite clients
    auth/               # Sessions, password hashing, RBAC
    data/               # Business services (catalogue, cart, orders, payments, admin…)
    demo/               # Local fallback store + seed data
    email/              # Resend templates
    types/ validations/ config.ts utils.ts
  app/globals.css
scripts/                # Appwrite setup & seed
docs/                   # Setup and admin manuals
```

---

## Live deployment

| Resource | URL |
|---|---|
| Production | https://aurelia-alpha-five.vercel.app |
| GitHub | https://github.com/oji-MF/aurelia-fashion |
| Vercel project | `prince-projects-projects/aurelia` |
| CI | `.github/workflows/ci.yml` (typecheck, tests, build on push/PR) |

The connected GitHub repository deploys `main` to production automatically and creates preview deployments for pull requests. `SESSION_SECRET`, `NEXT_PUBLIC_SITE_URL` and `NEXT_PUBLIC_STORE_NAME` are configured in Vercel.

> The live site currently runs in **demo mode** with a writable `/tmp` store (serverless-safe). Because serverless instances are ephemeral, orders and demo state do not persist across separate instances. Add Appwrite credentials for durable production data.

## Deployment setup (for your own accounts)

The project is ready for Vercel:

1. Push to GitHub (keep `.env.local` out of the repository).
2. Import the repository in Vercel.
3. Add the environment variables from `.env.example`.
4. Set `NEXT_PUBLIC_SITE_URL` to the production domain.
5. In Appwrite Auth, add the production URL to the allowed redirect origins.
6. Register Paystack webhook: `https://<domain>/api/paystack/webhook`.

Preview deployments work automatically from pull requests. Production data lives in Appwrite, so no local state is required.

> **Note:** Deployment to your own Vercel/GitHub/Appwrite/Paystack accounts requires your credentials. This repository contains all code and configuration needed; add the keys and run the setup scripts to go live.

---

## Security notes

- API keys and payment secrets are server-only; only `NEXT_PUBLIC_*` values reach the browser.
- Webhook signatures are verified with HMAC-SHA512.
- Order totals are recalculated server-side from database prices.
- Stock is decremented atomically in demo mode and guarded by re-checks in Appwrite mode.
- Admin actions re-verify permissions server-side and write audit entries.
- `.env*` and `.data` are gitignored.
