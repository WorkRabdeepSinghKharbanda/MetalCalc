import { Link } from 'react-router-dom'
import Seo from '../components/Seo.jsx'

export default function NotFound() {
  return (
    <section className="not-found-page">
      <Seo title="Page not found — MetalCalc" description="This page doesn't exist." noIndex />
      <div className="container">
        <p className="eyebrow">404</p>
        <h1>This page doesn't exist.</h1>
        <p className="hero-sub">Maybe it was melted down.</p>
        <Link className="btn btn-primary" to="/">← Back home</Link>
      </div>
    </section>
  )
}
