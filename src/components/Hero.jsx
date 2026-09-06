import { useState } from 'react'
import { GRAMS_PER_TROY_OZ, METAL_ICONS } from '../calc.js'
import Skeleton from './Skeleton.jsx'
import { useLanguage } from '../context/LanguageContext.jsx'
import { CURRENCIES, CURRENCY_SYMBOLS } from '../utils/currency.js'
import { useToast } from '../context/ToastContext.jsx'
import LastUpdated from './LastUpdated.jsx'

function changeArrow(current, prev) {
  if (prev == null || current === prev) return null
  return current > prev ? <span className="arrow up">▲</span> : <span className="arrow down">▼</span>
}

export default function Hero({
  prices,
  prevPrices,
  rates,
  currency,
  onCurrencyChange,
  autoRefresh,
  onAutoRefreshChange,
  history,
  updatedAt,
}) {
  const { t } = useLanguage()
  const showToast = useToast()
  const [tickerUnit, setTickerUnit] = useState('oz')
  const symbol = CURRENCY_SYMBOLS[currency] ?? ''
  const rate = rates[currency] ?? 1

  function displayPrice(pricePerOzUsd) {
    const perOz = pricePerOzUsd * rate
    const value = tickerUnit === 'oz' ? perOz : perOz / GRAMS_PER_TROY_OZ
    return value.toFixed(2)
  }

  function copyPrice(metal, formatted) {
    navigator.clipboard?.writeText(`${metal}: ${symbol}${formatted} per ${tickerUnit}`)
    showToast(`Copied ${metal} price`)
  }

  return (
    <section className="hero">
      <div className="container hero-inner">
        <p className="eyebrow">{t('heroEyebrow')}</p>
        <h1>
          {t('heroTitlePrefix')} <span className="accent">{t('heroTitleAccent')}</span> {t('heroTitleSuffix')}
        </h1>
        <p className="hero-sub">{t('heroSub')}</p>
        <a className="btn btn-primary" href="#calculator">{t('heroCta')}</a>

        {!prices && (
          <div className="ticker-skeleton">
            <Skeleton width="120px" height="2.5rem" />
            <Skeleton width="120px" height="2.5rem" />
            <Skeleton width="120px" height="2.5rem" />
          </div>
        )}

        {prices && (
          <>
            <div className="ticker-controls">
              <div className="segmented">
                {CURRENCIES.map((c) => (
                  <button
                    key={c}
                    className={c === currency ? 'active' : ''}
                    onClick={() => onCurrencyChange(c)}
                  >
                    {c}
                  </button>
                ))}
              </div>
              <div className="segmented">
                {['oz', 'gram'].map((u) => (
                  <button
                    key={u}
                    className={u === tickerUnit ? 'active' : ''}
                    onClick={() => setTickerUnit(u)}
                  >
                    per {u}
                  </button>
                ))}
              </div>
              <button
                className={`btn btn-ghost auto-refresh-toggle ${autoRefresh ? 'active' : ''}`}
                onClick={() => onAutoRefreshChange(!autoRefresh)}
              >
                {autoRefresh ? '● Auto-refresh on (30s)' : '○ Auto-refresh off'}
              </button>
            </div>

            <LastUpdated timestamp={updatedAt} />

            <div className="ticker">
              {Object.entries(prices).map(([m, p]) => {
                const formatted = displayPrice(p)
                return (
                  <button
                    key={m}
                    className="ticker-item"
                    onClick={() => copyPrice(m, formatted)}
                    title="Click to copy"
                    aria-label={`Copy ${m} price`}
                  >
                    <span className="ticker-metal">{METAL_ICONS[m]} {m}</span>
                    <span className="ticker-price">
                      {symbol}{formatted} {changeArrow(p, prevPrices?.[m])}
                    </span>
                  </button>
                )
              })}
            </div>

            {prices.Gold && prices.Silver && (
              <p className="gold-silver-ratio">
                Gold/Silver ratio: <strong>{(prices.Gold / prices.Silver).toFixed(1)}</strong>
                <span className="muted"> (historically ~40–80; higher favors silver)</span>
              </p>
            )}

            {history.length >= 2 && (
              <p className="digest-line muted">
                Since you started tracking:{' '}
                {Object.keys(prices)
                  .filter((m) => history[0][m] != null)
                  .map((m, i) => {
                    const change = ((prices[m] - history[0][m]) / history[0][m]) * 100
                    return (
                      <span key={m}>
                        {i > 0 && ', '}
                        {m} <span className={change >= 0 ? 'arrow up' : 'arrow down'}>
                          {change >= 0 ? '▲' : '▼'}{Math.abs(change).toFixed(1)}%
                        </span>
                      </span>
                    )
                  })}
              </p>
            )}
          </>
        )}
      </div>
    </section>
  )
}
