import { useEffect, useRef, useState } from 'react'
import { Bot, Loader2, MessageCircleMore, SendHorizonal, ShieldCheck, Sparkles, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { cn } from '@/lib/utils'
import { getEscrowAgentReply, getEscrowAgentStarterPrompts, type EscrowAgentContext } from './knowledge'

type AgentRole = 'assistant' | 'user'

interface ChatMessage {
  id: string
  role: AgentRole
  content: string
  title?: string
  followUps?: string[]
}

interface EscrowAgentProps {
  activeTab: string
  walletConnected: boolean
}

interface AgentApiResponse {
  reply?: string
}

const NETWORK_LABEL = 'Algorand Testnet'

function createId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
}

function buildWelcomeMessage(context: EscrowAgentContext): ChatMessage {
  const reply = getEscrowAgentReply('', context)

  return {
    id: createId(),
    role: 'assistant',
    title: reply.title,
    content: reply.answer,
    followUps: reply.followUps,
  }
}

export function EscrowAgent({ activeTab, walletConnected }: EscrowAgentProps) {
  const context = { activeTab, walletConnected, network: NETWORK_LABEL }
  const [open, setOpen] = useState(false)
  const [input, setInput] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [messages, setMessages] = useState<ChatMessage[]>(() => [buildWelcomeMessage(context)])
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

      return [buildWelcomeMessage(context)]
    })
  }, [activeTab, walletConnected])

  async function requestGeminiReply(prompt: string, history: ChatMessage[]) {
    const response = await fetch('/api/escrow-agent', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        prompt,
        activeTab,
        walletConnected,
        network: NETWORK_LABEL,
        messages: history.map((message) => ({
          role: message.role,
          content: message.content,
        })),
      }),
    })

    if (!response.ok) {
      throw new Error(`Escrow agent API failed with status ${response.status}`)
    }

    const payload = (await response.json()) as AgentApiResponse
    const reply = payload.reply?.trim()

    if (!reply) {
      throw new Error('Escrow agent API returned an empty reply')
    }

    return reply
  }

  async function handleSend(messageOverride?: string) {
    const prompt = (messageOverride ?? input).trim()
    if (!prompt || submitting) {
      return
    }

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
          title: 'Escrow Agent',
          content: reply,
          followUps: getEscrowAgentStarterPrompts(context),
        },
      ])
    } catch (error) {
      console.error('Escrow agent fallback engaged:', error)

      const fallback = getEscrowAgentReply(prompt, context)

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
      void handleSend()
    }
  }

  const starterPrompts = messages.at(-1)?.role === 'assistant'
    ? messages.at(-1)?.followUps ?? getEscrowAgentStarterPrompts(context)
    : getEscrowAgentStarterPrompts(context)

  return (
    <div className="fixed bottom-5 right-5 z-40 flex max-w-[calc(100vw-1.5rem)] flex-col items-end gap-3">
      {open && (
        <div className="w-[min(26rem,calc(100vw-1.5rem))] overflow-hidden rounded-[28px] border border-cyan-500/20 bg-[#070d16]/95 shadow-[0_24px_90px_rgba(8,47,73,0.4)] backdrop-blur-xl">
          <div className="border-b border-white/10 bg-[radial-gradient(circle_at_top,#164e63_0%,#0f172a_45%,#020617_100%)] px-5 py-4">
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-2">
                <div className="inline-flex items-center gap-2 rounded-full border border-cyan-400/20 bg-cyan-400/10 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.24em] text-cyan-100">
                  <ShieldCheck className="h-3.5 w-3.5" />
                  Escrow Guide
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white">Escrow Agent</h3>
                  <p className="text-sm text-slate-300">
                    Ask about funding, payout, wallet flow, or what is really live in the disputes screen.
                  </p>
                </div>
              </div>

              <Button
                type="button"
                size="icon"
                variant="ghost"
                onClick={() => setOpen(false)}
                className="h-9 w-9 rounded-full border border-white/10 bg-white/5 text-slate-200 hover:bg-white/10 hover:text-white"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div ref={viewportRef} className="max-h-[26rem] space-y-4 overflow-y-auto px-4 py-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={cn('flex', message.role === 'user' ? 'justify-end' : 'justify-start')}
              >
                <div
                  className={cn(
                    'max-w-[88%] rounded-3xl px-4 py-3 text-sm leading-6 shadow-sm',
                    message.role === 'user'
                      ? 'rounded-br-md bg-cyan-500 text-slate-950'
                      : 'rounded-bl-md border border-white/10 bg-white/[0.04] text-slate-100',
                  )}
                >
                  {message.role === 'assistant' && message.title && (
                    <div className="mb-1 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-cyan-200/90">
                      <Bot className="h-3.5 w-3.5" />
                      {message.title}
                    </div>
                  )}
                  <p className="whitespace-pre-wrap">{message.content}</p>
                </div>
              </div>
            ))}

            {submitting && (
              <div className="flex justify-start">
                <div className="rounded-3xl rounded-bl-md border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-slate-200">
                  <div className="flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin text-cyan-300" />
                    Thinking through the escrow flow...
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="border-t border-white/10 bg-slate-950/70 px-4 py-4">
            <div className="mb-3 flex flex-wrap gap-2">
              {starterPrompts.slice(0, 3).map((prompt) => (
                <button
                  key={prompt}
                  type="button"
                  onClick={() => void handleSend(prompt)}
                  className="rounded-full border border-cyan-400/20 bg-cyan-400/10 px-3 py-1.5 text-xs font-medium text-cyan-100 transition-colors hover:bg-cyan-400/20"
                >
                  {prompt}
                </button>
              ))}
            </div>

            <div className="rounded-[24px] border border-white/10 bg-white/[0.04] p-2">
              <Textarea
                value={input}
                onChange={(event) => setInput(event.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask how escrow, payout, claiming, or disputes work..."
                className="min-h-[54px] resize-none border-0 bg-transparent px-3 py-2 text-sm text-slate-100 placeholder:text-slate-500 focus-visible:ring-0"
              />

              <div className="mt-2 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2 text-xs text-slate-400">
                  <Sparkles className="h-3.5 w-3.5 text-cyan-300" />
                  {walletConnected ? 'Wallet connected' : 'No wallet connected yet'}
                </div>

                <Button
                  type="button"
                  onClick={() => void handleSend()}
                  disabled={submitting || !input.trim()}
                  className="rounded-full bg-cyan-400 px-4 text-slate-950 hover:bg-cyan-300"
                >
                  {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <SendHorizonal className="h-4 w-4" />}
                  Send
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      <Button
        type="button"
        onClick={() => setOpen((currentOpen) => !currentOpen)}
        className="rounded-full border border-cyan-400/30 bg-[linear-gradient(135deg,#0f172a,#164e63)] px-5 py-6 text-white shadow-[0_18px_50px_rgba(6,182,212,0.28)] hover:from-[#082f49] hover:to-[#155e75]"
      >
        <MessageCircleMore className="h-5 w-5" />
        Escrow Agent
      </Button>
    </div>
  )
}
