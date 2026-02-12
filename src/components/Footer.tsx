import { useState } from 'react'
import { FaInstagram, FaFacebookF, FaTiktok } from 'react-icons/fa6'
import logo from '../assets/wbnt_minimalist.png'
import socials from '../data/socials.json'
import footerLinks from '../data/footerLinks.json'

type SocialId = 'instagram' | 'facebook' | 'tiktok'

interface Social {
  id: SocialId
  label: string
  url: string
}

interface FooterGroup {
  title: string
  items: { label: string; url: string }[]
}

const socialIconMap: Record<SocialId, React.ComponentType<{ className?: string; 'aria-label'?: string }>> = {
  instagram: FaInstagram,
  facebook: FaFacebookF,
  tiktok: FaTiktok,
}

const socialImageMap: Record<SocialId, string> = {
  facebook: '/socials/facebook-placeholder.svg',
  instagram: '/socials/instagram-placeholder.svg',
  tiktok: '/socials/tiktok-placeholder.svg',
}

function Footer() {
  const socialItems = socials as Social[]
  const groups = footerLinks as FooterGroup[]
  const [socialModal, setSocialModal] = useState<SocialId | null>(null)

  return (
    <footer className="bg-gray-900 py-12 text-gray-300">
      <div className="mx-auto grid max-w-6xl gap-10 px-6 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <img
            src={logo}
            alt="Walang Basagan ng Thrift"
            className="h-[4.5rem] w-auto"
          />
          <div className="mt-4 flex gap-4 text-lg items-center">
            {socialItems.map((item) => {
              const Icon = socialIconMap[item.id]
              return (
                <button
                  key={item.id}
                  onClick={() => setSocialModal(item.id)}
                  className="hover:text-pink-400 transition"
                  aria-label={item.label}
                >
                  <Icon className="h-5 w-5" />
                </button>
              )
            })}
          </div>
        </div>
        {groups.map((group) => (
          <div key={group.title}>
            <p className="font-semibold text-white">{group.title}</p>
            <ul className="mt-3 space-y-2 text-sm">
              {group.items.map((link) => (
                <li key={link.label}>
                  <a href={link.url} className="hover:text-pink-400">
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <p className="mt-10 text-center text-xs text-gray-500">
        2026 Walang Basagan ng Thrift. All rights reserved.
      </p>

      {socialModal && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 p-4"
          onClick={() => setSocialModal(null)}
        >
          <div
            className="relative max-h-[90vh] max-w-lg rounded-xl overflow-hidden bg-white shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={socialImageMap[socialModal]}
              alt={`${socialModal} profile`}
              className="w-full h-auto object-contain"
            />
            <button
              onClick={() => setSocialModal(null)}
              className="absolute top-4 right-4 rounded-full bg-black/50 p-2 text-white hover:bg-black/70 transition"
              aria-label="Close"
            >
              ✕
            </button>
          </div>
        </div>
      )}
    </footer>
  )
}

export default Footer

