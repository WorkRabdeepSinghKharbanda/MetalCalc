// Ascending by % below all-time-high (most negative = biggest discount from ATH,
// the crypto analog of "lower PEG = more growth per dollar" for stocks). Rows with
// no ATH data sort last rather than being dropped.
export function rankByAthDiscount(rows) {
  return [...rows].sort((a, b) => {
    if (a.athChangePct == null) return 1
    if (b.athChangePct == null) return -1
    return a.athChangePct - b.athChangePct
  })
}
