---
route: /:landingSlug
entry_point: src/pages/LandingPage.jsx
category: Other
---

Generic static SEO/guide landing page — single dynamic route matched against `src/content/landingPages.js`
(unknown slug renders NotFound). Add a page by appending to `landingPages.js`; also add a sitemap entry and
update `public/llms.txt`. React Router ranks static routes above this dynamic one automatically, so it never
shadows any other page. Live-price guide pages (e.g. Gold Rate Today) are separate dedicated components instead,
since they need `useMarket()` — this mechanism is for static content only.

Each page shows a "Related reading" widget (`RelatedPosts.jsx`, `src/content/relatedContent.js`) pulling 3
topically-related posts/guides, plus an AdSlot. New pages get picked up by RelatedPosts automatically.

**SEO content compounds over months, not days** — add pages periodically, same as blog posts.

Current slugs: `gold-price-per-gram`, `24k-vs-22k-gold-difference`, `best-time-to-buy-gold`,
`gold-investment-for-beginners`, `silver-investment-guide`, `crypto-portfolio-diversification-guide`,
`understanding-stock-trade-signals`, `savings-goal-vs-lump-sum-gold`, `jewelry-making-charges-explained`,
`net-worth-tracking-guide`.
