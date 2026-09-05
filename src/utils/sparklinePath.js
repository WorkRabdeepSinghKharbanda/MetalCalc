// Shared by Sparkline.jsx, StockPriceChart.jsx and TimeframeSignals.jsx —
// builds an SVG path `d` attribute tracing `values` across a width×height viewBox.
export function sparklinePath(values, width, height) {
  if (values.length < 2) return ''
  const min = Math.min(...values)
  const max = Math.max(...values)
  const span = max - min || 1
  return values
    .map((v, i) => {
      const x = (i / (values.length - 1)) * width
      const y = height - ((v - min) / span) * height
      return `${i === 0 ? 'M' : 'L'}${x.toFixed(1)},${y.toFixed(1)}`
    })
    .join(' ')
}
