// Title/description for every statically-routed page (everything except the
// dynamic /blog/:slug and /:landingSlug routes, which pull from posts.js /
// landingPages.js instead). Single source of truth for scripts/prerender.mjs
// — keep this in sync with each page's own <Seo title description> props.
// Why this file exists at all: see scripts/prerender.mjs's header comment.
export const STATIC_PAGE_META = {
  '/': { title: 'MetalCalc — Live Precious Metal Prices & Value Calculator', description: 'Live gold, silver, platinum and palladium spot prices with an instant purity calculator.' },
  '/batch': { title: 'Batch Calculator — MetalCalc', description: 'Value multiple gold, silver and platinum items at once and get a combined total.' },
  '/gold-rate-today': { title: 'Gold Rate Today — Live Price Per Gram & Ounce | MetalCalc', description: "Today's live gold rate per gram, 10 grams and troy ounce in USD, INR, EUR, GBP and JPY — updated in real time from international spot prices." },
  '/how-to-calculate-gold-purity': { title: 'How to Calculate Gold Purity | MetalCalc', description: 'Step-by-step guide to converting gold karat or hallmark stamps into a purity fraction and calculating its actual metal value.' },
  '/gold-vs-silver-investment': { title: 'Gold vs Silver: Which Should You Invest In? | MetalCalc', description: 'A practical comparison of gold vs silver as an investment — volatility, liquidity, the gold-silver ratio, and how to track both.' },
  '/blog': { title: 'Blog — MetalCalc', description: 'Guides on precious metals, stocks and crypto — the gold-silver ratio, zakat calculations, gold loans, DCA, PEG ratio and more.' },
  '/holdings': { title: 'My Holdings — MetalCalc', description: 'Track your gold, silver and platinum holdings with live value and gain/loss.' },
  '/compare': { title: 'Compare Batches — MetalCalc', description: 'Compare two saved metal batches side by side.' },
  '/stocks': { title: 'US Stocks — MetalCalc', description: 'Search US stocks, view fundamentals (PE, PEG, EPS, growth), and track your portfolio.' },
  '/crude-oil': { title: 'Crude Oil — MetalCalc', description: "WTI and Brent crude oil price proxies (via oil ETFs) and recent oil-market news, filtered from general market headlines." },
  '/crypto': { title: 'Crypto — MetalCalc', description: 'Search cryptocurrencies, view live price and 24h range, browse curated rankings, and track your portfolio.' },
  '/net-worth': { title: 'Net Worth Dashboard — MetalCalc', description: 'See your combined net worth across precious metals, stocks and crypto in one place, using your saved Holdings and portfolios.' },
  '/position-size': { title: 'Position Size / Risk Calculator | MetalCalc', description: 'Fixed-fractional position sizing for stocks or crypto — risk a set % of your account per trade and size the position off your stop-loss.' },
  '/convert': { title: 'Gold Purity Converter | MetalCalc', description: 'Convert gold purity between karat (24k, 22k, 18k...), fineness (999, 916...) and percent purity.' },
  '/zakat': { title: 'Zakat Calculator — Gold, Silver & Cash — MetalCalc', description: "Calculate zakat due on gold, silver and cash using today's live metal prices and the standard silver nisab threshold." },
  '/weight-converter': { title: 'Weight Unit Converter — Gram, Oz, Tola, Kg — MetalCalc', description: 'Convert precious metal weight between grams, troy ounces, kilograms, tola and dwt.' },
  '/loan-against-gold': { title: 'Loan Against Gold Calculator — MetalCalc', description: 'Estimate the maximum loan amount a lender might offer against your gold or silver, based on live spot value and loan-to-value ratio.' },
  '/savings-goal': { title: 'Gold Savings Goal Calculator — MetalCalc', description: 'See how long it takes to reach a gold or silver weight goal at a fixed monthly savings amount, using today\'s live price.' },
  '/melt-check': { title: 'Melt vs Retail Markup Checker — MetalCalc', description: "Check how much markup a jewelry or coin asking price has over its pure melt value, using today's live spot price." },
  '/rate-check': { title: 'Exchange Rate Margin Checker — MetalCalc', description: "Compare a dealer's quoted exchange rate against today's live mid-market rate to see the hidden spread on a currency conversion." },
  '/storage-cost': { title: 'Storage & Insurance Cost Calculator — MetalCalc', description: 'Estimate the total storage or insurance cost of holding gold or silver over time, and the price appreciation needed to break even.' },
  '/alloy-mix': { title: 'Alloy Mixing Calculator — Blend Purity — MetalCalc', description: 'Melt two different-purity gold or silver pieces together and calculate the resulting blended purity, karat and fineness.' },
  '/tax-reverse': { title: 'Tax / GST Reverse Calculator — MetalCalc', description: 'Back out the base price and tax amount from a final tax-inclusive price on a gold or silver purchase.' },
  '/bill-breakdown': { title: 'Jewelry Bill Breakdown Calculator — MetalCalc', description: 'Enter your total jewelry bill and item weight/purity to reveal the implied making charges and tax over pure metal value.' },
  '/backup': { title: 'Backup & Restore — MetalCalc', description: "Export everything you've saved on this device — Holdings, Stocks, Crypto, alerts, batches — as one file, and restore it on another device." },
  '/privacy-policy': { title: 'Privacy Policy — MetalCalc', description: 'What MetalCalc stores, how AdSense cookies work, and how to opt out.' },
  '/alerts': { title: 'Price Alerts — MetalCalc', description: 'Get notified in your browser when gold, silver or platinum crosses your target price.' },
  '/faq': { title: 'FAQ — MetalCalc', description: 'Answers about live metal prices, purities, currencies and how MetalCalc works.' },
}

// Rendered bare (no Header/Footer) and intentionally not indexed — skip prerendering these.
export const NOINDEX_PATHS = ['/widget']
