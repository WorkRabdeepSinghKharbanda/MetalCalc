import { Link, NavLink } from 'react-router-dom'
import { useTheme } from '../hooks/useTheme.js'
import { useLanguage } from '../context/LanguageContext.jsx'
import { LANGUAGES } from '../i18n/translations.js'
import DropdownMenu from './DropdownMenu.jsx'

export default function Header() {
  const [theme, toggleTheme] = useTheme()
  const { lang, setLang, t } = useLanguage()

  return (
    <header className="site-header">
      <div className="container header-inner">
        <Link to="/" className="brand">
          <span className="brand-mark">◆</span> MetalCalc
        </Link>
        <nav className="nav">
          <Link to="/#calculator">{t('navCalculator')}</Link>
          <NavLink to="/batch" className={({ isActive }) => (isActive ? 'active' : '')}>{t('navBatch')}</NavLink>
          <NavLink to="/holdings" className={({ isActive }) => (isActive ? 'active' : '')}>{t('navHoldings')}</NavLink>
          <NavLink to="/alerts" className={({ isActive }) => (isActive ? 'active' : '')}>{t('navAlerts')}</NavLink>
          <NavLink to="/stocks" className={({ isActive }) => (isActive ? 'active' : '')}>Stocks</NavLink>
          <DropdownMenu
            label="Tools ▾"
            items={[
              { label: '⇄ Purity converter', to: '/convert' },
              { label: '⚖ Weight converter', to: '/weight-converter' },
              { label: '☾ Zakat calculator', to: '/zakat' },
              { label: '🏦 Loan against gold', to: '/loan-against-gold' },
              { label: '🎯 Savings goal', to: '/savings-goal' },
              { label: '🏷 Melt vs retail', to: '/melt-check' },
              { label: '💱 Rate margin check', to: '/rate-check' },
              { label: '🗄 Storage cost', to: '/storage-cost' },
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
        </nav>
      </div>
    </header>
  )
}
