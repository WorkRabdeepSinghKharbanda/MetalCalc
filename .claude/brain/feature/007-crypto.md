# Crypto

- **Route:** `/crypto`
- **Entry point:** `src/pages/Crypto.jsx`
- **Category:** Markets

Search crypto, Top 10/25/50 by market cap, curated Layer1/DeFi/Meme rankings, per-timeframe (15m-3mo) technical trade signals, a DCA backtest simulator (`src/utils/dcaSimulator.js`, capped at 90 days — CoinGecko free tier), watchlist and portfolio tracking, all prices shown in your selected currency. Watchlist tab also runs a 1-day RSI/momentum signal check every 5min (`src/hooks/useWatchlistSignals.js`) and browser-notifies on Buy/Sell flips. Each portfolio row can be partially/fully sold with realized gain tracked (`src/utils/costBasis.js`). Uses CoinGecko free API, no key needed.
