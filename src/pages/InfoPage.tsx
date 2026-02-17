import { useEffect } from 'react'
import { FaArrowLeft } from 'react-icons/fa6'

interface InfoPageProps {
  title: string
  content: string
  onBack: () => void
}

function InfoPage({ title, content, onBack }: InfoPageProps) {
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [title])

  return (
    <div className="min-h-screen border-t-4 border-black bg-gradient-to-b from-fuchsia-50/50 via-white to-fuchsia-50/50 pt-28 pb-16">
      <div className="mx-auto max-w-3xl px-6">
        <button
          onClick={onBack}
          className="mb-6 flex items-center gap-2 font-y2k text-sm font-bold text-black hover:text-[#FF00FF] transition"
        >
          <FaArrowLeft className="h-4 w-4" />
          Back
        </button>
        <h1 className="font-y2k text-3xl font-black uppercase tracking-tight text-black mb-6">{title}</h1>
        <div className="prose prose-gray max-w-none">
          <p className="font-y2k text-base font-bold text-black/80 leading-relaxed whitespace-pre-line">{content}</p>
        </div>
      </div>
    </div>
  )
}

export default InfoPage
