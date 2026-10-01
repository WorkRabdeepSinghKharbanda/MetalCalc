import { Link, useParams } from 'react-router-dom'
import { getLandingPageBySlug } from '../content/landingPages.js'
import NotFound from './NotFound.jsx'
import Seo from '../components/Seo.jsx'
import AdSlot from '../components/AdSlot.jsx'
import RelatedPosts from '../components/RelatedPosts.jsx'
import { buildFaqJsonLd } from '../utils/faqJsonLd.js'
import { CATEGORY_IMAGES } from '../content/categoryImages.js'

const SITE_URL = 'https://metal-calc-two.vercel.app'

export default function LandingPage() {
  const { landingSlug } = useParams()
  const page = getLandingPageBySlug(landingSlug)

  if (!page) return <NotFound />

  const image = CATEGORY_IMAGES[page.category]

  const articleJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: page.title,
    description: page.description,
    image: `${SITE_URL}/og-image.png`,
    dateModified: page.updated,
    author: { '@type': 'Organization', name: 'MetalCalc' },
    publisher: { '@type': 'Organization', name: 'MetalCalc' },
    mainEntityOfPage: `${SITE_URL}/${page.slug}`,
  }

  return (
    <section className="zakat-page">
      <Seo
        title={`${page.title} | MetalCalc`}
        description={page.description}
        jsonLd={[articleJsonLd, buildFaqJsonLd(page.faqs)]}
      />
      <div className="container">
        <p className="eyebrow">Guide</p>
        <h1>{page.h1}</h1>
        <p className="hero-sub" style={{ marginBottom: '2rem' }}>{page.intro}</p>

        {image && (
          <figure style={{ margin: '0 0 1.5rem' }}>
            <img src={image.src} alt={image.alt} style={{ width: '100%', borderRadius: '12px', display: 'block' }} />
            {image.credit && <figcaption className="muted small-note" style={{ marginTop: '0.4rem' }}>{image.credit}</figcaption>}
          </figure>
        )}

        <div className="blog-content">
          {page.sections.map((s, i) =>
            s.h2 ? <h2 key={i}>{s.h2}</h2> : <p key={i}>{s.p}</p>
          )}
        </div>

        {page.faqs?.length > 0 && (
          <>
            <h2>Frequently asked questions</h2>
            <div className="faq-list">
              {page.faqs.map((item) => (
                <details key={item.q} className="faq-item">
                  <summary>{item.q}</summary>
                  <p>{item.a}</p>
                </details>
              ))}
            </div>
          </>
        )}

        {page.relatedLinks?.length > 0 && (
          <div className="card" style={{ marginTop: '2rem', padding: '1.25rem' }}>
            <h3 style={{ marginTop: 0 }}>Related tools</h3>
            <ul style={{ margin: 0, paddingLeft: '1.25rem' }}>
              {page.relatedLinks.map((l) => (
                <li key={l.path}><Link to={l.path}>{l.label}</Link></li>
              ))}
            </ul>
          </div>
        )}

        <RelatedPosts currentPath={`/${page.slug}`} />

        <AdSlot slot="3418754801" />
      </div>
    </section>
  )
}
