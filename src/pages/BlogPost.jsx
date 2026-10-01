import { Link, useParams } from 'react-router-dom'
import { getPostBySlug } from '../blog/posts.js'
import NotFound from './NotFound.jsx'
import Seo from '../components/Seo.jsx'
import AdSlot from '../components/AdSlot.jsx'
import RelatedPosts from '../components/RelatedPosts.jsx'
import { buildFaqJsonLd } from '../utils/faqJsonLd.js'

const SITE_URL = 'https://metal-calc-two.vercel.app'

function wordCount(sections) {
  return sections.filter((s) => s.p).reduce((sum, s) => sum + s.p.split(/\s+/).length, 0)
}

export default function BlogPost() {
  const { slug } = useParams()
  const post = getPostBySlug(slug)

  if (!post) return <NotFound />

  const jsonLd = [
    {
      '@context': 'https://schema.org',
      '@type': 'BlogPosting',
      headline: post.title,
      description: post.description,
      image: `${SITE_URL}/og-image.png`,
      datePublished: post.date,
      dateModified: post.updated ?? post.date,
      keywords: post.keywords?.join(', '),
      wordCount: wordCount(post.sections),
      author: { '@type': 'Organization', name: 'MetalCalc' },
      publisher: { '@type': 'Organization', name: 'MetalCalc' },
      mainEntityOfPage: `${SITE_URL}/blog/${post.slug}`,
    },
    buildFaqJsonLd(post.faqs),
  ]

  return (
    <section className="faq-page">
      <Seo title={`${post.title} — MetalCalc Blog`} description={post.description} jsonLd={jsonLd} />
      <div className="container" style={{ maxWidth: '48rem' }}>
        <p className="eyebrow"><Link to="/blog">Blog</Link></p>
        <h1>{post.title}</h1>
        <p className="muted small-note" style={{ marginBottom: '2rem' }}>
          {new Date(post.date).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })} · {post.readTime}
          {post.updated && post.updated !== post.date && ` · updated ${new Date(post.updated).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}`}
        </p>

        <div className="blog-content">
          {post.sections.map((s, i) =>
            s.h2 ? <h2 key={i}>{s.h2}</h2> : <p key={i}>{s.p}</p>
          )}
        </div>

        {post.faqs?.length > 0 && (
          <>
            <h2 style={{ marginTop: '2rem' }}>Frequently asked questions</h2>
            <div className="faq-list">
              {post.faqs.map((item) => (
                <details key={item.q} className="faq-item">
                  <summary>{item.q}</summary>
                  <p>{item.a}</p>
                </details>
              ))}
            </div>
          </>
        )}

        {post.relatedPath && (
          <p className="card" style={{ marginTop: '2rem', padding: '1.25rem' }}>
            <Link to={post.relatedPath}>→ {post.relatedLabel}</Link>
          </p>
        )}

        <RelatedPosts currentPath={`/blog/${post.slug}`} />

        <AdSlot slot="3418754801" />

        <p className="muted small-note" style={{ marginTop: '2rem' }}>
          <Link to="/blog">← Back to all posts</Link>
        </p>
      </div>
    </section>
  )
}
