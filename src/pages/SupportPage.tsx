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
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center p-8 bg-white rounded-2xl shadow">
          <p className="text-gray-600">Please log in to contact support.</p>
          <button onClick={onBack} className="mt-4 text-pink-500 underline">
            Back
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-12 pb-12">
      <div className="mx-auto max-w-4xl px-6">
        <div className="flex items-center gap-4 mb-6">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
          >
            <FaArrowLeft className="h-4 w-4" />
            Back
          </button>
          <h1 className="text-2xl font-bold text-gray-900">Contact Support</h1>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
            {error}
          </div>
        )}

        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="flex">
            <div className="w-80 border-r border-gray-200 flex flex-col">
              <div className="p-4 border-b border-gray-200 flex items-center justify-between">
                <span className="font-medium text-gray-700">My threads</span>
                <button
                  onClick={() => setShowNewForm(true)}
                  className="flex items-center gap-1 text-sm text-pink-600 hover:text-pink-700 font-medium"
                >
                  <FaPlus className="h-3 w-3" />
                  New
                </button>
              </div>
              <div className="overflow-y-auto max-h-[400px]">
                {loading ? (
                  <div className="p-4 text-center text-gray-500 text-sm">Loading...</div>
                ) : threads.length === 0 && !showNewForm ? (
                  <div className="p-4 text-center text-gray-500 text-sm">No threads yet</div>
                ) : (
                  threads.map((t) => (
                    <button
                      key={t.id}
                      onClick={() => loadThread(t)}
                      className={`w-full text-left px-4 py-3 border-b border-gray-100 hover:bg-gray-50 transition ${
                        selectedThread?.id === t.id ? 'bg-pink-50 border-l-2 border-l-pink-500' : ''
                      }`}
                    >
                      <p className="font-medium text-gray-900 truncate">{t.subject}</p>
                      <p className="text-xs text-gray-500 mt-0.5">
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
                  <h3 className="font-semibold text-gray-900 mb-4">New support request</h3>
                  <div className="space-y-4">
                    <input
                      value={newSubject}
                      onChange={(e) => setNewSubject(e.target.value)}
                      placeholder="Subject"
                      className="w-full rounded-lg border border-gray-200 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-pink-200"
                    />
                    <textarea
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      placeholder="Your message..."
                      className="w-full rounded-lg border border-gray-200 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-pink-200"
                      rows={4}
                    />
                    <div className="flex gap-2">
                      <button
                        onClick={handleCreateThread}
                        disabled={!newSubject.trim() || !newMessage.trim()}
                        className="flex items-center gap-2 px-4 py-2 rounded-lg bg-pink-500 text-white font-medium hover:bg-pink-600 disabled:opacity-50"
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
                        className="px-4 py-2 rounded-lg border border-gray-200 hover:bg-gray-50"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                </div>
              ) : selectedThread ? (
                <>
                  <div className="p-4 border-b border-gray-200 bg-gray-50">
                    <h3 className="font-semibold text-gray-900">{selectedThread.subject}</h3>
                  </div>
                  <div className="flex-1 overflow-y-auto p-4 space-y-4 max-h-[280px]">
                    {messages.map((m) => (
                      <div
                        key={m.id}
                        className={`flex ${m.sender_role === 'user' ? 'justify-end' : 'justify-start'}`}
                      >
                        <div
                          className={`max-w-[80%] rounded-lg px-4 py-2 ${
                            m.sender_role === 'user' ? 'bg-pink-100 text-pink-900' : 'bg-gray-100 text-gray-900'
                          }`}
                        >
                          <p className="text-sm">{m.content}</p>
                          <p className="text-xs text-gray-500 mt-1">
                            {m.sender_role === 'user' ? 'You' : 'Support'} • {new Date(m.created_at).toLocaleString()}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="p-4 border-t border-gray-200">
                    <div className="flex gap-2">
                      <textarea
                        value={replyContent}
                        onChange={(e) => setReplyContent(e.target.value)}
                        placeholder="Type your reply..."
                        className="flex-1 rounded-lg border border-gray-200 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-pink-200"
                        rows={2}
                      />
                      <button
                        onClick={handleSendReply}
                        disabled={!replyContent.trim()}
                        className="px-4 py-2 rounded-lg bg-pink-500 text-white font-medium hover:bg-pink-600 disabled:opacity-50"
                      >
                        Send
                      </button>
                    </div>
                  </div>
                </>
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center text-gray-500 p-8">
                  {threads.length === 0 ? (
                    <>
                      <p className="mb-4">Start a conversation with our support team</p>
                      <button
                        onClick={() => setShowNewForm(true)}
                        className="flex items-center gap-2 px-4 py-2 rounded-lg bg-pink-500 text-white font-medium hover:bg-pink-600"
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
