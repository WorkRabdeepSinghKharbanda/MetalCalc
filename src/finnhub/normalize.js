// Finnhub's /stock/metric field names aren't fully stable across their docs versions.
// Every read here falls back through known aliases, then to null — never throws,
// never shows a wrong number. Verify against a real API key and adjust the alias
// lists below if a field comes back null that shouldn't.
function pick(obj, keys) {
  for (const k of keys) {
    if (obj?.[k] != null) return obj[k]
  }
  return null
}

export function normalizeMetrics(raw) {
  const m = raw?.metric ?? {}
  return {
    peTTM: pick(m, ['peBasicExclExtraTTM', 'peExclExtraTTM', 'peNormalizedAnnual', 'peInclExtraTTM']),
    pb: pick(m, ['pbAnnual', 'pbQuarterly']),
    epsTTM: pick(m, ['epsBasicExclExtraItemsTTM', 'epsInclExtraItemsTTM', 'epsNormalizedAnnual']),
    epsGrowthYoy: pick(m, ['epsGrowthTTMYoy', 'epsGrowth5Y']),
    revenueGrowthYoy: pick(m, ['revenueGrowthTTMYoy', 'revenueGrowth5Y', 'revenueGrowthQuarterlyYoy']),
    marketCap: pick(m, ['marketCapitalization']),
    week52High: pick(m, ['52WeekHigh']),
    week52Low: pick(m, ['52WeekLow']),
    dividendYield: pick(m, ['dividendYieldIndicatedAnnual', 'currentDividendYieldTTM']),
    pegTTM: pick(m, ['pegTTM', 'forwardPEG']),
  }
}

// Fallback only — Finnhub does provide pegTTM/forwardPEG directly (used first).
// This derivation only kicks in if both of those are ever missing for a ticker.
export function derivePeg(peTTM, epsGrowthYoy) {
  if (peTTM == null || epsGrowthYoy == null || epsGrowthYoy <= 0) return null
  return peTTM / epsGrowthYoy
}

export function normalizeProfile(raw) {
  return {
    name: raw?.name ?? null,
    exchange: raw?.exchange ?? null,
    industry: raw?.finnhubIndustry ?? null,
    logo: raw?.logo ?? null,
    currency: raw?.currency ?? 'USD',
  }
}

// Free tier has no formal "guidance" field. Analyst recommendation trend + price
// target are the closest forward-looking proxies Finnhub's free tier exposes.
export function normalizeForwardView(recommendationTrends, priceTarget) {
  const latest = recommendationTrends?.[0] ?? null
  return {
    recommendation: latest
      ? { buy: latest.buy, hold: latest.hold, sell: latest.sell, strongBuy: latest.strongBuy, strongSell: latest.strongSell, period: latest.period }
      : null,
    priceTargetMean: priceTarget?.targetMean ?? null,
    priceTargetHigh: priceTarget?.targetHigh ?? null,
    priceTargetLow: priceTarget?.targetLow ?? null,
  }
}

export function normalizeEarningsCalendar(raw) {
  return (raw?.earningsCalendar ?? []).map((e) => ({
    date: e.date,
    epsEstimate: e.epsEstimate ?? null,
    epsActual: e.epsActual ?? null,
    revenueEstimate: e.revenueEstimate ?? null,
    revenueActual: e.revenueActual ?? null,
    quarter: e.quarter,
    year: e.year,
  }))
}
