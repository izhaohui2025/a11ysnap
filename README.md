# A11ySnap

Honest, axe-powered accessibility snapshots of public pages.

- **Free:** paste a public URL → single-page scan → score, issues by severity, WCAG IDs, top-5 fix tips
- **Paid:** €39 one-time PDF via Stripe Checkout (webhook unlocks download)

> Automated findings only. Not a legal audit, certification, or guarantee of EAA/WCAG conformance.

We never claim EAA/ADA compliance, certification, guaranteed pass, or that a scan eliminates legal risk.

## Stack

- Next.js 14 (App Router) + TypeScript + Tailwind
- Playwright + `@axe-core/playwright`
- JSON file store under `./data` (no native SQLite build required)
- Stripe Checkout (`mode=payment`) + webhook

## Setup

```bash
cd a11ysnap
cp .env.example .env.local
# Edit .env.local with Stripe keys when ready
npm install          # postinstall installs Playwright Chromium
# If Chromium missing: npx playwright install chromium
npm run dev
```

Open http://localhost:3000

### Env vars

| Variable | Purpose |
|----------|---------|
| `NEXT_PUBLIC_BASE_URL` | Public origin (e.g. `http://localhost:3000`) |
| `STRIPE_SECRET_KEY` | Stripe secret key |
| `STRIPE_WEBHOOK_SECRET` | Webhook signing secret |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Publishable key (reserved for future client use) |
| `STRIPE_PRICE_ID` | Price for “A11ySnap PDF Report” (€39 / 3900 eur cents) |

Checkout returns a clear 503 if Stripe keys/price are placeholders or missing.

### Local Stripe webhook

```bash
stripe listen --forward-to localhost:3000/api/webhooks/stripe
```

Put the printed `whsec_…` into `.env.local` as `STRIPE_WEBHOOK_SECRET`.

## Demo: unlock PDF without Stripe

After a scan, note the id from `/scan/<id>`:

```bash
npm run mark-paid -- <scanId>
# then visit /api/pdf/<scanId> or click Download on the results page
```

## Routes

| Path | Role |
|------|------|
| `/` | Landing + URL input |
| `/scan/[id]` | Results + buy PDF CTA |
| `/report/[id]` | Print-friendly report (paid only; used by PDF) |
| `/privacy` | Short privacy note (≤30 days, public URLs) |
| `POST /api/scan` | `{ "url": "https://…" }` |
| `POST /api/checkout` | `{ "scanId": "…" }` → Stripe session URL |
| `POST /api/webhooks/stripe` | Unlocks PDF on `checkout.session.completed` |
| `GET /api/pdf/[id]` | PDF (402 until paid) |

## Rate limit

~5 free scans per IP per day (JSON counter in `data/rate-limit.json`).

## Notes

- Scans block localhost / private IPs.
- Retention target: ≤30 days (`expiresAt` stored on each scan).
- Score is a **progress metric**, not a legal grade.
