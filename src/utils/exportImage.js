// Renders a simple summary card to a PNG using the Canvas API — no image library needed.
export function downloadSummaryImage({ title, subtitle, rows, totalLabel, totalValue, filename }) {
  const width = 640
  const rowHeight = 36
  const headerHeight = 110
  const footerHeight = 70
  const height = headerHeight + rows.length * rowHeight + footerHeight

  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  const ctx = canvas.getContext('2d')

  ctx.fillStyle = '#f7f5f0'
  ctx.fillRect(0, 0, width, height)

  ctx.fillStyle = '#16140f'
  ctx.font = '600 26px Georgia, serif'
  ctx.fillText(title, 32, 48)

  ctx.fillStyle = '#5b5748'
  ctx.font = '14px system-ui, sans-serif'
  ctx.fillText(subtitle, 32, 72)

  ctx.strokeStyle = '#e6e1d4'
  ctx.beginPath()
  ctx.moveTo(32, headerHeight - 20)
  ctx.lineTo(width - 32, headerHeight - 20)
  ctx.stroke()

  ctx.font = '15px system-ui, sans-serif'
  rows.forEach((row, i) => {
    const y = headerHeight + i * rowHeight + 20
    ctx.fillStyle = '#16140f'
    ctx.fillText(row.label, 32, y)
    ctx.textAlign = 'right'
    ctx.fillText(row.value, width - 32, y)
    ctx.textAlign = 'left'
  })

  const totalY = height - footerHeight + 30
  ctx.strokeStyle = '#e6e1d4'
  ctx.beginPath()
  ctx.moveTo(32, totalY - 30)
  ctx.lineTo(width - 32, totalY - 30)
  ctx.stroke()

  ctx.font = '700 20px system-ui, sans-serif'
  ctx.fillStyle = '#b8860b'
  ctx.fillText(totalLabel, 32, totalY)
  ctx.textAlign = 'right'
  ctx.fillText(totalValue, width - 32, totalY)
  ctx.textAlign = 'left'

  ctx.font = '12px system-ui, sans-serif'
  ctx.fillStyle = '#5b5748'
  ctx.fillText('via MetalCalc', 32, height - 16)

  canvas.toBlob((blob) => {
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = filename
    link.click()
    URL.revokeObjectURL(url)
  })
}
