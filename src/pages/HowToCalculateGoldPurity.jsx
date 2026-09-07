import { Link } from 'react-router-dom'
import Seo from '../components/Seo.jsx'

const STEPS = [
  {
    name: 'Find the karat or hallmark stamp',
    text: 'Look for a stamp on the piece — "24K", "22K", "18K", or a 3-digit fineness number like 916 (=22k), 750 (=18k), or 999 (=24k fine).',
  },
  {
    name: 'Convert karat to a purity fraction',
    text: 'Karat purity = karat ÷ 24. So 22k = 22/24 = 0.9167 (91.67% pure gold), 18k = 18/24 = 0.75 (75% pure), 24k = 0.999 (fine gold, never truly 100%).',
  },
  {
    name: 'Multiply by the current gold rate',
    text: 'Pure gold value = weight × spot price per gram (or oz) × purity fraction. This gives the raw metal value, before any making charges or taxes a jeweler adds.',
  },
  {
    name: 'Use a calculator to skip the manual math',
    text: 'Enter the weight, unit and karat into a purity calculator and it applies live spot prices automatically.',
  },
]

const HOWTO_JSON_LD = {
  '@context': 'https://schema.org',
  '@type': 'HowTo',
  name: 'How to Calculate Gold Purity',
  description: 'Step-by-step guide to converting karat or hallmark stamps into a purity fraction and metal value.',
  step: STEPS.map((s, i) => ({
    '@type': 'HowToStep',
    position: i + 1,
    name: s.name,
    text: s.text,
  })),
}

const KARAT_TABLE = [
  { karat: '24k', fineness: '.999', pct: '99.9%' },
  { karat: '22k', fineness: '.916', pct: '91.7%' },
  { karat: '18k', fineness: '.750', pct: '75.0%' },
  { karat: '14k', fineness: '.583', pct: '58.3%' },
  { karat: '10k', fineness: '.417', pct: '41.7%' },
]

export default function HowToCalculateGoldPurity() {
  return (
    <section className="zakat-page">
      <Seo
        title="How to Calculate Gold Purity (Karat, Fineness & Value) | MetalCalc"
        description="Step-by-step guide to converting gold karat or hallmark stamps into a purity fraction and calculating its actual metal value."
        jsonLd={HOWTO_JSON_LD}
      />
      <div className="container">
        <p className="eyebrow">Guide</p>
        <h1>How to calculate gold purity</h1>
        <p className="hero-sub" style={{ marginBottom: '2rem' }}>
          Karat and hallmark stamps tell you how pure a gold piece is — here's how to read them and turn that into
          an actual value.
        </p>

        <ol className="faq-list" style={{ listStyle: 'none', padding: 0 }}>
          {STEPS.map((s, i) => (
            <li key={s.name} className="card" style={{ marginBottom: '1rem', padding: '1.25rem' }}>
              <h3 style={{ margin: '0 0 0.5rem' }}>{i + 1}. {s.name}</h3>
              <p style={{ margin: 0 }}>{s.text}</p>
            </li>
          ))}
        </ol>

        <h2 className="section-title" style={{ marginTop: '2rem' }}>Karat-to-purity reference table</h2>
        <div className="table-scroll">
          <table className="stock-table">
            <thead>
              <tr>
                <th>Karat</th>
                <th>Fineness</th>
                <th>Purity %</th>
              </tr>
            </thead>
            <tbody>
              {KARAT_TABLE.map((row) => (
                <tr key={row.karat}>
                  <td><strong>{row.karat}</strong></td>
                  <td>{row.fineness}</td>
                  <td>{row.pct}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <p className="muted small-note" style={{ marginTop: '1.5rem' }}>
          Ready to calculate an actual value? Use the <Link to="/convert">Purity Converter</Link> for a quick
          karat/fineness/percent conversion, or the <Link to="/batch">Batch Calculator</Link> to value a full
          weight of jewelry at live gold rates. See <Link to="/gold-rate-today">today's gold rate</Link> first.
        </p>
      </div>
    </section>
  )
}
