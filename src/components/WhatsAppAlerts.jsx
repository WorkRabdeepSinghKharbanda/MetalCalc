import { useEffect, useState } from 'react'
import { loadWhatsAppSettings, saveWhatsAppSettings } from '../utils/whatsappSettings.js'
import { loadWhatsAppLog, appendWhatsAppLog } from '../utils/whatsappLog.js'
import { sendWhatsApp } from '../utils/sendWhatsApp.js'
import { useToast } from '../context/ToastContext.jsx'

function fmt(n, decimals = 2) {
  return n == null || Number.isNaN(n) ? '—' : n.toLocaleString(undefined, { maximumFractionDigits: decimals })
}

function pickMessage(pick) {
  return `🚀 Today's top pick (lowest PEG): ${pick.symbol} (${pick.name}) — PEG ${fmt(pick.peg)}, Price $${fmt(pick.price)}. Consider reviewing for a trade.`
}

export default function WhatsAppAlerts({ topPick, loading }) {
  const showToast = useToast()
  const [settings, setSettings] = useState(() => loadWhatsAppSettings())
  const [log, setLog] = useState(() => loadWhatsAppLog())
  const [sending, setSending] = useState(false)

  useEffect(() => {
    saveWhatsAppSettings(settings)
  }, [settings])

  async function fireAlert(pick, trigger) {
    setSending(true)
    const message = pickMessage(pick)
    const result = settings.phoneNumber
      ? await sendWhatsApp(settings.phoneNumber, message)
      : { ok: false, error: 'No WhatsApp number set' }

    setLog(
      appendWhatsAppLog({
        symbol: pick.symbol,
        name: pick.name,
        price: pick.price,
        peg: pick.peg,
        trigger,
        status: result.ok ? 'sent' : 'failed',
        error: result.ok ? null : result.error,
      })
    )
    setSettings((s) => saveWhatsAppSettings({ ...s, lastTopPick: pick.symbol }))
    setSending(false)
    showToast(result.ok ? `WhatsApp alert sent for ${pick.symbol}` : `Alert failed: ${result.error}`)
  }

  // Auto-check: when the #1 pick changes from what we last alerted on, and the
  // feature is enabled with a number set, fire automatically. Only runs while
  // this page is open — there's no background scheduler behind this.
  useEffect(() => {
    if (!topPick || !settings.enabled || !settings.phoneNumber) return
    if (topPick.symbol === settings.lastTopPick) return
    fireAlert(topPick, 'auto (rank #1 changed)')
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [topPick?.symbol, settings.enabled, settings.phoneNumber])

  return (
    <div className="whatsapp-section">
      <h2 className="section-title" style={{ margin: '0 0 0.5rem' }}>WhatsApp Trade Alerts</h2>
      <p className="muted small-note" style={{ marginBottom: '1rem' }}>
        Sends a WhatsApp message when the #1 ranked pick (lowest PEG) changes, via a Twilio-backed serverless
        function — your phone number and the send call never touch the browser's public bundle. Only fires while
        this page is open; there's no background/push delivery.
      </p>

      <div className="card whatsapp-settings">
        <label className="alert-repeat">
          <input
            type="checkbox"
            checked={settings.enabled}
            onChange={(e) => setSettings((s) => ({ ...s, enabled: e.target.checked }))}
          />
          Enable WhatsApp alerts
        </label>
        <input
          type="tel"
          placeholder="+1 555 555 5555"
          value={settings.phoneNumber}
          onChange={(e) => setSettings((s) => ({ ...s, phoneNumber: e.target.value }))}
        />
        <button
          className="btn btn-primary"
          disabled={!topPick || loading || sending || !settings.phoneNumber}
          onClick={() => fireAlert(topPick, 'manual test')}
        >
          {sending ? 'Sending…' : '📲 Send test alert now'}
        </button>
      </div>

      <h3 className="section-title" style={{ fontSize: '1.1rem', margin: '2rem 0 0.75rem' }}>Event Log</h3>
      {log.length === 0 ? (
        <div className="card empty-state">
          <p>No alerts sent yet.</p>
        </div>
      ) : (
        <div className="table-scroll">
          <table className="stock-table">
            <thead>
              <tr>
                <th>When</th>
                <th>Stock</th>
                <th>Price</th>
                <th>PEG</th>
                <th>Trigger</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {log.map((entry) => (
                <tr key={entry.id}>
                  <td>{new Date(entry.timestamp).toLocaleString()}</td>
                  <td><strong>{entry.symbol}</strong> {entry.name}</td>
                  <td>${fmt(entry.price)}</td>
                  <td>{fmt(entry.peg)}</td>
                  <td>{entry.trigger}</td>
                  <td className={entry.status === 'sent' ? 'arrow up' : 'arrow down'} title={entry.error ?? ''}>
                    {entry.status === 'sent' ? '✓ sent' : `✕ failed`}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
