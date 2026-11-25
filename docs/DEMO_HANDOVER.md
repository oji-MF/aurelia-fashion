# Development Handover — Demo Credentials

**For development and demonstration only. Do not use these credentials in production.**

## Accounts

| Account | Email | Temporary password | Role |
|---|---|---|---|
| Administrator | `admin@aurelia.demo` | `Aurelia!2026` | Super Administrator |
| Customer | `customer@aurelia.demo` | `Aurelia!2026` | Customer |

Sign in at `/login`. The admin dashboard is at `/admin`.

**Required before go-live:** change both passwords, remove the demo account listing from `src/components/auth/auth-form.tsx`, and remove the demo accounts from `src/lib/config.ts`. Appwrite accounts are created by `npm run appwrite:setup`; the seed script does not create customer accounts.

## Demo payment codes

- `WELCOME10` — 10% off orders over GH₵150 (first order)
- `SUMMER20` — 20% off orders over GH₵300
- `SAVE50` — GH₵50 off orders over GH₵400
- `FREESHIP` — complimentary delivery

## Demo mode behaviour

With no Appwrite credentials, the app uses `.data/store.json`. To reset all demo data (including orders and users), stop the server, delete the file and restart.

Payments are not configured by default. After placing an order you can use **"Simulate payment confirmation (demo)"** on the confirmation page to move the order to *Payment Confirmed*. With Paystack configured, verification happens automatically via the server-side verify endpoint and webhook.

## What needs your credentials to go live

1. Appwrite project ID + API key → `npm run appwrite:setup && npm run appwrite:seed`
2. Paystack secret/public keys + webhook URL
3. Resend API key + verified sending domain
4. Vercel/GitHub repository and environment variables
5. `SESSION_SECRET` (generate with `openssl rand -base64 32`)
6. `NEXT_PUBLIC_SITE_URL` set to the production domain

See `docs/SETUP.md` for the step-by-step guide.
