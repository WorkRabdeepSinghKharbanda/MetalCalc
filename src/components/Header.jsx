import { useEffect, useState } from 'react'
import { Link, NavLink, useLocation } from 'react-router-dom'
import { useTheme } from '../hooks/useTheme.js'
import { useLanguage } from '../context/LanguageContext.jsx'
import { LANGUAGES } from '../i18n/translations.js'
import DropdownMenu from './DropdownMenu.jsx'

export default function Header() {
  const [theme, toggleTheme] = useTheme()
  const { lang, setLang, t } = useLanguage()
  const [navOpen, setNavOpen] = useState(false)
  const location = useLocation()

  useEffect(() => {
    setNavOpen(false)
  }, [location.pathname])

  return (
    <header className="site-header">
      <div className="container header-inner">
        <Link to="/" className="brand">
          <span className="brand-mark">◆</span> MetalCalc
        </Link>
        <button
          className="nav-toggle"
          onClick={() => setNavOpen((o) => !o)}
          aria-expanded={navOpen}
          aria-label="Toggle navigation menu"
        >
          {navOpen ? '✕' : '☰'}
        </button>
        <nav className={`nav ${navOpen ? 'nav-open' : ''}`}>
          <Link to="/#calculator">{t('navCalculator')}</Link>
          <NavLink to="/batch" className={({ isActive }) => (isActive ? 'active' : '')}>{t('navBatch')}</NavLink>
          <NavLink to="/holdings" className={({ isActive }) => (isActive ? 'active' : '')}>{t('navHoldings')}</NavLink>
          <NavLink to="/alerts" className={({ isActive }) => (isActive ? 'active' : '')}>{t('navAlerts')}</NavLink>
          <NavLink to="/stocks" className={({ isActive }) => (isActive ? 'active' : '')}>Stocks</NavLink>
          <NavLink to="/crypto" className={({ isActive }) => (isActive ? 'active' : '')}>Crypto</NavLink>
          <DropdownMenu
            label="Tools ▾"
            items={[
              { heading: 'Convert' },
              { label: '⇄ Purity converter', to: '/convert' },
              { label: '⚖ Weight converter', to: '/weight-converter' },
              { label: '🧪 Alloy mixing', to: '/alloy-mix' },
              { heading: 'Plan' },
              { label: '💰 Net worth', to: '/net-worth' },
              { label: '🎯 Position sizing', to: '/position-size' },
              { label: '☾ Zakat calculator', to: '/zakat' },
              { label: '🏦 Loan against gold', to: '/loan-against-gold' },
              { label: '🎯 Savings goal', to: '/savings-goal' },
              { label: '🗄 Storage cost', to: '/storage-cost' },
              { heading: 'Check a deal' },
              { label: '🏷 Melt vs retail', to: '/melt-check' },
              { label: '🧾 Bill breakdown', to: '/bill-breakdown' },
              { label: '💱 Rate margin check', to: '/rate-check' },
              { label: '➗ Tax reverse calc', to: '/tax-reverse' },
              { heading: 'Data' },
              { label: '💾 Backup & restore', to: '/backup' },
            ]}
          />
          <NavLink to="/faq" className={({ isActive }) => (isActive ? 'active' : '')}>{t('navFaq')}</NavLink>
          <select
            className="lang-select"
            value={lang}
            onChange={(e) => setLang(e.target.value)}
            aria-label="Language"
          >
            {LANGUAGES.map((l) => (
              <option key={l} value={l}>{l.toUpperCase()}</option>
            ))}
          </select>
          <button className="theme-toggle" onClick={toggleTheme} aria-label="Toggle dark mode">
            {theme === 'light' ? '🌙' : '☀️'}
          </button>
          <button
            className="btn btn-ghost command-palette-trigger"
            onClick={() => window.dispatchEvent(new Event('open-command-palette'))}
            title="Jump to any page (⌘K / Ctrl+K)"
          >
            🔍 <kbd>⌘K</kbd>
          </button>
        </nav>
      </div>
    </header>
  )
}
