import { useState, useEffect } from 'react'
import { FaArrowLeft, FaPlus, FaPaperPlane } from 'react-icons/fa6'
import { useAuth } from '../context/AuthContext'
import {
  fetchSupportThreads,
  createSupportThread,
  fetchThreadMessages,
  sendSupportMessage,
  type SupportThread,
  type SupportMessage,
} from '../lib/api'

function SupportPage({ onBack }: { onBack: () => void }) {
  const { user } = useAuth()
  const [threads, setThreads] = useState<SupportThread[]>([])
  const [selectedThread, setSelectedThread] = useState<SupportThread | null>(null)
  const [messages, setMessages] = useState<SupportMessage[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showNewForm, setShowNewForm] = useState(false)
  const [newSubject, setNewSubject] = useState('')
  const [newMessage, setNewMessage] = useState('')
  const [replyContent, setReplyContent] = useState('')

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
    loadThreads()
  }, [user?.id])

  const loadThread = async (thread: SupportThread) => {
    if (!user?.id) return
    setSelectedThread(thread)
    setReplyContent('')
    setError('')
    try {
      const { messages: m } = await fetchThreadMessages(user.id, thread.id)
      setMessages(m)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load messages')
    }
  }

  const handleCreateThread = async () => {
    if (!user?.id || !newSubject.trim() || !newMessage.trim()) return
    setError('')
    try {
      const { thread } = await createSupportThread(user.id, newSubject.trim())
      await sendSupportMessage(user.id, thread.id, newMessage.trim())
      setNewSubject('')
      setNewMessage('')
      setShowNewForm(false)
      loadThreads()
      loadThread(thread)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create thread')
    }
  }

  const handleSendReply = async () => {
    if (!user?.id || !selectedThread || !replyContent.trim()) return
    setError('')
    try {
      const { messages: m } = await sendSupportMessage(user.id, selectedThread.id, replyContent.trim())
      setMessages(m)
      setReplyContent('')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send message')
    }
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center border-t-4 border-black bg-fuchsia-50/50">
        <div className="text-center p-8 rounded-lg border-4 border-black bg-white shadow-[8px_8px_0_rgba(0,0,0,0.3)]">
          <p className="font-y2k font-bold text-black">Please log in to contact support.</p>
          <button onClick={onBack} className="mt-4 font-y2k font-bold text-[#E6007E] underline hover:text-[#FF00FF]">
            Back
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen border-t-4 border-black bg-gradient-to-b from-fuchsia-50/50 via-white to-fuchsia-50/50 pt-28 pb-12">
      <div className="mx-auto max-w-4xl px-6">
        <div className="flex items-center gap-4 mb-6">
          <button
            onClick={onBack}
            className="flex items-center gap-2 font-y2k font-bold text-black hover:text-[#FF00FF] transition"
          >
            <FaArrowLeft className="h-4 w-4" />
            Back
          </button>
          <h1 className="font-y2k text-2xl font-black uppercase tracking-tight text-black">Contact Support</h1>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-lg border-2 border-black bg-red-50 text-red-800 font-y2k text-sm font-bold shadow-[4px_4px_0_rgba(0,0,0,0.2)]">
            {error}
          </div>
        )}

        <div className="rounded-lg border-4 border-black bg-white overflow-hidden shadow-[8px_8px_0_rgba(0,0,0,0.3)]">
          <div className="flex">
            <div className="w-80 border-r-2 border-black flex flex-col">
              <div className="p-4 border-b-2 border-black bg-fuchsia-50/50 flex items-center justify-between">
                <span className="font-y2k font-bold text-black">My threads</span>
                <button
                  onClick={() => setShowNewForm(true)}
                  className="flex items-center gap-1 font-y2k text-sm font-bold text-[#E6007E] hover:text-[#FF00FF]"
                >
                  <FaPlus className="h-3 w-3" />
                  New
                </button>
              </div>
              <div className="overflow-y-auto max-h-[400px]">
                {loading ? (
                  <div className="p-4 text-center font-y2k text-sm font-bold text-black">Loading...</div>
                ) : threads.length === 0 && !showNewForm ? (
                  <div className="p-4 text-center font-y2k text-sm font-bold text-black/70">No threads yet</div>
                ) : (
                  threads.map((t) => (
                    <button
                      key={t.id}
                      onClick={() => loadThread(t)}
                      className={`w-full text-left px-4 py-3 border-b border-black/10 hover:bg-fuchsia-50/50 font-y2k transition ${
                        selectedThread?.id === t.id ? 'bg-fuchsia-100 border-l-4 border-l-black' : 'font-bold'
                      }`}
                    >
                      <p className="font-bold text-black truncate">{t.subject}</p>
                      <p className="text-xs font-bold text-black/60 mt-0.5">
                        {t.created_at ? new Date(t.created_at).toLocaleDateString() : ''}
                      </p>
                    </button>
                  ))
                )}
              </div>
            </div>
            <div className="flex-1 flex flex-col min-w-0">
              {showNewForm ? (
                <div className="p-6">
                  <h3 className="font-y2k font-bold text-black mb-4">New support request</h3>
                  <div className="space-y-4">
                    <input
                      value={newSubject}
                      onChange={(e) => setNewSubject(e.target.value)}
                      placeholder="Subject"
                      className="w-full rounded border-2 border-black px-4 py-2 font-y2k text-sm font-bold focus:outline-none focus:ring-2 focus:ring-[#FF00FF]"
                    />
                    <textarea
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      placeholder="Your message..."
                      className="w-full rounded border-2 border-black px-4 py-2 font-y2k text-sm font-bold focus:outline-none focus:ring-2 focus:ring-[#FF00FF]"
                      rows={4}
                    />
                    <div className="flex gap-2">
                      <button
                        onClick={handleCreateThread}
                        disabled={!newSubject.trim() || !newMessage.trim()}
                        className="flex items-center gap-2 px-4 py-2 rounded border-2 border-black bg-black text-white font-y2k font-bold hover:bg-[#FF00FF] hover:border-[#FF00FF] disabled:opacity-50 transition"
                      >
                        <FaPaperPlane className="h-4 w-4" />
                        Send
                      </button>
                      <button
                        onClick={() => {
                          setShowNewForm(false)
                          setNewSubject('')
                          setNewMessage('')
                        }}
                        className="px-4 py-2 rounded border-2 border-black font-y2k font-bold hover:bg-black/5 transition"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                </div>
              ) : selectedThread ? (
                <>
                  <div className="p-4 border-b-2 border-black bg-fuchsia-50/50">
                    <h3 className="font-y2k font-bold text-black">{selectedThread.subject}</h3>
                  </div>
                  <div className="flex-1 overflow-y-auto p-4 space-y-4 max-h-[280px]">
                    {messages.map((m) => (
                      <div
                        key={m.id}
                        className={`flex ${m.sender_role === 'user' ? 'justify-end' : 'justify-start'}`}
                      >
                        <div
                          className={`max-w-[80%] rounded-lg border-2 border-black px-4 py-2 ${
                            m.sender_role === 'user' ? 'bg-fuchsia-100 text-black' : 'bg-black/5 text-black'
                          }`}
                        >
                          <p className="font-y2k text-sm font-bold">{m.content}</p>
                          <p className="text-xs font-bold text-black/60 mt-1">
                            {m.sender_role === 'user' ? 'You' : 'Support'} • {new Date(m.created_at).toLocaleString()}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="p-4 border-t-2 border-black">
                    <div className="flex gap-2">
                      <textarea
                        value={replyContent}
                        onChange={(e) => setReplyContent(e.target.value)}
                        placeholder="Type your reply..."
                        className="flex-1 rounded border-2 border-black px-4 py-2 font-y2k text-sm font-bold focus:outline-none focus:ring-2 focus:ring-[#FF00FF]"
                        rows={2}
                      />
                      <button
                        onClick={handleSendReply}
                        disabled={!replyContent.trim()}
                        className="px-4 py-2 rounded border-2 border-black bg-black text-white font-y2k font-bold hover:bg-[#FF00FF] hover:border-[#FF00FF] disabled:opacity-50 transition"
                      >
                        Send
                      </button>
                    </div>
                  </div>
                </>
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center font-y2k font-bold text-black/70 p-8">
                  {threads.length === 0 ? (
                    <>
                      <p className="mb-4">Start a conversation with our support team</p>
                      <button
                        onClick={() => setShowNewForm(true)}
                        className="flex items-center gap-2 px-4 py-2 rounded border-2 border-black bg-black text-white font-bold hover:bg-[#FF00FF] hover:border-[#FF00FF] transition"
                      >
                        <FaPlus className="h-4 w-4" />
                        New support request
                      </button>
                    </>
                  ) : (
                    <p>Select a thread or create a new one</p>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default SupportPage
