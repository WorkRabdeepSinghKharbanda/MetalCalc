import { Link } from 'react-router-dom'
import { useLanguage } from '../context/LanguageContext.jsx'
import { useToast } from '../context/ToastContext.jsx'

const EMBED_CODE = '<iframe src="https://metal-calc-two.vercel.app/widget" width="320" height="140" frameborder="0"></iframe>'

export default function Footer() {
  const { t } = useLanguage()
  const showToast = useToast()

  function copyEmbedCode() {
    navigator.clipboard?.writeText(EMBED_CODE)
    showToast('Embed code copied')
  }

  return (
    <footer className="site-footer">
      <div className="container footer-inner">
        <span>© {new Date().getFullYear()} MetalCalc</span>
        <span className="muted">
          Prices via gold-api.com &amp; frankfurter.dev · {t('footerTagline')} · <Link to="/faq">FAQ</Link> ·{' '}
          <button className="link-btn" onClick={copyEmbedCode}>📋 Embed widget</button>
        </span>
      </div>
    </footer>
  )
}
