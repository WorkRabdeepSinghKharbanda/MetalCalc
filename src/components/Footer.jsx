import { Link } from 'react-router-dom'
import { useLanguage } from '../context/LanguageContext.jsx'

export default function Footer() {
  const { t } = useLanguage()
  return (
    <footer className="site-footer">
      <div className="container footer-inner">
        <span>© {new Date().getFullYear()} MetalCalc</span>
        <span className="muted">
          Prices via gold-api.com &amp; frankfurter.dev · {t('footerTagline')} · <Link to="/faq">FAQ</Link>
        </span>
      </div>
    </footer>
  )
}
