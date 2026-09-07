---
route: /blog
entry_point: src/pages/Blog.jsx
category: Other
---

Blog index — lists posts from `src/blog/posts.js` (static, no CMS). Individual posts live at `/blog/:slug`
(`src/pages/BlogPost.jsx`, BlogPosting JSON-LD per post). Add a post by appending to `posts.js`; also add a
sitemap entry and update `public/llms.txt` — nothing else needs wiring.
