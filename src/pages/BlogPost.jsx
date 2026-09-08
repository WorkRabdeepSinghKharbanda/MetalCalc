import { Link, useParams } from 'react-router-dom'
import { getPostBySlug } from '../blog/posts.js'
import NotFound from './NotFound.jsx'
import Seo from '../components/Seo.jsx'
import AdSlot from '../components/AdSlot.jsx'

const SITE_URL = 'https://metal-calc-two.vercel.app'

export default function BlogPost() {
  const { slug } = useParams()
  const post = getPostBySlug(slug)

  if (!post) return <NotFound />

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.title,
    description: post.description,
    datePublished: post.date,
    dateModified: post.date,
    author: { '@type': 'Organization', name: 'MetalCalc' },
    publisher: { '@type': 'Organization', name: 'MetalCalc' },
    mainEntityOfPage: `${SITE_URL}/blog/${post.slug}`,
  }

  return (
    <section className="faq-page">
      <Seo title={`${post.title} — MetalCalc Blog`} description={post.description} jsonLd={jsonLd} />
      <div className="container" style={{ maxWidth: '48rem' }}>
        <p className="eyebrow"><Link to="/blog">Blog</Link></p>
        <h1>{post.title}</h1>
        <p className="muted small-note" style={{ marginBottom: '2rem' }}>
          {new Date(post.date).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })} · {post.readTime}
        </p>

        <div className="blog-content">
          {post.sections.map((s, i) =>
            s.h2 ? <h2 key={i}>{s.h2}</h2> : <p key={i}>{s.p}</p>
          )}
        </div>

        <AdSlot slot="blog-post-bottom" />

        {post.relatedPath && (
          <p className="card" style={{ marginTop: '2rem', padding: '1.25rem' }}>
            <Link to={post.relatedPath}>→ {post.relatedLabel}</Link>
          </p>
        )}

        <p className="muted small-note" style={{ marginTop: '2rem' }}>
          <Link to="/blog">← Back to all posts</Link>
        </p>
      </div>
    </section>
  )
}
