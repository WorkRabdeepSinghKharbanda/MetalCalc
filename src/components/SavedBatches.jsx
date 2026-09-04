export default function SavedBatches({ batches, onLoad, onDelete }) {
  if (batches.length === 0) return null

  return (
    <div className="saved-batches no-print">
      <span className="result-label">Saved batches</span>
      <div className="saved-batches-list">
        {batches.map((b) => (
          <span key={b.id} className="saved-batch-chip">
            <button className="link-btn" onClick={() => onLoad(b)}>{b.name}</button>
            <span className="muted"> ({b.items.length})</span>
            <button className="icon-btn" onClick={() => onDelete(b.id)} aria-label={`Delete ${b.name}`}>✕</button>
          </span>
        ))}
      </div>
    </div>
  )
}
