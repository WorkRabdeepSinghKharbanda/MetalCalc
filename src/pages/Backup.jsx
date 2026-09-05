import { useRef } from 'react'
import { exportBackup, importBackup } from '../utils/backup.js'
import { useToast } from '../context/ToastContext.jsx'
import Seo from '../components/Seo.jsx'

export default function Backup() {
  const showToast = useToast()
  const fileInputRef = useRef(null)

  function handleExport() {
    const backup = exportBackup()
    const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `metalcalc-backup-${new Date().toISOString().slice(0, 10)}.json`
    link.click()
    URL.revokeObjectURL(url)
    showToast('Backup downloaded')
  }

  function handleImportClick() {
    fileInputRef.current?.click()
  }

  function handleImportFile(e) {
    const file = e.target.files[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => {
      try {
        const backup = JSON.parse(String(reader.result))
        if (!window.confirm('This will overwrite your current Holdings, portfolios, watchlists, alerts and saved batches on this device. Continue?')) {
          return
        }
        const restored = importBackup(backup)
        showToast(`Restored ${restored} item${restored === 1 ? '' : 's'} — reloading…`)
        setTimeout(() => window.location.reload(), 1000)
      } catch {
        showToast('Could not read that file — is it a MetalCalc backup?')
      }
    }
    reader.readAsText(file)
    e.target.value = ''
  }

  return (
    <section className="zakat-page">
      <Seo
        title="Backup & Restore — MetalCalc"
        description="Export everything you've saved on this device — Holdings, Stocks, Crypto, alerts, batches — as one file, and restore it on another device."
      />
      <div className="container">
        <p className="eyebrow">Backup &amp; restore</p>
        <h1>Move your data to another device</h1>
        <p className="hero-sub" style={{ marginBottom: '2rem' }}>
          Everything here lives only in this browser's local storage — no account, nothing on a server. Export a
          backup file before clearing your browser data or switching devices, then import it back.
        </p>

        <div className="card zakat-form" style={{ flexDirection: 'column', alignItems: 'flex-start', gap: '1rem' }}>
          <div>
            <h3 style={{ margin: '0 0 0.4rem' }}>Export</h3>
            <p className="muted small-note" style={{ margin: '0 0 0.75rem' }}>
              Downloads Holdings, saved batches &amp; recipes, price alerts, Stocks/Crypto portfolios &amp; watchlists,
              and WhatsApp alert settings/log as one JSON file.
            </p>
            <button className="btn btn-primary" onClick={handleExport}>⬇ Download backup</button>
          </div>
          <div>
            <h3 style={{ margin: '0 0 0.4rem' }}>Import</h3>
            <p className="muted small-note" style={{ margin: '0 0 0.75rem' }}>
              Overwrites matching data on this device with what's in the backup file.
            </p>
            <button className="btn btn-ghost" onClick={handleImportClick}>⬆ Restore from backup</button>
            <input ref={fileInputRef} type="file" accept=".json,application/json" hidden onChange={handleImportFile} />
          </div>
        </div>
      </div>
    </section>
  )
}
