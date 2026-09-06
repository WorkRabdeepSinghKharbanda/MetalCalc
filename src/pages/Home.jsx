import Hero from '../components/Hero.jsx'
import Calculator from '../components/Calculator.jsx'
import Features from '../components/Features.jsx'
import PriceHistorySection from '../components/PriceHistorySection.jsx'
import AdSlot from '../components/AdSlot.jsx'
import Seo from '../components/Seo.jsx'
import { useMarket } from '../context/MarketContext.jsx'

export default function Home() {
  const {
    prices,
    prevPrices,
    rates,
    error,
    loading,
    refresh,
    autoRefresh,
    setAutoRefresh,
    currency,
    setCurrency,
    history,
    updatedAt,
  } = useMarket()

  return (
    <>
      <Seo
        title="MetalCalc — Live Precious Metal Prices & Value Calculator"
        description="Live gold, silver, platinum and palladium spot prices with an instant purity calculator."
      />
      <Hero
        prices={prices}
        prevPrices={prevPrices}
        rates={rates}
        currency={currency}
        onCurrencyChange={setCurrency}
        autoRefresh={autoRefresh}
        onAutoRefreshChange={setAutoRefresh}
        history={history}
        updatedAt={updatedAt}
      />
      <Calculator
        prices={prices}
        rates={rates}
        currency={currency}
        loading={loading}
        error={error}
        onRefresh={refresh}
      />
      <Features />
      <AdSlot slot="home-mid" />
      <PriceHistorySection />
    </>
  )
}
