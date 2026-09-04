import Seo from '../components/Seo.jsx'

const FAQS = [
  {
    q: 'Where do the prices come from?',
    a: 'Live spot prices for gold, silver and platinum are fetched from gold-api.com when you load the page or hit Refresh. They reflect the international market spot rate, not retail jewelry prices.',
  },
  {
    q: 'Why is my result different from what a jeweler quoted me?',
    a: 'Jewelers add making charges, taxes and a margin on top of the metal value. This calculator gives you the raw metal value only, using the purity you select.',
  },
  {
    q: 'What purities are supported?',
    a: 'Gold: 24k, 22k, 18k, 14k, 10k. Silver: .999 fine, .925 sterling, .900 coin. Platinum: .999 and .950.',
  },
  {
    q: 'Which currencies can I see prices in?',
    a: 'USD, EUR and INR. Currency conversion uses live exchange rates from frankfurter.dev at the time of your last refresh.',
  },
  {
    q: 'How often do prices update?',
    a: 'Prices load once when you open the page. Click "Refresh prices" to update manually, or turn on auto-refresh (30s) in the ticker controls.',
  },
  {
    q: 'Does this work offline?',
    a: 'The app shell loads offline once you’ve visited it, but live prices need an internet connection — you’ll see your last-fetched prices until you’re back online.',
  },
]

export default function Faq() {
  return (
    <section className="faq-page">
      <Seo title="FAQ — MetalCalc" description="Answers about live metal prices, purities, currencies and how MetalCalc works." />
      <div className="container">
        <p className="eyebrow">Support</p>
        <h1>Frequently asked questions</h1>
        <div className="faq-list">
          {FAQS.map((item) => (
            <details key={item.q} className="faq-item">
              <summary>{item.q}</summary>
              <p>{item.a}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  )
}
