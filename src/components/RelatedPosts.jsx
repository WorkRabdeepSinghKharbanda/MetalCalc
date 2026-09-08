import { Link } from 'react-router-dom'
import { getRelatedContent } from '../content/relatedContent.js'

export default function RelatedPosts({ currentPath }) {
  const related = getRelatedContent(currentPath)
  if (related.length === 0) return null

  return (
    <div className="card" style={{ marginTop: '2rem', padding: '1.25rem' }}>
      <h3 style={{ marginTop: 0 }}>Related reading</h3>
      <ul style={{ margin: 0, paddingLeft: '1.25rem' }}>
        {related.map((r) => (
          <li key={r.path}><Link to={r.path}>{r.title}</Link></li>
        ))}
      </ul>
    </div>
  )
}
