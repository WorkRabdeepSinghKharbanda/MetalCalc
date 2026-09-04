export default function PrintHeader({ title }) {
  return (
    <div className="print-header">
      <div className="print-brand">
        <span className="print-brand-mark">◆</span> MetalCalc
      </div>
      <div className="print-meta">
        <span className="print-title">{title}</span>
        <span className="print-date">{new Date().toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}</span>
      </div>
    </div>
  )
}
