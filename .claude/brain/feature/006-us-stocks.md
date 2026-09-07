---
route: /stocks
entry_point: src/pages/Stocks.jsx
category: Markets
---

Search US stocks, view fundamentals (PE, PEG, EPS, growth), curated AI/Semi/Tech rankings, trade signals, watchlist and portfolio tracking with rebalancing, all prices shown in your selected currency (avg-buy price is still entered/stored in USD). Each portfolio row can be partially/fully sold (`$` button) with realized gain tracked (`src/utils/costBasis.js`, `RealizedGainsSection.jsx`) — no cross-lot FIFO, each add is its own lot. WhatsApp and Telegram trade alerts on the #1 PEG pick, both via Vercel serverless functions
(`api/send-whatsapp.js`, `api/send-telegram.js`) so secrets never reach the browser. Needs VITE_FINNHUB_API_KEY.
