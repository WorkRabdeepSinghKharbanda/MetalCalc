export async function sendTelegram(chatId, message) {
  try {
    const res = await fetch('/api/send-telegram', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chatId, message }),
    })
    const data = await res.json()
    if (!res.ok) return { ok: false, error: data.error ?? `Request failed (${res.status})` }
    return { ok: true }
  } catch (e) {
    return { ok: false, error: e.message }
  }
}
