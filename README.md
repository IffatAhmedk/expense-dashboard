# Hisaab — personal money dashboard

Where my money comes from and where it goes. Same stack and design system as the Rozana dashboard: Next.js 16, Prisma, Neon Postgres, SWR, recharts, Tailwind 4.

- **Overview** — spent, income, saved and savings rate for the chosen period; spend per tag; recent expenses; total across accounts.
- **Expenses** — every expense, filterable by tag (or "No tag") and searchable. An expense can carry several tags.
- **Income & accounts** — bank accounts, savings, wallets and cash with their balances, plus a log of income by source.
- **Tags** — create, rename, recolour and delete tags. Deleting a tag keeps the expenses; they just lose the label.

Account balances are entered by hand (what the bank app shows). Logging income does not change a balance.

## Setup

1. Create a Neon database (Vercel → Storage → Neon, or neon.tech) and copy `.env.example` to `.env` with its URLs.
2. Set `DASHBOARD_PASSWORD` and `AUTH_SECRET` (`openssl rand -hex 32`).
3. `npm install && npx prisma migrate deploy && npm run dev`

## Deploy (Vercel)

Import the repo on Vercel with **Root Directory** `expenses-dashboard`, connect the Neon store (it provides `POSTGRES_PRISMA_URL` and `POSTGRES_URL_NON_POOLING`), and add `DASHBOARD_PASSWORD` and `AUTH_SECRET` as environment variables. The `vercel-build` script runs `prisma migrate deploy` before building.
