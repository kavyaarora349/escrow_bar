import react from '@vitejs/plugin-react'
import { defineConfig, loadEnv } from 'vite'
import { nodePolyfills } from 'vite-plugin-node-polyfills'
import path from 'path'

function extractGeminiText(payload: any): string {
  const candidates = Array.isArray(payload?.candidates) ? payload.candidates : []
  return candidates
    .flatMap((candidate: any) => candidate?.content?.parts ?? [])
    .map((part: any) => part?.text ?? '')
    .join('\n')
    .trim()
}

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const geminiApiKey = env.VITE_GEMINI_API_KEY

  return {
    server: {
      proxy: {
        '/api/gemini': {
          target: 'https://generativelanguage.googleapis.com',
          changeOrigin: true,
          rewrite: (requestPath) => requestPath.replace(/^\/api\/gemini/, '/v1beta'),
        },
      },
    },
    plugins: [
      react(),
      {
        name: 'project-ai-dev-api',
        configureServer(server) {
          server.middlewares.use('/api/project-ai', async (req, res) => {
            if (req.method !== 'POST') {
              res.statusCode = 405
              res.setHeader('Content-Type', 'application/json')
              res.end(JSON.stringify({ error: 'Method not allowed' }))
              return
            }

            if (!geminiApiKey) {
              res.statusCode = 503
              res.setHeader('Content-Type', 'application/json')
              res.end(JSON.stringify({ error: 'Missing GEMINI_API_KEY in frontend .env.local' }))
              return
            }

            let bodyText = ''
            req.on('data', (chunk) => {
              bodyText += chunk.toString()
            })

            req.on('end', async () => {
              try {
                const body = bodyText ? JSON.parse(bodyText) : {}
                const prompt = typeof body.prompt === 'string' ? body.prompt.trim() : ''
                const messages = Array.isArray(body.messages) ? body.messages : []
                const activeTab = typeof body.activeTab === 'string' ? body.activeTab : '/'
                const walletConnected = Boolean(body.walletConnected)
                const network = typeof body.network === 'string' ? body.network : 'Algorand Testnet'

                if (!prompt) {
                  res.statusCode = 400
                  res.setHeader('Content-Type', 'application/json')
                  res.end(JSON.stringify({ error: 'Prompt is required' }))
                  return
                }

                const conversation = messages
                  .map((message: any) => {
                    const role = message?.role === 'model' ? 'Assistant' : 'User'
                    const text = Array.isArray(message?.parts) ? message.parts[0]?.text : ''
                    return text ? `${role}: ${text}` : ''
                  })
                  .filter(Boolean)
                  .join('\n\n')

                const fullPrompt = `
You are the EscrowBar Assistant Bot. You help users navigate a decentralized freelance bounty platform built on Algorand. Keep responses concise, clear, and very helpful.

Current context:
- Active tab: ${activeTab}
- Wallet connected: ${walletConnected ? 'yes' : 'no'}
- Network: ${network}

Conversation:
${conversation || 'No prior messages.'}

Latest user question:
${prompt}
`.trim()

                const response = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent', {
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/json',
                    'x-goog-api-key': geminiApiKey,
                  },
                  body: JSON.stringify({
                    contents: [
                      {
                        role: 'user',
                        parts: [{ text: fullPrompt }],
                      },
                    ],
                    generationConfig: {
                      temperature: 0.4,
                      maxOutputTokens: 512,
                    },
                  }),
                })

                const payload = await response.json()
                if (!response.ok) {
                  res.statusCode = response.status
                  res.setHeader('Content-Type', 'application/json')
                  res.end(JSON.stringify({ error: payload?.error?.message || 'Gemini API failed' }))
                  return
                }

                const reply = extractGeminiText(payload)
                res.statusCode = 200
                res.setHeader('Content-Type', 'application/json')
                res.end(JSON.stringify({ reply: reply || 'No response generated.' }))
              } catch (error) {
                res.statusCode = 500
                res.setHeader('Content-Type', 'application/json')
                res.end(JSON.stringify({ error: error instanceof Error ? error.message : 'Unexpected API error' }))
              }
            })
          })
        },
      },
      nodePolyfills({
        globals: {
          Buffer: true,
        },
      }),
    ],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    }
  }
})
