// One representative image per content category, reused across all posts/pages
// in that category — not a bespoke image per post. Sourced from Wikimedia
// Commons (verified license via the Commons API before downloading), saved
// locally to public/images/blog/ and resized/compressed, rather than
// hotlinked, so the site never depends on an external host staying up.
export const CATEGORY_IMAGES = {
  Metals: {
    src: '/images/blog/metals-gold-ingots.jpg',
    alt: 'Stack of gold ingots',
    credit: null, // public domain (Szaaman, Wikimedia Commons) — no attribution required
  },
  Markets: {
    src: '/images/blog/markets-stock-chart.jpg',
    alt: 'Stock market chart illustration',
    credit: null, // CC0 (Wikimedia Commons) — no attribution required
  },
  Tools: {
    src: '/images/blog/tools-calculator.jpg',
    alt: 'Calculator on a desk',
    credit: 'Photo: Mister rf, CC BY-SA 4.0, via Wikimedia Commons',
  },
}
