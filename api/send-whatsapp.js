// Server-only endpoint — holds the Twilio auth token, which must never reach the
// browser (unlike VITE_FINNHUB_API_KEY, which is fine client-side). Vercel picks
// this up automatically as a serverless function because it lives under /api.
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' })
    return
  }

  const { to, message } = req.body ?? {}
  if (!to || !message) {
    res.status(400).json({ error: 'Missing "to" or "message"' })
    return
  }

  const accountSid = process.env.TWILIO_ACCOUNT_SID
  const from = process.env.TWILIO_WHATSAPP_FROM
  // Basic Auth accepts either AccountSid:AuthToken or ApiKeySid:ApiKeySecret —
  // the URL path always needs the real Account SID regardless of which pair authenticates.
  const authUser = process.env.TWILIO_API_KEY_SID || accountSid
  const authPass = process.env.TWILIO_API_KEY_SECRET || process.env.TWILIO_AUTH_TOKEN

  if (!accountSid || !authUser || !authPass || !from) {
    res.status(503).json({ error: 'WhatsApp sending is not configured on the server yet' })
    return
  }

  try {
    const body = new URLSearchParams({
      To: to.startsWith('whatsapp:') ? to : `whatsapp:${to}`,
      From: from.startsWith('whatsapp:') ? from : `whatsapp:${from}`,
      Body: message,
    })

    const twilioRes = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`, {
      method: 'POST',
      headers: {
        Authorization: `Basic ${Buffer.from(`${authUser}:${authPass}`).toString('base64')}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body,
    })

    const data = await twilioRes.json()
    if (!twilioRes.ok) {
      res.status(twilioRes.status).json({ error: data.message ?? 'Twilio request failed' })
      return
    }

    res.status(200).json({ sid: data.sid, status: data.status })
  } catch (e) {
    res.status(502).json({ error: e.message })
  }
}
