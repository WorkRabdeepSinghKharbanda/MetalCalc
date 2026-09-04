// Minimal CSV parser: handles quoted fields with escaped "" but not embedded newlines.
export function parseCsv(text) {
  return text
    .trim()
    .split('\n')
    .map((line) => {
      const cells = []
      let cell = ''
      let inQuotes = false
      for (let i = 0; i < line.length; i++) {
        const ch = line[i]
        if (inQuotes) {
          if (ch === '"' && line[i + 1] === '"') {
            cell += '"'
            i++
          } else if (ch === '"') {
            inQuotes = false
          } else {
            cell += ch
          }
        } else if (ch === '"') {
          inQuotes = true
        } else if (ch === ',') {
          cells.push(cell)
          cell = ''
        } else {
          cell += ch
        }
      }
      cells.push(cell)
      return cells
    })
}
