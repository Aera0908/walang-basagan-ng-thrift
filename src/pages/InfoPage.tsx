import { useEffect } from 'react'
import { FaArrowLeft, FaStar, FaHeart, FaLightbulb, FaEnvelope, FaPhone, FaTruck, FaFileLines } from 'react-icons/fa6'

const ICON_MAP = {
  star: FaStar,
  heart: FaHeart,
  lightbulb: FaLightbulb,
  envelope: FaEnvelope,
  truck: FaTruck,
  file: FaFileLines,
} as const

interface InfoPageProps {
  title: string
  content: string
  icon?: keyof typeof ICON_MAP
  email?: string
  phone?: string
  onBack: () => void
}

function InfoPage({ title, content, icon, email, phone, onBack }: InfoPageProps) {
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [title])

  const IconComponent = icon ? ICON_MAP[icon] : null

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

        {/* Hero card with icon */}
        <div className="mb-8 rounded-lg border-4 border-black bg-white p-8 shadow-[8px_8px_0_rgba(0,0,0,0.3)]">
          <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-center sm:gap-6">
            {IconComponent && (
              <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-lg border-4 border-black bg-[#FF00FF]/20">
                <IconComponent className="h-10 w-10 text-[#E6007E]" aria-hidden />
              </div>
            )}
            <h1 className="font-y2k text-3xl font-black uppercase tracking-tight text-black sm:text-4xl">
              {title}
            </h1>
          </div>
        </div>

        {/* Contact info cards (email, phone) */}
        {(email || phone) && (
          <div className="mb-8 grid gap-4 sm:grid-cols-2">
            {email && (
              <a
                href={`mailto:${email}`}
                className="flex items-center gap-4 rounded-lg border-2 border-black bg-fuchsia-50/80 p-6 shadow-[4px_4px_0_rgba(0,0,0,0.2)] transition hover:bg-fuchsia-100 hover:shadow-[6px_6px_0_rgba(0,0,0,0.3)]"
              >
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-lg border-2 border-black bg-white">
                  <FaEnvelope className="h-7 w-7 text-[#E6007E]" />
                </div>
                <div className="min-w-0">
                  <p className="font-y2k text-xs font-bold uppercase tracking-wider text-black/70">Email</p>
                  <p className="font-y2k text-sm font-bold text-black break-all sm:text-base">{email}</p>
                </div>
              </a>
            )}
            {phone && (
              <a
                href={`tel:${phone.replace(/\s/g, '')}`}
                className="flex items-center gap-4 rounded-lg border-2 border-black bg-fuchsia-50/80 p-6 shadow-[4px_4px_0_rgba(0,0,0,0.2)] transition hover:bg-fuchsia-100 hover:shadow-[6px_6px_0_rgba(0,0,0,0.3)]"
              >
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-lg border-2 border-black bg-white">
                  <FaPhone className="h-7 w-7 text-[#E6007E]" />
                </div>
                <div className="min-w-0">
                  <p className="font-y2k text-xs font-bold uppercase tracking-wider text-black/70">Phone</p>
                  <p className="font-y2k text-sm font-bold text-black sm:text-base">{phone}</p>
                </div>
              </a>
            )}
          </div>
        )}

        {/* Content card */}
        <div className="rounded-lg border-2 border-black bg-white p-6 shadow-[4px_4px_0_rgba(0,0,0,0.2)] sm:p-8">
          <p className="font-y2k text-base font-bold text-black/80 leading-relaxed whitespace-pre-line">
            {content}
          </p>
        </div>
      </div>
    </div>
  )
}

export default InfoPage
