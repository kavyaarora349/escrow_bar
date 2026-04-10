import { useEffect, useRef, useState } from 'react'
import { Bot, Loader2, MessageCircleMore, SendHorizonal, Brain, Sparkles, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { cn } from '@/lib/utils'
import { getProjectAIReply, getProjectAIStarterPrompts } from './knowledge'


type AgentRole = 'assistant' | 'user'

interface ChatMessage {
  id: string
  role: AgentRole
  content: string
  title?: string
  followUps?: string[]
}

interface ProjectAIBotProps {
  activeTab: string
  walletConnected: boolean
}



const NETWORK_LABEL = 'Algorand Testnet'

const STARTER_PROMPTS = [
  'What is this platform?',
  'How do bounties work?',
  'How do I connect my wallet?',
]

function createId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
}

function buildWelcomeMessage(): ChatMessage {
  return {
    id: createId(),
    role: 'assistant',
    title: 'Welcome',
    content: "Hi! I'm the EscrowBar AI Assistant, powered by Gemini. Ask me any questions about the platform, bounties, or how to use your wallet.",
    followUps: STARTER_PROMPTS,
  }
}

export function ProjectAIBot({ activeTab, walletConnected }: ProjectAIBotProps) {
  const context = { activeTab, walletConnected, network: NETWORK_LABEL }
  const [open, setOpen] = useState(false)
  const [input, setInput] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [messages, setMessages] = useState<ChatMessage[]>(() => [buildWelcomeMessage()])
  const viewportRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    if (viewportRef.current) {
      viewportRef.current.scrollTop = viewportRef.current.scrollHeight
    }
  }, [messages, open])

  useEffect(() => {
    setMessages((currentMessages) => {
      if (currentMessages.length !== 1 || currentMessages[0].role !== 'assistant') {
        return currentMessages
      }
      return [buildWelcomeMessage()]
    })
  }, [activeTab, walletConnected])

  async function requestGeminiReply(prompt: string, history: ChatMessage[]) {
    // Note: VITE_GEMINI_API_KEY no longer needed (server handles it)
    // if (!apiKey) {
    //   throw new Error('Missing VITE_GEMINI_API_KEY in environment variables')
    // }

    // Convert history messages to Gemini API format
    const contents = history.map((msg) => ({
      role: msg.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: msg.content }]
    }))

    // Provide context matching the hardcoded AI behavior
    const systemInstruction = `You are the EscrowBar Assistant Bot. You help users navigate a decentralized freelance bounty platform built on Algorand. Keep responses concise, clear, and very helpful. Format answers cleanly using markdown if needed.\n\nContext details: User is currently on the '${activeTab}' tab, and their wallet is ${walletConnected ? 'connected' : 'not connected'}.`

    const response = await fetch('/api/project-ai', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        prompt,
        messages: contents,
        activeTab,
        walletConnected,
        network: NETWORK_LABEL
      }),
    })

    if (!response.ok) {
      const errText = await response.text()
      throw new Error(`Project AI API error ${response.status}: ${errText || 'No details from API'}`)
    }

    const payload = await response.json()
    const reply = payload.reply?.trim()

    if (!reply) {
      throw new Error('Gemini API returned an empty reply')
    }

    return reply
  }

  async function handleSend(messageOverride?: string) {
    const prompt = (messageOverride ?? input).trim()
    if (!prompt || submitting) return

    const userMessage: ChatMessage = {
      id: createId(),
      role: 'user',
      content: prompt,
    }

    const nextMessages = [...messages, userMessage]
    setMessages(nextMessages)
    setInput('')
    setOpen(true)
    setSubmitting(true)

    try {
      const reply = await requestGeminiReply(prompt, nextMessages)

      setMessages((currentMessages) => [
        ...currentMessages,
        {
          id: createId(),
          role: 'assistant',
          title: 'Project AI',
          content: reply,
          followUps: STARTER_PROMPTS,
        },
      ])
    } catch (error) {
      console.error('Project AI fallback engaged:', error)
      const fallback = getProjectAIReply(prompt, context)
      setMessages((currentMessages) => [
        ...currentMessages,
        {
          id: createId(),
          role: 'assistant',
          title: fallback.title,
          content: fallback.answer,
          followUps: fallback.followUps,
        },
      ])
    } finally {
      setSubmitting(false)
    }
  }

  function handleKeyDown(event: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault()
      handleSend()
    }
  }

  const starterPrompts = messages.at(-1)?.role === 'assistant'
    ? messages.at(-1)?.followUps ?? getProjectAIStarterPrompts(context)
    : getProjectAIStarterPrompts(context)

  return (
    <div className="fixed bottom-5 right-5 z-50 flex max-w-[calc(100vw-1.5rem)] flex-col items-end gap-3 md:right-8">
      {open && (
        <div className="w-[min(26rem,calc(100vw-1.5rem))] flex flex-col h-[600px] max-h-[80vh] overflow-hidden rounded-2xl border border-[#27272a] bg-[#09090b] shadow-2xl">
          <div className="border-b border-[#27272a] bg-[#18181b] px-5 py-4 shrink-0">
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-1.5">
                <div className="inline-flex items-center gap-1.5 rounded-full border border-blue-500/20 bg-blue-500/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest text-blue-400">
                  <Sparkles className="h-3 w-3" />
                  AI Assistant
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">EscrowBar Bot</h3>
                  <p className="text-xs text-slate-400 mt-1">
                    Powered by Google Gemini 2.5
                  </p>
                </div>
              </div>

              <Button
                type="button"
                size="icon"
                variant="ghost"
                onClick={() => setOpen(false)}
                className="h-8 w-8 rounded-full bg-[#27272a] text-slate-400 hover:text-white"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div ref={viewportRef} className="flex-1 space-y-4 overflow-y-auto px-4 py-4 bg-[#09090b]">
            {messages.map((message) => (
              <div key={message.id} className={cn('flex', message.role === 'user' ? 'justify-end' : 'justify-start')}>
                <div className={cn(
                  'max-w-[85%] rounded-2xl px-4 py-3 text-[14px] leading-relaxed',
                  message.role === 'user'
                    ? 'rounded-br-sm bg-blue-600 text-white'
                    : 'rounded-bl-sm border border-[#27272a] bg-[#18181b] text-slate-200',
                )}>
                  <div className="whitespace-pre-wrap">{message.content}</div>
                </div>
              </div>
            ))}

            {submitting && (
              <div className="flex justify-start">
                <div className="rounded-2xl rounded-bl-sm border border-[#27272a] bg-[#18181b] px-4 py-3 text-sm text-slate-400">
                  <div className="flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin text-blue-500" />
                    Thinking...
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="border-t border-[#27272a] bg-[#18181b] px-4 py-4 shrink-0">
            <div className="mb-3 flex flex-wrap gap-2">
              {starterPrompts.slice(0, 3).map((prompt: string) => (
                <Button
                  key={prompt}
                  variant="outline"
                  size="sm"
                  onClick={() => handleSend(prompt)}
                  className="h-7 rounded-full border-[#27272a] bg-[#09090b] px-3 text-[11px] font-medium text-slate-300 hover:bg-[#27272a] hover:text-white"
                >
                  {prompt}
                </Button>
              ))}
            </div>

            <div className="rounded-xl border border-[#27272a] bg-[#09090b] p-1 shadow-sm focus-within:border-blue-500/50 transition-colors">
              <Textarea
                value={input}
                onChange={(event) => setInput(event.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask EscrowBar Bot anything..."
                className="min-h-[44px] max-h-[120px] resize-none border-0 bg-transparent px-3 py-2.5 text-sm text-white placeholder:text-slate-500 focus-visible:ring-0 shadow-none"
              />

              <div className="flex items-center justify-between px-2 pb-1">
                <div className="flex items-center gap-1.5 text-[11px] text-slate-500 font-medium">
                  <div className={`h-1.5 w-1.5 rounded-full ${walletConnected ? 'bg-emerald-500' : 'bg-slate-600'}`} />
                  {walletConnected ? 'Wallet ready' : 'Wallet disconnected'}
                </div>

                <Button
                  type="button"
                  size="sm"
                  onClick={() => handleSend()}
                  disabled={submitting || !input.trim()}
                  className="h-8 w-8 rounded-lg bg-blue-600 p-0 text-white hover:bg-blue-700 disabled:opacity-50"
                >
                  {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <SendHorizonal className="h-4 w-4" />}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      <Button
        type="button"
        onClick={() => setOpen((currentOpen) => !currentOpen)}
        className="group h-12 w-12 md:h-14 md:w-auto md:px-5 rounded-full border border-blue-500/30 bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-900/20 transition-all duration-300 hover:scale-105"
      >
        <MessageCircleMore className="h-5 w-5 group-hover:scale-110 transition-transform duration-300" />
        <span className="ml-2 font-semibold tracking-wide hidden md:inline">Ask AI</span>
      </Button>
    </div>
  )
}

