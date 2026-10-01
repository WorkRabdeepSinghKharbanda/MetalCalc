# Keyword map — round 1

Source: `keywords.json` (Google Autocomplete, demand signals not volume). Maps each content page
to its primary keyword, 5-10 long-tails pulled from the raw data, and search intent. Used to
write H2s and FAQ questions during the content-depth pass. Extend this file (new seeds +
new rows) whenever new content is added — see `.claude/rules/brain-sync.md`-style discipline.

| Page (slug) | Primary keyword | Long-tails to target | Intent |
|---|---|---|---|
| `/gold-rate-today` | gold rate today | per gram, 22k/24k carat, live/today | Commercial — daily price lookup |
| `/gold-price-per-gram` | gold price per gram | today, in india, graph, 22k | Commercial — unit conversion lookup |
| `/24k-vs-22k-gold-difference` | 22k vs 24k gold | price difference, which is best, resale value, vs 18k | Informational — comparison |
| `/blog/zakat-on-gold-with-examples` + `/zakat` | zakat calculator | on gold, in rupees, for gold in indian rupees, on silver | Transactional — calculator intent |
| `/blog/gold-loan-vs-personal-loan` + `/loan-against-gold` | gold loan interest rate | by bank (sbi/hdfc/canara/muthoot), calculator | Commercial — rate comparison |
| `/blog/peg-ratio-explained` | peg ratio | meaning, formula, negative means, less than 1, full form | Informational — definition/formula |
| `/blog/rsi-explained-overbought-oversold` | rsi indicator | buy and sell signals, strategy, settings, formula, meaning | Informational — trading education |
| `/blog/dollar-cost-averaging-crypto-does-it-work` | dollar cost averaging | calculator, vs lump sum, vs sip, strategy, crypto | Informational + transactional (calculator intent) |
| `/blog/what-diversification-score-measures` + `/blog/correlation-vs-diversification` | portfolio diversification | meaning, calculator, strategies, formula, with commodities | Informational — definition + tool intent |
| `/blog/position-sizing-101` + `/position-size` | position sizing calculator | formula, meaning, for stocks, for crypto, and risk management | Transactional — calculator intent |
| `/blog/52-week-range-demand-supply-proxy` | 52 week high low | stocks, indicator, nse | Informational — trading education |
| `/net-worth-tracking-guide` + `/net-worth` | net worth tracker | app, excel, google sheets, spreadsheet, template | Transactional — tool/template intent (strong "app/spreadsheet" signal — lead with "free, no spreadsheet needed" framing) |
| `/jewelry-making-charges-explained` + `/bill-breakdown` | jewelry making charges | per gram, gst rate, in india, hsn code | Informational — cost breakdown |
| `/blog/melt-value-vs-retail-price` + `/melt-check` | melt value calculator | gold, silver, coins, app | Transactional — calculator intent |
| `/tax-reverse` | gst reverse calculator | formula, online, india | Transactional — calculator intent |
| `/crude-oil` | crude oil price today | live, per barrel, brent, in usd, mcx | Commercial — daily price lookup |
| `/savings-goal` + `/savings-goal-vs-lump-sum-gold` | savings goal calculator | monthly, with interest, no interest | Transactional — calculator intent |
| `/gold-vs-silver-investment` + `/blog/gold-silver-ratio-explained` | gold silver ratio | today, live, chart, calculator, meaning | Informational + commercial (live ratio lookup) |
| `/storage-cost` | gold storage insurance | costs, companies | Informational — cost awareness |
| `/alloy-mix` | alloy mixing calculator gold | what alloys are mixed with gold, ratio calculator | Transactional — calculator intent |
| `/crypto` + `/crypto-portfolio-diversification-guide` | crypto portfolio tracker | app, free, google sheets, excel, template | Transactional — strong "free tool, no spreadsheet" signal to lead with |
| `/stocks` + `/understanding-stock-trade-signals` | (reuse: portfolio diversification, peg ratio, 52 week high low seeds above — no dedicated "stock portfolio tracker" seed queried yet; queue for round 2) | — | — |
| `/gold-investment-for-beginners`, `/silver-investment-guide` | (no dedicated seed yet — broad informational intent, queue "gold investment for beginners" / "how to invest in silver" for round 2) | — | — |
| `/best-time-to-buy-gold` | (no dedicated seed yet — queue "when to buy gold" / "best time to buy gold" for round 2) | — | — |

## Gaps to seed in round 2
"stock portfolio tracker app", "gold investment for beginners", "how to invest in silver",
"best time to buy gold", "weight converter troy ounce", "currency exchange margin calculator",
"rate margin checker", "crude oil news today".
