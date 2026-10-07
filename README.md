# OX Processing · 0xProcessing checkout

```text
backend/          API, webhook, PostgreSQL
backend/.env      keys + DATABASE_URL
frontend/         Checkout + pending approve page
```

## Setup

1. Fill `backend/.env` (`OXP_MERCHANT_ID`, `OXP_API_KEY`, `OXP_WEBHOOK_PASSWORD`).
2. `npm install`
3. `npm start`
4. Open http://localhost:3000

By default `USE_EMBEDDED_POSTGRES=true` starts a local PostgreSQL in `backend/data/pg`.
For your own Postgres set `USE_EMBEDDED_POSTGRES=false` and a real `DATABASE_URL`.

## Payment flow

1. Create payment → row saved as `pending` in `transactions`.
2. 0xProcessing webhook updates status to `paid` / `failed`.
3. Pending page polls `/api/transactions/:id` every 3s.
4. Approve button calls `/api/transactions/approve` only if that ID exists and status is `paid`.

Webhook callback URL in `.env`: `CALLBACK_PUBLIC_URL` (also set the same URL in the 0xProcessing portal).
