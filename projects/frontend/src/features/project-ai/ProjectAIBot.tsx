import { useEffect, useRef, useState } from 'react'
import { Loader2, MessageCircleMore, SendHorizonal, Sparkles, X, Bot } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { cn } from '@/lib/utils'
import { getProjectAIReply, getProjectAIStarterPrompts } from './knowledge'

type AgentRole = 'assistant' | 'user'

interface ChatMessage {
  id: string
  role: AgentRole
  content: string
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
    content: "Hi! I'm the EscrowBar AI Assistant. Ask me anything about bounties, your wallet, or how the platform works.",
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
    setMessages((curr) => {
      if (curr.length !== 1 || curr[0].role !== 'assistant') return curr
      return [buildWelcomeMessage()]
    })
  }, [activeTab, walletConnected])

  async function requestGeminiReply(prompt: string, history: ChatMessage[]) {
    const contents = history.map((msg) => ({
      role: msg.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: msg.content }],
    }))

    const response = await fetch('/api/project-ai', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        prompt,
        messages: contents,
        activeTab,
        walletConnected,
        network: NETWORK_LABEL,
      }),
    })

    if (!response.ok) {
      const errText = await response.text()
      throw new Error(`API error ${response.status}: ${errText}`)
    }

    const payload = await response.json()
    const reply = payload.reply?.trim()
    if (!reply) throw new Error('Empty reply from AI')
    return reply
  }

  async function handleSend(messageOverride?: string) {
    const prompt = (messageOverride ?? input).trim()
    if (!prompt || submitting) return

    const userMessage: ChatMessage = { id: createId(), role: 'user', content: prompt }
    const nextMessages = [...messages, userMessage]
    setMessages(nextMessages)
    setInput('')
    setOpen(true)
    setSubmitting(true)

    try {
      const reply = await requestGeminiReply(prompt, nextMessages)
      setMessages((curr) => [
        ...curr,
        { id: createId(), role: 'assistant', content: reply, followUps: STARTER_PROMPTS },
      ])
    } catch (error) {
      console.error('Project AI fallback engaged:', error)
      const fallback = getProjectAIReply(prompt, context)
      setMessages((curr) => [
        ...curr,
        { id: createId(), role: 'assistant', content: fallback.answer, followUps: fallback.followUps },
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

  const starterPrompts =
    messages.at(-1)?.role === 'assistant'
      ? messages.at(-1)?.followUps ?? getProjectAIStarterPrompts(context)
      : getProjectAIStarterPrompts(context)

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col items-end gap-3 md:right-8">
      {open && (
        <div
          className="flex flex-col overflow-hidden rounded-2xl border border-white/10 bg-[#0d0d0f] shadow-2xl shadow-black/60"
          style={{ width: '22rem', height: '520px', maxHeight: '85vh', maxWidth: 'calc(100vw - 1.5rem)' }}
        >
          {/* ── Header ── */}
          <div className="flex shrink-0 items-center justify-between border-b border-white/8 bg-[#131316] px-4 py-3">
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-600/20 ring-1 ring-blue-500/30">
                <Bot className="h-4 w-4 text-blue-400" />
              </div>
              <div>
                <p className="text-[13px] font-semibold leading-tight text-white">EscrowBar Bot</p>
                <p className="text-[10px] leading-tight text-slate-500">Powered by Gemini</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1 rounded-full border border-blue-500/20 bg-blue-500/10 px-2 py-0.5 text-[9px] font-bold uppercase tracking-widest text-blue-400">
                <Sparkles className="h-2.5 w-2.5" />
                AI
              </span>
              <button
                onClick={() => setOpen(false)}
                className="flex h-7 w-7 items-center justify-center rounded-full bg-white/5 text-slate-400 transition-colors hover:bg-white/10 hover:text-white"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>

          {/* ── Messages ── */}
          <div
            ref={viewportRef}
            className="flex flex-1 flex-col gap-3 overflow-y-auto overflow-x-hidden px-4 py-4"
            style={{ scrollbarWidth: 'thin', scrollbarColor: '#27272a transparent' }}
          >
            {messages.map((message) => (
              <div
                key={message.id}
                className={cn('flex w-full', message.role === 'user' ? 'justify-end' : 'justify-start')}
              >
                <div
                  className={cn(
                    'max-w-[80%] break-words rounded-2xl px-3.5 py-2.5 text-[13px] leading-relaxed',
                    message.role === 'user'
                      ? 'rounded-br-sm bg-blue-600 text-white'
                      : 'rounded-bl-sm border border-white/8 bg-[#1c1c20] text-slate-200',
                  )}
                >
                  {message.content}
                </div>
              </div>
            ))}

            {submitting && (
              <div className="flex justify-start">
                <div className="flex items-center gap-2 rounded-2xl rounded-bl-sm border border-white/8 bg-[#1c1c20] px-3.5 py-2.5">
                  <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-blue-400 [animation-delay:0ms]" />
                  <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-blue-400 [animation-delay:150ms]" />
                  <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-blue-400 [animation-delay:300ms]" />
                </div>
              </div>
            )}
          </div>

          {/* ── Quick prompts ── */}
          <div className="shrink-0 border-t border-white/8 bg-[#131316] px-4 pt-3 pb-1">
            <div className="flex flex-wrap gap-1.5">
              {starterPrompts.slice(0, 3).map((prompt: string) => (
                <button
                  key={prompt}
                  onClick={() => handleSend(prompt)}
                  className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-[11px] text-slate-300 transition-colors hover:border-blue-500/40 hover:bg-blue-500/10 hover:text-blue-300"
                >
                  {prompt}
                </button>
              ))}
            </div>
          </div>

          {/* ── Input ── */}
          <div className="shrink-0 bg-[#131316] px-4 pb-4 pt-2">
            <div className="flex items-end gap-2 rounded-xl border border-white/10 bg-[#0d0d0f] px-3 py-2 transition-colors focus-within:border-blue-500/40">
              <Textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask anything…"
                rows={1}
                className="flex-1 resize-none border-0 bg-transparent p-0 text-[13px] text-white placeholder:text-slate-600 focus-visible:ring-0 shadow-none min-h-[24px] max-h-[80px]"
              />
              <button
                onClick={() => handleSend()}
                disabled={submitting || !input.trim()}
                className="mb-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-blue-600 text-white transition-all hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-40"
              >
                {submitting
                  ? <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  : <SendHorizonal className="h-3.5 w-3.5" />
                }
              </button>
            </div>
            <div className="mt-1.5 flex items-center gap-1.5 px-0.5">
              <div className={`h-1.5 w-1.5 rounded-full ${walletConnected ? 'bg-emerald-500' : 'bg-slate-600'}`} />
              <span className="text-[10px] text-slate-600">{walletConnected ? 'Wallet connected' : 'Wallet not connected'}</span>
            </div>
          </div>
        </div>
      )}

      {/* ── FAB trigger ── */}
      <Button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="group h-12 w-12 rounded-full border border-blue-500/30 bg-blue-600 text-white shadow-lg shadow-blue-900/30 transition-all duration-300 hover:scale-105 hover:bg-blue-500 md:h-12 md:w-auto md:rounded-full md:px-5"
      >
        <MessageCircleMore className="h-5 w-5 transition-transform duration-300 group-hover:scale-110" />
        <span className="ml-2 hidden font-semibold tracking-wide md:inline">Ask AI</span>
      </Button>
    </div>
  )
}
