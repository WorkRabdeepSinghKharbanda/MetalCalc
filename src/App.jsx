import { Route, Routes, useLocation } from 'react-router-dom'
import Header from './components/Header.jsx'
import Footer from './components/Footer.jsx'
import Home from './pages/Home.jsx'
import Faq from './pages/Faq.jsx'
import Batch from './pages/Batch.jsx'
import Alerts from './pages/Alerts.jsx'
import Holdings from './pages/Holdings.jsx'
import CompareBatches from './pages/CompareBatches.jsx'
import Stocks from './pages/Stocks.jsx'
import Widget from './pages/Widget.jsx'
import NotFound from './pages/NotFound.jsx'
import OfflineBanner from './components/OfflineBanner.jsx'
import { MarketProvider } from './context/MarketContext.jsx'
import { LanguageProvider } from './context/LanguageContext.jsx'
import { ToastProvider } from './context/ToastContext.jsx'
import './App.css'

export default function App() {
  const isWidget = useLocation().pathname === '/widget'

  return (
    <LanguageProvider>
      <MarketProvider>
        <ToastProvider>
          {isWidget ? (
            <Widget />
          ) : (
            <>
              <OfflineBanner />
              <Header />
              <main>
                <Routes>
                  <Route path="/" element={<Home />} />
                  <Route path="/batch" element={<Batch />} />
                  <Route path="/holdings" element={<Holdings />} />
                  <Route path="/compare" element={<CompareBatches />} />
                  <Route path="/stocks" element={<Stocks />} />
                  <Route path="/alerts" element={<Alerts />} />
                  <Route path="/faq" element={<Faq />} />
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </main>
              <Footer />
            </>
          )}
        </ToastProvider>
      </MarketProvider>
    </LanguageProvider>
  )
}
