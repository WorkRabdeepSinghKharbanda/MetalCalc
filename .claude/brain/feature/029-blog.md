---
route: /blog
entry_point: src/pages/Blog.jsx
category: Other
---

Blog index — lists posts from `src/blog/posts.js` (static, no CMS), grouped by `category`
(Metals/Markets/Tools) with an `ItemList` JSON-LD. Individual posts live at `/blog/:slug`
(`src/pages/BlogPost.jsx` — `BlogPosting` + `FAQPage` JSON-LD per post, via `buildFaqJsonLd`
in `src/utils/faqJsonLd.js`). Each post shows a "Related reading" widget (`RelatedPosts.jsx`,
`src/content/relatedContent.js`) pulling 3 topically-related posts/guides, plus an AdSlot.

Post object shape: `slug, title, description, date, updated, readTime, category, keywords[],
relatedPath, relatedLabel, faqs: [{q,a}], sections: [{h2}|{p}]`. Add a post by appending to
`posts.js` with all these fields; also add a sitemap entry and update `public/llms.txt` and
`.claude/brain/seo/keyword-map.md` — nothing else needs wiring (RelatedPosts/ItemList/category
grouping all pick it up automatically).

**SEO content compounds over months, not days** — this isn't a one-time task. Add posts/guides
periodically, driven by `.claude/brain/seo/keywords.json`/`keyword-map.md` (Google Autocomplete
demand signals — extend with new seeds each round).
