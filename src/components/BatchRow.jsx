import { PURITIES, SYMBOLS, UNITS } from '../calc.js'

export default function BatchRow({
  item,
  value,
  currencySymbol,
  onChange,
  onRemove,
  onDuplicate,
  onMoveUp,
  onMoveDown,
  removable,
  isLast,
  onAddNext,
}) {
  function handleNameKeyDown(e) {
    if (e.key === 'Enter' && isLast) {
      e.preventDefault()
      onAddNext()
    }
  }

  return (
    <div className="card batch-row">
      <input
        className="no-print batch-name"
        type="text"
        placeholder="Item name (optional)"
        value={item.name ?? ''}
        onChange={(e) => onChange({ name: e.target.value })}
        onKeyDown={handleNameKeyDown}
      />

      <select
        value={item.metal}
        onChange={(e) => {
          const metal = e.target.value
          onChange({ metal, purity: PURITIES[metal][0].value })
        }}
      >
        {Object.keys(SYMBOLS).map((m) => (
          <option key={m} value={m}>{m}</option>
        ))}
      </select>

      <input
        type="number"
        min="0"
        value={item.weight}
        onChange={(e) => onChange({ weight: e.target.value })}
      />

      <select value={item.unit} onChange={(e) => onChange({ unit: e.target.value })}>
        {Object.keys(UNITS).map((u) => (
          <option key={u} value={u}>{u}</option>
        ))}
      </select>

      <select value={item.purity} onChange={(e) => onChange({ purity: Number(e.target.value) })}>
        {PURITIES[item.metal].map((p) => (
          <option key={p.label} value={p.value}>{p.label}</option>
        ))}
      </select>

      <input
        className="no-print"
        type="number"
        step="0.5"
        placeholder="Charge %"
        title="Charge % (+making, −scrap discount)"
        value={item.makingCharge ?? 0}
        onChange={(e) => onChange({ makingCharge: e.target.value })}
      />

      <span className="batch-value">
        {value != null ? `${currencySymbol}${value.toFixed(2)}` : '—'}
      </span>

      <div className="no-print batch-row-actions">
        <button className="btn btn-ghost icon-btn" onClick={onMoveUp} aria-label="Move up">↑</button>
        <button className="btn btn-ghost icon-btn" onClick={onMoveDown} aria-label="Move down">↓</button>
        <button className="btn btn-ghost icon-btn" onClick={onDuplicate} aria-label="Duplicate">⧉</button>
        <button
          className="btn btn-ghost icon-btn"
          onClick={onRemove}
          disabled={!removable}
          aria-label="Remove item"
        >
          ✕
        </button>
      </div>
    </div>
  )
}
