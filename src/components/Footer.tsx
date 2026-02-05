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

function Footer() {
  const socialItems = socials as Social[]
  const groups = footerLinks as FooterGroup[]

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
                <a key={item.id} href={item.url} className="hover:text-pink-400" aria-label={item.label}>
                  <Icon className="h-5 w-5" />
                </a>
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
    </footer>
  )
}

export default Footer

