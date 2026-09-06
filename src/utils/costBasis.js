// Each portfolio row is already a distinct buy lot (a fresh "+ Add to portfolio"
// click never merges into an existing row). Selling part or all of a lot here
// computes a realized gain against that lot's own avgBuy — no cross-lot FIFO
// engine needed since lots are never merged in the first place.
export function sellLot(lot, sellQty, sellPrice) {
  const qty = Math.min(Number(sellQty) || 0, lot.qty)
  const price = Number(sellPrice) || 0
  if (qty <= 0 || price <= 0) return null

  const proceeds = qty * price
  const costBasis = qty * lot.avgBuy
  const gain = proceeds - costBasis
  const remainingQty = lot.qty - qty

  return {
    remainingLot: remainingQty > 0 ? { ...lot, qty: remainingQty } : null,
    gainEntry: {
      id: crypto.randomUUID(),
      qty,
      sellPrice: price,
      avgBuy: lot.avgBuy,
      proceeds,
      costBasis,
      gain,
      soldAt: Date.now(),
    },
  }
}
