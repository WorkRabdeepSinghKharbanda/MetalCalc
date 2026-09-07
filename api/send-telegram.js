// Server-only endpoint — holds the Telegram bot token, which must never reach the
// browser. Vercel picks this up automatically as a serverless function because
// it lives under /api. Mirrors api/send-whatsapp.js's shape.
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' })
    return
  }

  const { chatId, message } = req.body ?? {}
  if (!chatId || !message) {
    res.status(400).json({ error: 'Missing "chatId" or "message"' })
    return
  }

  const botToken = process.env.TELEGRAM_BOT_TOKEN
  if (!botToken) {
    res.status(503).json({ error: 'Telegram sending is not configured on the server yet' })
    return
  }

  try {
    const telegramRes = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: chatId, text: message }),
    })

    const data = await telegramRes.json()
    if (!telegramRes.ok || !data.ok) {
      res.status(telegramRes.status || 502).json({ error: data.description ?? 'Telegram request failed' })
      return
    }

    res.status(200).json({ messageId: data.result.message_id })
  } catch (e) {
    res.status(502).json({ error: e.message })
  }
}
