# MetalCalc

Live gold/silver/platinum/palladium prices, a purity calculator, and a growing set of
free tools for precious metals, US stocks and crypto — all client-side, no backend,
no account required.

**Live:** https://metal-calc-two.vercel.app

## Stack

- Vite + React (JS, no TypeScript)
- React Router (SPA, client-side routing)
- No backend — all data is fetched client-side and persisted in `localStorage`
- One Vercel serverless function (`api/send-whatsapp.js`) for WhatsApp trade alerts
- PWA (installable, offline-capable for cached pages) via `vite-plugin-pwa`

## Getting started

```bash
npm install
npm run dev
```

### Environment variables

Copy `.env.example` to `.env.local` and fill in what you need:

- `VITE_FINNHUB_API_KEY` — required for the Stocks page (search, quotes, fundamentals).
  Free tier at [finnhub.io/register](https://finnhub.io/register). This is a public,
  client-side key (`VITE_`-prefixed vars are bundled into the JS, not secret) — the
  free tier has no meaningful abuse risk from being public.
- Crypto (`/crypto`) needs no key — it uses CoinGecko's free public API directly.
- WhatsApp trade alerts need Twilio credentials set as **server-only** env vars
  (`TWILIO_ACCOUNT_SID`, `TWILIO_API_KEY_SID`/`TWILIO_API_KEY_SECRET` or
  `TWILIO_AUTH_TOKEN`, `TWILIO_WHATSAPP_FROM`) on Vercel — see `api/send-whatsapp.js`.

## Scripts

```bash
npm run dev            # local dev server
npm run build           # production build
npm run lint            # oxlint
node scripts/check-calc.mjs         # pure calc.js unit checks (assert-based, no framework)
node scripts/check-batch-share.mjs  # batch share-link encode/decode checks
node scripts/check-parse-csv.mjs    # CSV parser checks
node scripts/check-position-size.mjs # position-sizing math checks
```

Run all four `check-*.mjs` scripts plus `npm run build` and `npm run lint` before
considering any change to `calc.js`, `batchShare.js`, `parseCsv.js` or
`positionSize.js` done — they're the only pure-logic modules with dedicated checks.

## Deploying

Deployed via Vercel CLI, not git-integrated auto-deploy:

```bash
npx vercel --prod --yes
```

`vercel.json` has a single SPA rewrite (`/(.*)` → `/index.html`) so React Router
handles all client-side routes.

## What's in here

**Precious metals** — Home (live ticker + calculator + gold/silver ratio + local
price history), Batch (multi-item lot valuation), Holdings (persistent portfolio
with gain/loss and an insurance-ready description field), Price Alerts, Compare
Batches, an embeddable `/widget`.

**US Stocks** (`/stocks`) — search, fundamentals (PE, PEG, EPS, growth, analyst
recommendations), curated AI/Semiconductor/Tech rankings, a rule-based Buy/Sell
signal section, a watchlist, portfolio tracking with rebalancing suggestions, a
dividend income estimate, and WhatsApp trade alerts. Needs `VITE_FINNHUB_API_KEY`.

**Crypto** (`/crypto`) — search, Top 10/25/50 by market cap, curated
Layer1/DeFi/Meme rankings, the same rule-based Buy/Sell signals, watchlist,
portfolio tracking with rebalancing. No API key needed (CoinGecko public API).

**Tools** (grouped under the header's "Tools ▾" menu) — purity/weight/alloy
converters, a Zakat calculator, loan-against-gold LTV, a savings-goal projector,
storage/insurance cost estimate, melt-vs-retail markup and jewelry-bill-breakdown
checkers, an FX rate margin checker, a tax reverse calculator, a cross-asset Net
Worth dashboard (combines Holdings + Stocks + Crypto), a position-sizing/risk
calculator, and full-data Backup & Restore (exports everything to one JSON file).

**Navigation** — press `⌘K` / `Ctrl+K` anywhere to jump straight to any page.

## Architecture notes

Everything is client-side `fetch` + `localStorage` — there's no database and no
user accounts. See [CLAUDE.md](CLAUDE.md) for the full per-feature breakdown, the
conventions this codebase follows (e.g. always `crypto.randomUUID()` for persisted
item ids, never an incrementing counter), and known limitations of the free-tier
APIs in use (Finnhub, CoinGecko).
