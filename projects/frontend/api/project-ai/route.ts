// Vercel API route for Project AI Gemini bot
// Place in projects/frontend/api/project-ai/route.ts for Vercel deployment
// For local dev, use vite proxy to Vercel dev or this file if server setup

import { GoogleGenerativeAI } from '@google/generative-ai'
import type { NextRequest } from 'next/server'

const API_KEY = process.env.GEMINI_API_KEY
if (!API_KEY) {
  throw new Error('GEMINI_API_KEY not set')
}

const genAI = new GoogleGenerativeAI(API_KEY)
const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' })

const PROJECT_CONTEXT = `
You are Project AI for BountyHub, a decentralized bounty platform on Algorand.

Key facts:
- Smart contracts: PyTeal/Beaker, Bounty app ID 755780805 (Testnet), escrow logic (create_bounty, claim, submit_work, approve).
- Frontend: React/Vite/TS, Tailwind, @txnlab/use-wallet-react (Pera/Defly).
- Deploy: contracts: poetry run algokit deploy testnet; frontend: pnpm dev.
- Repo structure: projects/contracts/smart_contracts/bounty/contract.py, projects/frontend/src/components/bounty/BountiesList.tsx etc.
- Always reference Testnet explorer: https://testnet.explorer.perawallet.app/applications/755780805

Be helpful, accurate, technical. Use bullet points/code blocks for clarity. Ask follow-ups.
`

export async function POST(request: Request) {
  try {
    const { prompt, messages, activeTab, walletConnected, network } = await request.json() as {
      prompt: string
      messages: { role: 'user' | 'assistant', content: string }[]
      activeTab?: string
      walletConnected?: boolean
      network?: string
    }

    // Build conversation history
    let fullPrompt = PROJECT_CONTEXT + '\\n\\nCurrent context: Tab=' + activeTab + ', Wallet=' + walletConnected + ', Network=' + network + '\\n\\nConversation:\\n'
    for (const msg of messages) {
      fullPrompt += msg.role + ': ' + msg.content + '\\n'
    }
    fullPrompt += 'User: ' + prompt + '\\nAssistant: '

    const result = await model.generateContent(fullPrompt)
    const response = await result.response
    const text = response.text()?.trim()

    return Response.json({ reply: text || 'Sorry, could not generate response.' })
  } catch (error) {
    console.error('Gemini error:', error)
    return Response.json({ reply: 'Error: Could not reach AI service. Using fallback knowledge.' }, { status: 500 })
  }
}

