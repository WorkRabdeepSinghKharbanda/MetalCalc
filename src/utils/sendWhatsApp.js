export async function sendWhatsApp(to, message) {
  try {
    const res = await fetch('/api/send-whatsapp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ to, message }),
    })
    const data = await res.json()
    if (!res.ok) return { ok: false, error: data.error ?? `Request failed (${res.status})` }
    return { ok: true }
  } catch (e) {
    return { ok: false, error: e.message }
  }
}
