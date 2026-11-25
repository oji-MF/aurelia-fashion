# Setup Guide

## 1. Local development (no credentials)

```bash
npm install
cp .env.example .env.local
npm run dev
```

The app creates `.data/store.json` on first request with 82 products, 14 categories, 10 brands, coupons, reviews and store settings. Delete that file to reset to the seed state.

Use the demo accounts shown in the README or on the sign-in page.

## 2. Appwrite backend

### Create the project
1. Sign in to [Appwrite Cloud](https://cloud.appwrite.io) and create a project.
2. Go to **Settings → API keys** and create a key with at least:
   - `databases.read` / `databases.write`
   - `collections.read` / `collections.write`
   - `documents.read` / `documents.write`
   - `users.read` / `users.write`
   - `attributes.read` / `attributes.write`
   - `indexes.read` / `indexes.write`
3. Under **Auth → Settings**, enable Email/Password and add `http://localhost:3000` (and your production URL) as a redirect origin.

### Configure `.env.local`
```env
NEXT_PUBLIC_APPWRITE_ENDPOINT=https://cloud.appwrite.io/v1
NEXT_PUBLIC_APPWRITE_PROJECT_ID=your-project-id
NEXT_PUBLIC_APPWRITE_DATABASE_ID=aurelia
APPWRITE_API_KEY=your-server-api-key
NEXT_PUBLIC_SITE_URL=http://localhost:3000
SESSION_SECRET=generate-with-openssl-rand-base64-32
```

### Storage and uploads
Set `APPWRITE_STORAGE_BUCKET_ID=product_images` to store admin uploads in Appwrite. `npm run appwrite:setup` creates the bucket with public read access and a 5 MB limit. Without it, uploads are written to a local demo directory and served through `/api/uploads/[...name]`.

### Create the schema and seed data
```bash
npm run appwrite:setup
npm run appwrite:seed
```

`setup-appwrite.mjs` creates every collection with attributes and indexes. It is idempotent — re-running it only adds missing fields/indexes. `seed-appwrite.mjs` upserts demo content by stable document IDs, so re-running it refreshes rather than duplicates.

### Data model notes
- Product images, colours, sizes, variants and JSON-like values are stored as large strings and parsed by `src/lib/data/serialize.ts`.
- Public catalogue collections allow public read; customer/order collections use document security and are accessed through the server API key.
- The `variants` field on products stores per-option stock; `inventory_movements` records every change.

### Going fully live on Appwrite
The demo fallback store is bypassed when `NEXT_PUBLIC_APPWRITE_PROJECT_ID` and `APPWRITE_API_KEY` are both set. At that point:
- Products, categories, brands and reviews come from Appwrite.
- Orders, addresses, coupons, audit logs and inventory are written to Appwrite.
- Sessions use Appwrite account sessions inside a signed, HTTP-only cookie.

## 3. Payments (Paystack)

1. Create a Paystack account and obtain a test/live secret key.
2. Add:
   ```env
   PAYSTACK_SECRET_KEY=sk_test_xxx
   NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY=pk_test_xxx
   ```
3. In the Paystack dashboard, add a webhook pointing to:
   ```
   https://<your-domain>/api/paystack/webhook
   ```
   Subscribe to `charge.success`.
4. Verification is server-side: the app calls Paystack's `/transaction/verify/:reference`, checks `status === success` and confirms the amount equals the recalculated order total before marking an order paid.
5. Duplicate webhook events are ignored via the `payment_webhook_events` collection.

**Stripe (optional):** set `STRIPE_SECRET_KEY` and `STRIPE_WEBHOOK_SECRET` to enable the Stripe checkout option.

## 4. Email (Resend)

```env
RESEND_API_KEY=re_xxx
EMAIL_FROM=AURELIA <hello@your-verified-domain.com>
```

Verify the sending domain in Resend. Templates live in `src/lib/email/index.ts`. Without a key, email sending is skipped and the app still functions.

## 5. GitHub & Vercel

1. Create a GitHub repository and push the project:
   ```bash
   git init
   git add .
   git commit -m "Initial AURELIA platform"
   git branch -M main
   git remote add origin <your-repo-url>
   git push -u origin main
   ```
2. In Vercel, **Add New → Project** and import the repository.
3. Add all environment variables from `.env.local` (excluding local-only values).
4. Set `NEXT_PUBLIC_SITE_URL` to the deployed domain.
5. Add the domain to Appwrite's allowed origins and Paystack's webhook list.
6. Confirm `/`, `/women`, `/product/<slug>`, `/cart`, `/login` and `/admin` on the production URL.

## Troubleshooting

| Symptom | Fix |
|---|---|
| Images not loading | Check `images.remotePatterns` in `next.config.ts` and that the Unsplash URL is reachable. |
| "Payments are not configured" | Add `PAYSTACK_SECRET_KEY`. |
| Admin redirect loop | Ensure the account has an admin role; in demo mode use `admin@aurelia.demo`. |
| Appwrite 401 errors | Confirm the API key scopes and that `APPWRITE_API_KEY` is server-side only. |
| Reset store | Delete `.data/store.json` and reload. |
