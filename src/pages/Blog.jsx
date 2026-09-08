import { Link } from 'react-router-dom'
import { POSTS } from '../blog/posts.js'
import Seo from '../components/Seo.jsx'
import AdSlot from '../components/AdSlot.jsx'

export default function Blog() {
  return (
    <section className="faq-page">
      <Seo
        title="Blog — MetalCalc"
        description="Guides on precious metals, stocks and crypto — the gold-silver ratio, zakat calculations, gold loans, DCA, PEG ratio and more."
      />
      <div className="container">
        <p className="eyebrow">Blog</p>
        <h1>Guides &amp; explainers</h1>
        <p className="hero-sub" style={{ marginBottom: '2rem' }}>
          Longer reads on how the numbers behind MetalCalc's calculators actually work.
        </p>

        <AdSlot slot="blog-index-top" />

        <div className="batch-list">
          {POSTS.slice().reverse().map((post) => (
            <Link key={post.slug} to={`/blog/${post.slug}`} className="card" style={{ display: 'block', marginBottom: '1rem', padding: '1.25rem' }}>
              <h2 style={{ margin: '0 0 0.4rem', fontSize: '1.25rem' }}>{post.title}</h2>
              <p className="muted small-note" style={{ margin: '0 0 0.5rem' }}>
                {new Date(post.date).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })} · {post.readTime}
              </p>
              <p style={{ margin: 0 }}>{post.description}</p>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
