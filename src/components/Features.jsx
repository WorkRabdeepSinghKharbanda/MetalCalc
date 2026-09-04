const FEATURES = [
  {
    icon: '⚡',
    title: 'Live market prices',
    text: 'Spot prices for gold, silver and platinum pulled straight from the market, refreshed on demand.',
  },
  {
    icon: '⚖️',
    title: 'Purity-aware',
    text: 'Karat gold, sterling silver, fine platinum — pick the exact purity and get an accurate value, not an estimate.',
  },
  {
    icon: '🌍',
    title: 'Any unit',
    text: 'Grams, troy ounces or kilograms — enter what you have, we handle the conversion.',
  },
]

export default function Features() {
  return (
    <section id="features" className="features">
      <div className="container">
        <h2 className="section-title">Why MetalCalc</h2>
        <div className="feature-grid">
          {FEATURES.map((f) => (
            <div key={f.title} className="feature-card">
              <div className="feature-icon">{f.icon}</div>
              <h3>{f.title}</h3>
              <p>{f.text}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
