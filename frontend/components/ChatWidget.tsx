'use client'
import { useState } from 'react'
import { sendChat } from '@/lib/api'
import { MessageCircle, X, Send, Bot } from 'lucide-react'

interface Message {
  role:    'user' | 'assistant'
  content: string
}

interface Props {
  context?: string
}

export default function ChatWidget({ context }: Props) {
  const [open, setOpen]       = useState(false)
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput]     = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSend() {
    if (!input.trim() || loading) return
    const userMsg: Message = { role: 'user', content: input }
    const newMessages      = [...messages, userMsg]
    setMessages(newMessages)
    setInput('')
    setLoading(true)

    try {
      const data = await sendChat(newMessages, context)
      setMessages(prev => [...prev, { role: 'assistant', content: data.reply }])
    } catch {
      setMessages(prev => [...prev, { role: 'assistant', content: 'Maaf, terjadi kesalahan. Coba lagi.' }])
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="mt-8">
      {!open ? (
        <button
          onClick={() => setOpen(true)}
          className="w-full glass-card card-hover flex items-center justify-center gap-3 py-4 transition-all duration-200"
          style={{ color: 'var(--accent)' }}
        >
          <MessageCircle className="w-5 h-5" />
          <span className="text-sm font-semibold">Tanya AI tentang tanaman ini</span>
        </button>
      ) : (
        <div className="glass-card overflow-hidden animate-fade-in-up">
          {/* Header */}
          <div className="flex items-center justify-between px-5 py-3.5 border-b"
            style={{ borderColor: 'var(--border-subtle)', background: 'rgba(0,0,0,0.15)' }}>
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg flex items-center justify-center"
                style={{ background: 'var(--accent-soft)' }}>
                <Bot className="w-4 h-4" style={{ color: 'var(--accent)' }} />
              </div>
              <p className="text-sm font-bold text-white">AgriWise AI</p>
            </div>
            <button onClick={() => setOpen(false)}
              className="w-7 h-7 rounded-lg flex items-center justify-center transition-colors hover:bg-white/10"
              style={{ color: 'var(--text-muted)' }}>
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Messages */}
          <div className="p-5 flex flex-col gap-3 min-h-[120px] max-h-80 overflow-y-auto">
            {messages.length === 0 && (
              <div className="text-center py-6">
                <Bot className="w-8 h-8 mx-auto mb-3 opacity-30" />
                <p className="text-[12px]" style={{ color: 'var(--text-dim)' }}>
                  Tanya tentang cara tanam, pupuk, hama, atau tips panen!
                </p>
              </div>
            )}
            {messages.map((m, i) => (
              <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`whitespace-pre-wrap max-w-[85%] text-[13px] rounded-xl px-4 py-2.5 leading-relaxed ${
                  m.role === 'user'
                    ? 'rounded-br-md'
                    : 'rounded-bl-md'
                }`}
                style={m.role === 'user' ? {
                  background: 'var(--accent-soft)',
                  color: '#d1fae5',
                  border: '1px solid var(--accent-border)',
                } : {
                  background: 'rgba(0,0,0,0.25)',
                  color: 'var(--text-secondary)',
                  border: '1px solid var(--border-subtle)',
                }}>
                  {m.content}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="rounded-xl px-4 py-2.5 text-[13px] flex items-center gap-2"
                  style={{ background: 'rgba(0,0,0,0.25)', color: 'var(--text-dim)', border: '1px solid var(--border-subtle)' }}>
                  <div className="flex gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-slate-500 animate-bounce" style={{ animationDelay: '0ms' }} />
                    <span className="w-1.5 h-1.5 rounded-full bg-slate-500 animate-bounce" style={{ animationDelay: '150ms' }} />
                    <span className="w-1.5 h-1.5 rounded-full bg-slate-500 animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                  AI sedang mengetik...
                </div>
              </div>
            )}
          </div>

          {/* Input */}
          <div className="flex gap-2 p-4 border-t" style={{ borderColor: 'var(--border-subtle)' }}>
            <input
              type="text"
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSend()}
              placeholder="Contoh: Bagaimana cara menanam cabai?"
              className="input-field flex-1"
              style={{ borderRadius: '10px' }}
            />
            <button
              onClick={handleSend}
              disabled={loading || !input.trim()}
              className="btn-primary flex items-center gap-2 px-5"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
