import { useEffect, useRef, useState } from 'react'
import { Send, Plus, Trash2, Loader2, MessageCircleQuestion, Bot, User } from 'lucide-react'
import api, { getErrorMessage } from '../services/api'

export default function DoubtSolver() {
  const [conversations, setConversations] = useState([])
  const [activeId, setActiveId]           = useState(null)
  const [messages, setMessages]           = useState([])
  const [text, setText]                   = useState('')
  const [sending, setSending]             = useState(false)
  const [error, setError]                 = useState('')
  const bottomRef = useRef(null)
  const inputRef  = useRef(null)

  const loadList = () =>
    api.get('/doubts').then((r) => setConversations(r.data.conversations))

  useEffect(() => {
    api.get('/doubts')
      .then((r) => setConversations(r.data.conversations))
      .catch((e) => setError(getErrorMessage(e)))
  }, [])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, sending])

  const openConversation = async (id) => {
    setError('')
    try {
      const r = await api.get(`/doubts/${id}`)
      setActiveId(id)
      setMessages(r.data.conversation.messages)
    } catch (e) { setError(getErrorMessage(e)) }
  }

  const newChat = () => {
    setActiveId(null); setMessages([]); setError('')
    setTimeout(() => inputRef.current?.focus(), 80)
  }

  const remove = async (id) => {
    if (!window.confirm('Delete this conversation?')) return
    try {
      await api.delete(`/doubts/${id}`)
      if (id === activeId) newChat()
      loadList()
    } catch (e) { setError(getErrorMessage(e)) }
  }

  const send = async (e) => {
    e.preventDefault()
    const msg = text.trim()
    if (!msg || sending) return
    setError(''); setText('')
    setMessages((m) => [...m, { role: 'user', content: msg }])
    setSending(true)
    try {
      const r = await api.post('/doubts/ask', { message: msg, conversationId: activeId })
      setActiveId(r.data.conversationId)
      setMessages((m) => [...m, { role: 'model', content: r.data.answer }])
      loadList()
    } catch (err) {
      setError(getErrorMessage(err))
      setMessages((m) => m.slice(0, -1))
      setText(msg)
    } finally { setSending(false) }
  }

  const suggestions = ['Explain recursion with an example', 'What is photosynthesis?', 'How does HTTP work?']

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h2 className="text-2xl font-extrabold tracking-tight text-[#0f172a]">AI Doubt Solver</h2>
        <p className="mt-0.5 text-sm text-[#6b7280]">Ask any academic question and get instant, detailed answers.</p>
      </div>

      <div className="grid h-[calc(100vh-14rem)] gap-4 lg:grid-cols-[260px_1fr]">

        {/* ── Sidebar ───────────────────────────── */}
        <aside className="flex flex-col overflow-hidden rounded-2xl border border-[#e5e7eb] bg-white shadow-sm">
          <div className="border-b border-[#f3f4f6] p-3">
            <button
              onClick={newChat}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#2563eb] py-2.5 text-sm font-semibold text-white transition hover:bg-[#1d4ed8] shadow-sm"
            >
              <Plus size={15} /> New conversation
            </button>
          </div>
          <div className="flex-1 overflow-y-auto p-2">
            {conversations.length === 0 && (
              <div className="p-4 text-center">
                <MessageCircleQuestion size={22} className="mx-auto mb-2 text-[#d1d5db]" />
                <p className="text-xs text-[#9ca3af]">No conversations yet</p>
              </div>
            )}
            {conversations.map((c) => (
              <div
                key={c._id}
                className={`group mb-0.5 flex items-center justify-between gap-1 rounded-xl px-3 py-2.5 text-sm transition-colors ${
                  c._id === activeId
                    ? 'bg-[#eff6ff] font-medium text-[#2563eb]'
                    : 'text-[#374151] hover:bg-[#f9fafb]'
                }`}
              >
                <button onClick={() => openConversation(c._id)} className="flex-1 truncate text-left leading-snug">
                  {c.title}
                </button>
                <button
                  onClick={() => remove(c._id)}
                  className="ml-1 shrink-0 rounded-lg p-1 text-[#d1d5db] opacity-0 transition group-hover:opacity-100 hover:bg-[#fee2e2] hover:text-[#ef4444]"
                >
                  <Trash2 size={12} />
                </button>
              </div>
            ))}
          </div>
        </aside>

        {/* ── Chat ──────────────────────────────── */}
        <section className="flex min-h-0 flex-col overflow-hidden rounded-2xl border border-[#e5e7eb] bg-white shadow-sm">
          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-5 space-y-5">
            {messages.length === 0 && !sending && (
              <div className="flex h-full flex-col items-center justify-center px-6 py-10 text-center">
                <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#2563eb] text-white shadow-lg">
                  <Bot size={26} />
                </div>
                <h3 className="text-sm font-semibold text-[#111827]">Ask anything academic</h3>
                <p className="mt-1.5 max-w-xs text-sm leading-relaxed text-[#9ca3af]">
                  Get instant AI answers to any subject — maths, science, history, coding, and more.
                </p>
                <div className="mt-5 flex flex-wrap justify-center gap-2">
                  {suggestions.map((s) => (
                    <button
                      key={s}
                      onClick={() => setText(s)}
                      className="rounded-xl border border-[#e5e7eb] bg-[#f9fafb] px-3 py-1.5 text-xs font-medium text-[#4b5563] transition hover:border-[#bfdbfe] hover:bg-[#eff6ff] hover:text-[#2563eb]"
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {messages.map((m, i) => (
              <div key={i} className={`flex gap-3 ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                {m.role !== 'user' && (
                  <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-[#2563eb] text-white shadow-sm">
                    <Bot size={14} />
                  </div>
                )}
                <div
                  className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                    m.role === 'user'
                      ? 'rounded-tr-sm bg-[#2563eb] text-white shadow-sm'
                      : 'rounded-tl-sm border border-[#f3f4f6] bg-[#fafafa] text-[#111827]'
                  }`}
                >
                  {m.content}
                </div>
                {m.role === 'user' && (
                  <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-[#e5e7eb] text-[#6b7280]">
                    <User size={13} />
                  </div>
                )}
              </div>
            ))}

            {sending && (
              <div className="flex gap-3">
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-[#2563eb] text-white">
                  <Bot size={14} />
                </div>
                <div className="rounded-2xl rounded-tl-sm border border-[#f3f4f6] bg-[#fafafa] px-4 py-3">
                  <div className="flex items-center gap-1">
                    <div className="dot-pulse h-1.5 w-1.5 rounded-full bg-[#2563eb]" />
                    <div className="dot-pulse h-1.5 w-1.5 rounded-full bg-[#2563eb]" />
                    <div className="dot-pulse h-1.5 w-1.5 rounded-full bg-[#2563eb]" />
                  </div>
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Error */}
          {error && (
            <div className="mx-4 mb-2 rounded-xl border border-[#fca5a5] bg-[#fff1f2] px-3 py-2.5 text-sm text-[#b91c1c]">
              {error}
            </div>
          )}

          {/* Input */}
          <form onSubmit={send} className="flex gap-2 border-t border-[#f3f4f6] p-3">
            <input
              ref={inputRef}
              value={text}
              onChange={(e) => setText(e.target.value)}
              maxLength={2000}
              placeholder="Type your question here…"
              className="flex-1 rounded-xl border border-[#e5e7eb] bg-[#fafafa] px-4 py-2.5 text-sm text-[#111827] placeholder:text-[#9ca3af] outline-none transition focus:border-[#2563eb] focus:bg-white focus:ring-2 focus:ring-[#2563eb]/10"
            />
            <button
              disabled={sending || !text.trim()}
              className="flex items-center gap-2 rounded-xl bg-[#2563eb] px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#1d4ed8] hover:shadow disabled:opacity-40 active:scale-95"
            >
              <Send size={15} />
            </button>
          </form>
        </section>
      </div>
    </div>
  )
}
