import Seo from '../components/Seo.jsx'

export default function PrivacyPolicy() {
  return (
    <section className="zakat-page">
      <Seo
        title="Privacy Policy — MetalCalc"
        description="What MetalCalc stores, how AdSense cookies work, and how to opt out."
      />
      <div className="container">
        <p className="eyebrow">Privacy</p>
        <h1>Privacy Policy</h1>
        <p className="hero-sub" style={{ marginBottom: '2rem' }}>
          MetalCalc has no user accounts and no backend database. Here's exactly what is stored and where.
        </p>

        <div className="card zakat-form" style={{ flexDirection: 'column', alignItems: 'flex-start', gap: '1.25rem' }}>
          <div>
            <h3 style={{ margin: '0 0 0.4rem' }}>What's stored on your device</h3>
            <p className="muted small-note" style={{ margin: 0 }}>
              Everything you enter — Holdings, saved batches, price alerts, Stock/Crypto portfolios and watchlists,
              your theme and language choice, and your cookie consent choice — lives only in this browser's
              <code> localStorage</code>/<code>sessionStorage</code>. It is never sent to us, because we have no
              server to send it to. Clearing your browser data erases it; the <a href="/backup">Backup &amp; Restore</a>{' '}
              page lets you export it first.
            </p>
          </div>

          <div>
            <h3 style={{ margin: '0 0 0.4rem' }}>Third-party data requests</h3>
            <p className="muted small-note" style={{ margin: 0 }}>
              Live prices are fetched directly from your browser to gold-api.com, frankfurter.dev, Finnhub (US
              stocks) and CoinGecko (crypto) — each request includes only the ticker/symbol/coin you're looking up,
              no personal data. If you use WhatsApp trade alerts, the phone number you enter is sent to our Twilio
              account solely to deliver that alert. If you use Telegram trade alerts, the Chat ID you enter is sent
              to our Telegram bot solely to deliver that alert.
            </p>
          </div>

          <div>
            <h3 style={{ margin: '0 0 0.4rem' }}>Advertising cookies</h3>
            <p className="muted small-note" style={{ margin: 0 }}>
              This site loads Google AdSense, which may set cookies to show ads based on your visits to this and
              other sites. The cookie banner records your preference for this disclosure, but the ad script itself
              loads on every visit regardless of that choice. You can opt out of personalized advertising at any
              time at{' '}
              <a href="https://adssettings.google.com" target="_blank" rel="noopener noreferrer">
                adssettings.google.com
              </a>
              , and see how Google uses data from sites that use its services at{' '}
              <a href="https://policies.google.com/technologies/partner-sites" target="_blank" rel="noopener noreferrer">
                policies.google.com/technologies/partner-sites
              </a>
              .
            </p>
          </div>

          <div>
            <h3 style={{ margin: '0 0 0.4rem' }}>Analytics</h3>
            <p className="muted small-note" style={{ margin: 0 }}>
              This site uses Google Analytics (gtag.js) to see aggregate usage — pages visited, general location,
              device type — via cookies, loaded on every visit. It doesn't identify you personally. Opt out with
              the{' '}
              <a href="https://tools.google.com/dlpage/gaoptout" target="_blank" rel="noopener noreferrer">
                Google Analytics Opt-out Browser Add-on
              </a>
              .
            </p>
          </div>

          <div>
            <h3 style={{ margin: '0 0 0.4rem' }}>Changing your mind</h3>
            <p className="muted small-note" style={{ margin: 0 }}>
              Clear this site's data in your browser settings to reset your cookie consent choice — the banner
              will reappear on your next visit.
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
