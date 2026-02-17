import { useState, useEffect, useCallback } from 'react'
import { FaMessage, FaPaperPlane, FaXmark } from 'react-icons/fa6'
import { useAuth } from '../context/AuthContext'
import {
  fetchSupportThreads,
  createSupportThread,
  fetchThreadMessages,
  sendSupportMessage,
  type SupportThread,
  type SupportMessage,
} from '../lib/api'

interface SupportWidgetProps {
  onLoginPrompt?: () => void
}

function SupportWidget({ onLoginPrompt }: SupportWidgetProps) {
  const { user } = useAuth()
  const [open, setOpen] = useState(false)
  const [threads, setThreads] = useState<SupportThread[]>([])
  const [selectedThread, setSelectedThread] = useState<SupportThread | null>(null)
  const [messages, setMessages] = useState<SupportMessage[]>([])
  const [loading, setLoading] = useState(false)
  const [sending, setSending] = useState(false)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [showNewForm, setShowNewForm] = useState(false)
  const [newSubject, setNewSubject] = useState('')

  const loadThreads = async () => {
    if (!user?.id) return
    setLoading(true)
    setError('')
    try {
      const { threads: t } = await fetchSupportThreads(user.id)
      setThreads(t)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (open && user?.id) loadThreads()
  }, [open, user?.id])

  const refreshMessages = useCallback(async () => {
    if (!user?.id || !selectedThread) return
    try {
      const { messages: m } = await fetchThreadMessages(user.id, selectedThread.id)
      setMessages(m)
    } catch {
      // ignore poll errors
    }
  }, [user?.id, selectedThread?.id])

  useEffect(() => {
    if (!open || !selectedThread || !user?.id) return
    const interval = setInterval(refreshMessages, 3000)
    return () => clearInterval(interval)
  }, [open, selectedThread?.id, user?.id, refreshMessages])

  const loadThread = async (thread: SupportThread) => {
    if (!user?.id) return
    setSelectedThread(thread)
    setShowNewForm(false)
    setError('')
    try {
      const { messages: m } = await fetchThreadMessages(user.id, thread.id)
      setMessages(m)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load messages')
    }
  }

  const handleStartNew = () => {
    setShowNewForm(true)
    setSelectedThread(null)
    setMessages([])
    setNewSubject('')
    setMessage('')
  }

  const handleCreateAndSend = async () => {
    if (!user?.id || !message.trim()) return
    const subject = newSubject.trim() || 'General inquiry'
    setSending(true)
    setError('')
    try {
      const { thread } = await createSupportThread(user.id, subject)
      await sendSupportMessage(user.id, thread.id, message.trim())
      setMessage('')
      setNewSubject('')
      setShowNewForm(false)
      loadThreads()
      loadThread(thread)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send')
    } finally {
      setSending(false)
    }
  }

  const handleSendReply = async () => {
    if (!user?.id || !selectedThread || !message.trim()) return
    setSending(true)
    setError('')
    try {
      const { messages: m } = await sendSupportMessage(user.id, selectedThread.id, message.trim())
      setMessages(m)
      setMessage('')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send')
    } finally {
      setSending(false)
    }
  }

  const handleOpen = () => {
    if (!user) {
      onLoginPrompt?.()
      return
    }
    if (user.role !== 'buyer') return
    setOpen(true)
  }

  if (user?.role === 'admin' || user?.role === 'mod') return null

  const messageButtonClass = "fixed bottom-6 right-6 z-40 flex h-14 w-14 items-center justify-center rounded-full border-2 border-black bg-black text-white shadow-[4px_4px_0_rgba(0,0,0,0.3)] hover:bg-[#FF00FF] hover:border-[#FF00FF] transition"

  if (!user) {
    return (
      <button
        onClick={handleOpen}
        className={messageButtonClass}
        title="Message us"
      >
        <FaMessage className="h-6 w-6" />
      </button>
    )
  }

  return (
    <>
      <button
        onClick={handleOpen}
        className={messageButtonClass}
        title="Message us"
      >
        <FaMessage className="h-6 w-6" />
      </button>

      {open && (
        <div className="fixed bottom-24 right-6 z-50 w-96 max-w-[calc(100vw-3rem)] rounded-lg border-4 border-black bg-white shadow-[8px_8px_0_rgba(0,0,0,0.3)] flex flex-col max-h-[480px]">
          <div className="flex items-center justify-between p-4 border-b-2 border-black bg-fuchsia-50/80 rounded-t-lg">
            <h3 className="font-y2k font-bold text-black uppercase tracking-tight">Message us</h3>
            <button onClick={() => setOpen(false)} className="p-1 rounded border-2 border-black text-black hover:bg-black hover:text-white transition">
              <FaXmark className="h-5 w-5" />
            </button>
          </div>

          <div className="flex-1 overflow-hidden flex flex-col min-h-0">
            {showNewForm ? (
              <div className="p-4 space-y-3 flex-1 overflow-y-auto">
                <input
                  value={newSubject}
                  onChange={(e) => setNewSubject(e.target.value)}
                  placeholder="Subject (optional)"
                  className="w-full rounded border-2 border-black px-3 py-2 font-y2k text-sm font-bold focus:outline-none focus:ring-2 focus:ring-[#FF00FF]"
                />
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Your message..."
                  className="w-full rounded border-2 border-black px-3 py-2 font-y2k text-sm font-bold focus:outline-none focus:ring-2 focus:ring-[#FF00FF] resize-none"
                  rows={4}
                />
                <div className="flex gap-2">
                  <button
                    onClick={handleCreateAndSend}
                    disabled={!message.trim() || sending}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded border-2 border-black bg-black text-white font-y2k text-sm font-bold hover:bg-[#FF00FF] hover:border-[#FF00FF] disabled:opacity-50 transition"
                  >
                    <FaPaperPlane className="h-4 w-4" />
                    Send
                  </button>
                  <button
                    onClick={() => { setShowNewForm(false); setMessage(''); setNewSubject(''); }}
                    className="px-4 py-2 rounded border-2 border-black font-y2k text-sm font-bold hover:bg-black/5 transition"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <>
                <div className="border-b-2 border-black overflow-y-auto max-h-32">
                  {loading ? (
                    <div className="p-4 text-center font-y2k text-sm font-bold text-black">Loading...</div>
                  ) : threads.length > 0 ? (
                    threads.map((t) => (
                      <button
                        key={t.id}
                        onClick={() => loadThread(t)}
                        className={`w-full text-left px-4 py-2.5 border-b border-black/10 hover:bg-fuchsia-50/50 font-y2k text-sm font-bold ${
                          selectedThread?.id === t.id ? 'bg-fuchsia-100 border-l-4 border-l-black' : ''
                        }`}
                      >
                        <p className="font-bold text-black truncate">{t.subject}</p>
                        <p className="text-xs font-bold text-black/60">{new Date(t.created_at).toLocaleDateString()}</p>
                      </button>
                    ))
                  ) : (
                    <div className="p-4 text-center font-y2k text-sm font-bold text-black/70">No conversations yet</div>
                  )}
                  <button
                    onClick={handleStartNew}
                    className="w-full text-left px-4 py-2.5 font-y2k text-sm font-bold text-[#E6007E] hover:bg-fuchsia-50 border-t border-black/10"
                  >
                    + New message
                  </button>
                </div>

                {selectedThread && (
                  <>
                    <div className="flex-1 overflow-y-auto p-4 space-y-2 max-h-48">
                      {messages.map((m) => (
                        <div
                          key={m.id}
                          className={`flex ${m.sender_role === 'user' ? 'justify-end' : 'justify-start'}`}
                        >
                          <div
                            className={`max-w-[85%] rounded-lg border-2 border-black px-3 py-2 font-y2k text-sm font-bold ${
                              m.sender_role === 'user' ? 'bg-fuchsia-100 text-black' : 'bg-black/5 text-black'
                            }`}
                          >
                            {m.content}
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="p-3 border-t-2 border-black flex gap-2 bg-white">
                      <input
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        placeholder="Type a message..."
                        className="flex-1 rounded border-2 border-black px-3 py-2 font-y2k text-sm font-bold focus:outline-none focus:ring-2 focus:ring-[#FF00FF]"
                        onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSendReply()}
                      />
                      <button
                        onClick={handleSendReply}
                        disabled={!message.trim() || sending}
                        className="p-2 rounded border-2 border-black bg-black text-white hover:bg-[#FF00FF] hover:border-[#FF00FF] disabled:opacity-50 transition"
                      >
                        <FaPaperPlane className="h-4 w-4" />
                      </button>
                    </div>
                  </>
                )}
              </>
            )}
          </div>

          {error && (
            <div className="p-3 border-t-2 border-black bg-red-50 text-red-800 font-y2k text-sm font-bold">
              {error}
            </div>
          )}
        </div>
      )}
    </>
  )
}

export default SupportWidget
