# US Stocks

- **Route:** `/stocks`
- **Entry point:** `src/pages/Stocks.jsx`
- **Category:** Markets

Search US stocks, view fundamentals (PE, PEG, EPS, growth), curated AI/Semi/Tech rankings, trade signals, watchlist and portfolio tracking with rebalancing, all prices shown in your selected currency (avg-buy price is still entered/stored in USD). Each portfolio row can be partially/fully sold (`$` button) with realized gain tracked (`src/utils/costBasis.js`, `RealizedGainsSection.jsx`) — no cross-lot FIFO, each add is its own lot. Needs VITE_FINNHUB_API_KEY.
