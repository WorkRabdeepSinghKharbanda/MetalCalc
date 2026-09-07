import { useEffect, useState } from 'react'
import { loadTelegramSettings, saveTelegramSettings } from '../utils/telegramSettings.js'
import { loadTelegramLog, appendTelegramLog } from '../utils/telegramLog.js'
import { sendTelegram } from '../utils/sendTelegram.js'
import { useToast } from '../context/ToastContext.jsx'

function fmt(n, decimals = 2) {
  return n == null || Number.isNaN(n) ? '—' : n.toLocaleString(undefined, { maximumFractionDigits: decimals })
}

function pickMessage(pick) {
  return `🚀 Today's top pick (lowest PEG): ${pick.symbol} (${pick.name}) — PEG ${fmt(pick.peg)}, Price $${fmt(pick.price)}. Consider reviewing for a trade.`
}

export default function TelegramAlerts({ topPick, loading }) {
  const showToast = useToast()
  const [settings, setSettings] = useState(() => loadTelegramSettings())
  const [log, setLog] = useState(() => loadTelegramLog())
  const [sending, setSending] = useState(false)

  useEffect(() => {
    saveTelegramSettings(settings)
  }, [settings])

  async function fireAlert(pick, trigger) {
    setSending(true)
    const message = pickMessage(pick)
    const result = settings.chatId
      ? await sendTelegram(settings.chatId, message)
      : { ok: false, error: 'No Telegram Chat ID set' }

    setLog(
      appendTelegramLog({
        symbol: pick.symbol,
        name: pick.name,
        price: pick.price,
        peg: pick.peg,
        trigger,
        status: result.ok ? 'sent' : 'failed',
        error: result.ok ? null : result.error,
      })
    )
    setSettings((s) => saveTelegramSettings({ ...s, lastTopPick: pick.symbol }))
    setSending(false)
    showToast(result.ok ? `Telegram alert sent for ${pick.symbol}` : `Alert failed: ${result.error}`)
  }

  // Auto-check: when the #1 pick changes from what we last alerted on, and the
  // feature is enabled with a chat ID set, fire automatically. Only runs while
  // this page is open — there's no background scheduler behind this.
  useEffect(() => {
    if (!topPick || !settings.enabled || !settings.chatId) return
    if (topPick.symbol === settings.lastTopPick) return
    fireAlert(topPick, 'auto (rank #1 changed)')
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [topPick?.symbol, settings.enabled, settings.chatId])

  return (
    <div className="whatsapp-section">
      <h2 className="section-title" style={{ margin: '0 0 0.5rem' }}>Telegram Trade Alerts</h2>
      <p className="muted small-note" style={{ marginBottom: '1rem' }}>
        Sends a Telegram message when the #1 ranked pick (lowest PEG) changes, via a bot-backed serverless
        function — the bot token never touches the browser's public bundle. Message{' '}
        <a href="https://t.me/userinfobot" target="_blank" rel="noopener noreferrer">@userinfobot</a> to find your
        Chat ID. Only fires while this page is open; there's no background/push delivery.
      </p>

      <div className="card whatsapp-settings">
        <label className="alert-repeat">
          <input
            type="checkbox"
            checked={settings.enabled}
            onChange={(e) => setSettings((s) => ({ ...s, enabled: e.target.checked }))}
          />
          Enable Telegram alerts
        </label>
        <input
          type="text"
          placeholder="Chat ID (e.g. 123456789)"
          value={settings.chatId}
          onChange={(e) => setSettings((s) => ({ ...s, chatId: e.target.value }))}
        />
        <button
          className="btn btn-primary"
          disabled={!topPick || loading || sending || !settings.chatId}
          onClick={() => fireAlert(topPick, 'manual test')}
        >
          {sending ? 'Sending…' : '📨 Send test alert now'}
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
