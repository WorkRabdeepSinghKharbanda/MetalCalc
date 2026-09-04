// Ascending by PEG (lower = more growth per dollar of valuation) — rows with no
// PEG data sort last rather than being dropped, so a data gap doesn't hide a stock.
export function rankByPeg(rows) {
  return [...rows].sort((a, b) => {
    if (a.peg == null) return 1
    if (b.peg == null) return -1
    return a.peg - b.peg
  })
}
