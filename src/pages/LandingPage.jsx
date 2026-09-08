import { Link, useParams } from 'react-router-dom'
import { getLandingPageBySlug } from '../content/landingPages.js'
import NotFound from './NotFound.jsx'
import Seo from '../components/Seo.jsx'
import AdSlot from '../components/AdSlot.jsx'
import RelatedPosts from '../components/RelatedPosts.jsx'

export default function LandingPage() {
  const { landingSlug } = useParams()
  const page = getLandingPageBySlug(landingSlug)

  if (!page) return <NotFound />

  return (
    <section className="zakat-page">
      <Seo title={`${page.title} | MetalCalc`} description={page.description} />
      <div className="container">
        <p className="eyebrow">Guide</p>
        <h1>{page.h1}</h1>
        <p className="hero-sub" style={{ marginBottom: '2rem' }}>{page.intro}</p>

        <div className="blog-content">
          {page.sections.map((s, i) =>
            s.h2 ? <h2 key={i}>{s.h2}</h2> : <p key={i}>{s.p}</p>
          )}
        </div>

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
