---
route: /blog
entry_point: src/pages/Blog.jsx
category: Other
---

Blog index — lists posts from `src/blog/posts.js` (static, no CMS). Individual posts live at `/blog/:slug`
(`src/pages/BlogPost.jsx`, BlogPosting JSON-LD per post). Each post shows a "Related reading" widget
(`RelatedPosts.jsx`, `src/content/relatedContent.js`) pulling 3 topically-related posts/guides, plus an AdSlot.
Add a post by appending to `posts.js`; also add a sitemap entry and update `public/llms.txt` — nothing else
needs wiring.

**SEO content compounds over months, not days** — this isn't a one-time task. Add posts/guides periodically
(new posts get picked up by RelatedPosts automatically, no extra wiring needed there).
