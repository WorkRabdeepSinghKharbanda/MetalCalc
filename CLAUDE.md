# CLAUDE.md — Agent Entry Point

Read before touching code, in order:

1. [README.md](README.md) — setup, dev/build/deploy commands.
2. This file — architecture + control flow, per feature.
3. [src/calc.js](src/calc.js) — pure metal pricing math (source of truth for units/purity).
4. Whichever feature section below matches the task.

## What this is

React app (Vite, JS, no TS), two domains sharing one deploy:
- **Precious metals**: live spot prices + calculators (Home, Batch, Holdings, Alerts, Compare, Widget).
- **US stocks**: fundamentals + portfolio tracking (Stocks page), via Finnhub.

No backend. Everything is client-side fetch + `localStorage`. Deployed to Vercel (`npx vercel --prod`), SPA rewrite in `vercel.json`.

## Global structure

```
src/
  App.jsx            routes + provider nesting, /widget bypasses Header/Footer
  main.jsx            entry, BrowserRouter
  calc.js              metal units/purity/symbols/colors + calculateValue/weightForValue
  index.css            design tokens (light/dark), base elements, toasts, skeleton
  App.css              every page/component's actual styles (one file, by section)
  context/
    MarketContext.jsx   wraps useMarketData + shared currency + local price history
    LanguageContext.jsx  EN/ES/HI strings for nav/hero/footer only (not full i18n)
    ToastContext.jsx     global toast notifications
  hooks/
    useMarketData.js    fetches gold-api.com + frankfurter.dev, auto-refresh
    useTheme.js          dark mode toggle, persisted
  utils/                one small file per persisted feature (see below)
  components/           shared UI pieces, reused across pages
  pages/                one file per route
  finnhub/              US stock API client (see Stocks section)
```

**Rule that bit us once:** never use a module-level `let nextId = 1` counter for anything written to `localStorage`. It resets on every reload while storage keeps old ids — a new item collides with an old one and `.map`/`.filter` by id then mutates both. Always `crypto.randomUUID()` for persisted item ids.

## Control flow — metals side

```
MarketProvider (wraps everything except /widget's bare render)
  └─ useMarketData: fetch gold-api.com/price/{XAU,XAG,XPT,XPD} + frankfurter.dev rates
       └─ prices, prevPrices (for ▲▼), rates, autoRefresh (30s optional)
       └─ MarketContext also appends every successful fetch to utils/priceHistory.js (local-only trend data)
  └─ currency (USD/INR/EUR/GBP/JPY) shared via context, symbols in utils/currency.js
```

## Feature: Home (`pages/Home.jsx`)

Hero (ticker, gold/silver ratio, "since you started tracking" digest from local history) → Calculator (`components/Calculator.jsx`, forward + reverse mode via `calculateValue`/`weightForValue`) → Features → AdSlot (empty reserved placeholder, no network wired) → PriceHistorySection (sparklines from local history).

## Feature: Batch (`pages/Batch.jsx`)

Ad-hoc multi-item calculator, nothing persisted except recipes/saved-batches explicitly saved.
- Row math: `calculateValue` per row, `CompositionBar` for the metal split.
- Reorder/duplicate/sort/Enter-to-add-row: all local state, `BatchRow.jsx`.
- "⋯ More" dropdown (`DropdownMenu.jsx`) holds sort/save/share/CSV/image/print — **don't add new toolbar buttons, extend this dropdown instead** (that's the uncluttered-UI convention across this app).
- Persisted: `utils/savedBatches.js` (named batches), `utils/recipes.js` (row templates).
- Share link encodes the whole batch into `?b=` (`utils/batchShare.js`), sanitized on decode against real `PURITIES`/`UNITS`/`SYMBOLS` — a tampered/hand-edited URL can't crash the page.

## Feature: Holdings (`pages/Holdings.jsx`)

Persistent portfolio (auto-saves every change, no manual save step — this is what distinguishes it from Batch).
- `utils/holdings.js` storage.
- CSV import matches columns **by header name** (`findColumn`), not position — more forgiving than Batch's export-only CSV.
- `PortfolioChart.jsx`: approximates value-over-time by running *today's* holdings against *past* local prices — clearly labeled as an approximation, it has no idea when you actually bought anything.

## Feature: Alerts (`pages/Alerts.jsx`)

Client-only price alerts — Notification API + `navigator.vibrate` + `utils/beep.js` (Web Audio oscillator, no audio asset). "Repeat" checkbox re-arms after a fixed 1hr cooldown instead of exposing a raw cooldown field. Only fires while the tab is open — no backend, no push, that's a known limitation not a bug.

## Feature: Compare (`pages/CompareBatches.jsx`)

Reads two saved batches (`utils/savedBatches.js`) side by side. Off the main nav on purpose — linked contextually from Batch's saved-batches section once ≥2 exist.

## Feature: Widget (`pages/Widget.jsx`)

`/widget` route, bypassed Header/Footer/Routes entirely in `App.jsx` (`isWidget` check) — meant to be `<iframe>`d elsewhere. Keep it minimal; anything added here should not need the rest of the site's chrome.

## Feature: US Stocks (`pages/Stocks.jsx`)

Separate data source from the metals side — **Finnhub**, needs `VITE_FINNHUB_API_KEY` (set in Vercel as **Config**, not Secret — it's a client-side `VITE_` var, it's in the public JS bundle regardless, Vercel will refuse `secret` type for a `VITE_`-prefixed name for exactly this reason). No backend proxy exists to hide it; if that's ever wanted, it means adding a Vercel serverless function under `api/`.

```
finnhub/
  client.js      thin fetch wrapper, throws 'Missing Finnhub API key' if unset (hasApiKey guards the whole page)
  normalize.js   ⚠️ the field names here were guessed from Finnhub docs, then verified once against a
                 real key (see below) — if a metric ever comes back null unexpectedly, check here first
hooks/
  useStockData.js    one symbol's full fundamentals + chart, parallel-fetched
  useQuotes.js       lightweight live price only, for every symbol in the portfolio table
  useSymbolSearch.js debounced ticker/company search
```

**Verified against a real free-tier key (2026-09-05):**
- ✅ `/quote`, `/stock/profile2`, `/stock/metric`, `/stock/recommendation`, `/search`, `/calendar/earnings` — all match `normalize.js` field names exactly.
- ✅ PEG is a **real field** (`pegTTM` / `forwardPEG`) — not derived-only as first assumed. `derivePeg()` in `normalize.js` is now just the fallback if both are ever missing.
- ❌ `/stock/candle` (price chart) and `/stock/price-target` return `"You don't have access to this resource"` on the free tier — both are caught and degrade to an honest message/hidden section, never a crash or fake data. Don't "fix" this by faking chart data; it needs a paid Finnhub plan.
- No formal "guidance" field exists on free tier — analyst recommendation counts + price target (when available) are the forward-looking proxy, labeled as such in the UI.

Portfolio: `utils/stockPortfolio.js`, same manual-entry model as Holdings (qty + avg buy price, live P&L/allocation computed client-side, no brokerage connection).

## Conventions to keep following

- Every currency symbol/list: `utils/currency.js` — don't reintroduce a local `SYMBOLS_CURRENCY` map in a new file, it was duplicated in 5 files before and got centralized once already.
- New batch/portfolio-style feature needing "not cluttered" UI → extend an existing `DropdownMenu`, don't add toolbar buttons.
- Anything that reads live third-party data must degrade to `—`/an honest message on missing fields, never `NaN` or a crash — see `fmt()` in `Stocks.jsx` for the pattern (`n == null || Number.isNaN(n)`).
- Pure logic gets a `node scripts/check-*.mjs` (assert-based, no framework) — see `calc.js`↔`check-calc.mjs`, `batchShare.js`↔`check-batch-share.mjs`, `parseCsv.js`↔`check-parse-csv.mjs`. Run all three plus `npm run build` and `npm run lint` before calling anything done.
