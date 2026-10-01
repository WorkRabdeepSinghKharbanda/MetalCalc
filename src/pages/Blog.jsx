import { Link } from 'react-router-dom'
import { POSTS } from '../blog/posts.js'
import Seo from '../components/Seo.jsx'
import AdSlot from '../components/AdSlot.jsx'

const SITE_URL = 'https://metal-calc-two.vercel.app'
const CATEGORY_ORDER = ['Metals', 'Markets', 'Tools']

const ITEM_LIST_JSON_LD = {
  '@context': 'https://schema.org',
  '@type': 'ItemList',
  itemListElement: POSTS.map((post, i) => ({
    '@type': 'ListItem',
    position: i + 1,
    url: `${SITE_URL}/blog/${post.slug}`,
    name: post.title,
  })),
}

function PostCard({ post }) {
  return (
    <Link to={`/blog/${post.slug}`} className="card" style={{ display: 'block', marginBottom: '1rem', padding: '1.25rem' }}>
      <h2 style={{ margin: '0 0 0.4rem', fontSize: '1.25rem' }}>{post.title}</h2>
      <p className="muted small-note" style={{ margin: '0 0 0.5rem' }}>
        {new Date(post.date).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })} · {post.readTime}
      </p>
      <p style={{ margin: 0 }}>{post.description}</p>
    </Link>
  )
}

export default function Blog() {
  const sorted = POSTS.slice().reverse()
  const uncategorized = sorted.filter((p) => !p.category)
  const groups = CATEGORY_ORDER
    .map((cat) => ({ cat, posts: sorted.filter((p) => p.category === cat) }))
    .filter((g) => g.posts.length > 0)

  return (
    <section className="faq-page">
      <Seo
        title="Blog — MetalCalc"
        description="Guides on precious metals, stocks and crypto — the gold-silver ratio, zakat calculations, gold loans, DCA, PEG ratio and more."
        jsonLd={ITEM_LIST_JSON_LD}
      />
      <div className="container">
        <p className="eyebrow">Blog</p>
        <h1>Guides &amp; explainers</h1>
        <p className="hero-sub" style={{ marginBottom: '2rem' }}>
          Longer reads on how the numbers behind MetalCalc's calculators actually work.
        </p>

        <AdSlot slot="3418754801" />

        {groups.map(({ cat, posts }) => (
          <div key={cat} style={{ marginBottom: '2rem' }}>
            <h2 className="section-title">{cat}</h2>
            <div className="batch-list">
              {posts.map((post) => <PostCard key={post.slug} post={post} />)}
            </div>
          </div>
        ))}

        {uncategorized.length > 0 && (
          <div className="batch-list">
            {uncategorized.map((post) => <PostCard key={post.slug} post={post} />)}
          </div>
        )}
      </div>
    </section>
  )
}
