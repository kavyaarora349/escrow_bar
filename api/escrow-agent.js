const DEFAULT_MODEL = process.env.GEMINI_MODEL || 'gemini-2.5-flash'

const SYSTEM_PROMPT = `
You are Escrow Agent for EscrowBar, a decentralized bounty platform built on Algorand Testnet.

Product facts you must stick to:
- Each bounty creates its own Algorand application and application account.
- The application account is used as the escrow holder for the bounty reward.
- The creator funds the bounty when creating it, including application-account minimum balance funding plus the reward amount.
- A worker claims the bounty on-chain before submitting work.
- Creator approval is the step that releases the escrowed ALGO to the worker wallet.
- The current lifecycle is effectively open, claimed, submitted, approved, with some code comments also referencing cancelled.
- Wallet connection is required for on-chain actions.
- The app currently runs on Algorand Testnet.
- The Disputes screen supports DAO-style voting in the frontend (open dispute, votes, timed resolution), but payout arbitration is not fully on-chain yet.

Behavior rules:
- Be accurate and honest about what is implemented today.
- Never invent governance, arbitration, staking, or moderation features that are not described above.
- If the user asks about disputes, explain the current limitation clearly.
- Keep answers concise, practical, and friendly.
- Prefer 1-3 short paragraphs or a short flat list.
- Do not ask for private keys, seed phrases, or secrets.
- If the question is unrelated to EscrowBar, steer the user back to escrow, bounties, wallet flow, payout flow, or current product behavior.
`.trim()

function extractText(payload) {
  const candidates = Array.isArray(payload?.candidates) ? payload.candidates : []

  return candidates
    .flatMap((candidate) => candidate?.content?.parts ?? [])
    .map((part) => part?.text ?? '')
    .join('\n')
    .trim()
}

module.exports = async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store')

  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' })
    return
  }

  if (!process.env.GEMINI_API_KEY) {
    res.status(503).json({ error: 'Missing GEMINI_API_KEY' })
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
      .map((message) => {
        const role = message?.role === 'assistant' ? 'Assistant' : 'User'
        const content = typeof message?.content === 'string' ? message.content.trim() : ''
        return content ? `${role}: ${content}` : ''
      })
      .filter(Boolean)
      .join('\n\n')

    const userPrompt = `
Current app context:
- Active dashboard tab: ${activeTab}
- Wallet connected: ${walletConnected ? 'yes' : 'no'}
- Network: ${network}

Conversation so far:
${conversation || 'No prior conversation.'}

Latest user question:
${prompt}
`.trim()

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${DEFAULT_MODEL}:generateContent`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-goog-api-key': process.env.GEMINI_API_KEY,
      },
      body: JSON.stringify({
        systemInstruction: {
          parts: [{ text: SYSTEM_PROMPT }],
        },
        contents: [
          {
            role: 'user',
            parts: [{ text: userPrompt }],
          },
        ],
        generationConfig: {
          temperature: 0.35,
          maxOutputTokens: 320,
        },
      }),
    })

    const payload = await response.json()

    if (!response.ok) {
      const errorMessage = payload?.error?.message || 'Gemini request failed'
      res.status(response.status).json({ error: errorMessage })
      return
    }

    const reply = extractText(payload)

    if (!reply) {
      res.status(502).json({ error: 'Gemini returned an empty response' })
      return
    }

    res.status(200).json({ reply })
  } catch (error) {
    console.error('Escrow agent API error:', error)
    res.status(500).json({ error: 'Failed to generate escrow assistant reply' })
  }
}
