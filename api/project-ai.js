const DEFAULT_MODEL = process.env.GEMINI_MODEL || 'gemini-2.5-flash'

const SYSTEM_PROMPT = `
You are the EscrowBar Assistant Bot. You help users navigate a decentralized freelance bounty platform built on Algorand Testnet.

Product facts:
- Each bounty creates its own Algorand application and application account used as the escrow holder.
- The creator funds the bounty at creation time (including app account min balance + reward amount).
- A worker claims the bounty on-chain before submitting work.
- Creator approval releases the escrowed ALGO to the worker wallet.
- Bounty lifecycle: open → claimed → submitted → approved (or cancelled).
- Wallet connection is required for all on-chain actions.
- The Disputes screen supports DAO-style voting in the frontend, but payout arbitration is not fully on-chain yet.

Behavior rules:
- Be accurate and honest about what is implemented.
- Never invent features not described above.
- Keep answers concise, practical, and friendly (1-3 short paragraphs or a short flat list).
- Do not ask for private keys or seed phrases.
- If unrelated to EscrowBar, steer back to bounties, wallet flow, or payout flow.
`.trim()

function extractText(payload) {
  const candidates = Array.isArray(payload?.candidates) ? payload.candidates : []
  return candidates
    .flatMap((c) => c?.content?.parts ?? [])
    .map((p) => p?.text ?? '')
    .join('\n')
    .trim()
}

module.exports = async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store')
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')

  if (req.method === 'OPTIONS') {
    res.status(200).end()
    return
  }

  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' })
    return
  }

  const apiKey = process.env.GEMINI_API_KEY
  if (!apiKey) {
    res.status(503).json({ error: 'Missing GEMINI_API_KEY environment variable' })
    return
  }

  try {
    const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body || {}
    const prompt = typeof body.prompt === 'string' ? body.prompt.trim() : ''
    const activeTab = typeof body.activeTab === 'string' ? body.activeTab : 'dashboard'
    const walletConnected = Boolean(body.walletConnected)
    const network = typeof body.network === 'string' ? body.network : 'Algorand Testnet'
    const history = Array.isArray(body.messages) ? body.messages.slice(-8) : []

    if (!prompt) {
      res.status(400).json({ error: 'Prompt is required' })
      return
    }

    const conversation = history
      .map((msg) => {
        const role = msg?.role === 'model' ? 'Assistant' : 'User'
        const text = Array.isArray(msg?.parts) ? (msg.parts[0]?.text ?? '') : (msg?.content ?? '')
        return text ? `${role}: ${text.trim()}` : ''
      })
      .filter(Boolean)
      .join('\n\n')

    const userPrompt = `
Current app context:
- Active tab: ${activeTab}
- Wallet connected: ${walletConnected ? 'yes' : 'no'}
- Network: ${network}

Conversation so far:
${conversation || 'No prior conversation.'}

Latest user question:
${prompt}
`.trim()

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${DEFAULT_MODEL}:generateContent`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-goog-api-key': apiKey,
        },
        body: JSON.stringify({
          systemInstruction: { parts: [{ text: SYSTEM_PROMPT }] },
          contents: [{ role: 'user', parts: [{ text: userPrompt }] }],
          generationConfig: { temperature: 0.4, maxOutputTokens: 512 },
        }),
      }
    )

    const payload = await response.json()

    if (!response.ok) {
      const message = payload?.error?.message || 'Gemini request failed'
      res.status(response.status).json({ error: message })
      return
    }

    const reply = extractText(payload)
    if (!reply) {
      res.status(502).json({ error: 'Gemini returned an empty response' })
      return
    }

    res.status(200).json({ reply })
  } catch (error) {
    console.error('[project-ai] Error:', error)
    res.status(500).json({ error: 'Failed to generate AI reply' })
  }
}
