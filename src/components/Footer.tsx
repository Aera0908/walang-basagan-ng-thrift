import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { FaInstagram, FaFacebookF, FaTiktok, FaXTwitter } from 'react-icons/fa6'
import logo from '../assets/wbnt_minimalist.png'
import socials from '../data/socials.json'
import { INFO_PAGES, type InfoPageSlug } from '../data/infoPages'
import * as api from '../lib/api'
import type { FooterSocials } from '../lib/api'

type SocialId = 'instagram' | 'facebook' | 'tiktok' | 'x'

interface Social {
  id: SocialId
  label: string
  url: string
}

const PRODUCT_LINKS = [
  { label: 'All Y2K clothing', category: '' },
  { label: 'Tops', category: 'Top' },
  { label: 'Bottoms', category: 'Bottom' },
  { label: 'Accessories', category: 'Accessories' },
] as const

const INFO_LINKS: { label: string; slug: InfoPageSlug }[] = [
  { label: 'Reviews', slug: 'reviews' },
  { label: 'About Us', slug: 'about-us' },
  { label: 'The concept', slug: 'the-concept' },
  { label: 'Contact', slug: 'contact' },
  { label: 'Delivery and Returns', slug: 'delivery-returns' },
  { label: 'Terms of sale', slug: 'terms-of-sale' },
]

const socialIconMap: Record<SocialId, React.ComponentType<{ className?: string; 'aria-label'?: string }>> = {
  instagram: FaInstagram,
  facebook: FaFacebookF,
  tiktok: FaTiktok,
  x: FaXTwitter,
}

const PLACEHOLDER_IMAGES: Record<SocialId, string> = {
  facebook: '/socials/facebook-placeholder.svg',
  instagram: '/socials/instagram-placeholder.svg',
  tiktok: '/socials/tiktok-placeholder.svg',
  x: '/socials/x-placeholder.svg',
}

interface FooterProps {
  footerSocials?: FooterSocials
  onProductsClick?: (category?: string) => void
}

function Footer({ footerSocials, onProductsClick }: FooterProps) {
  const socialItems = socials as Social[]
  const navigate = useNavigate()
  const [socialModal, setSocialModal] = useState<SocialId | null>(null)

  const handleProductsClick = (category?: string) => {
    if (onProductsClick) {
      onProductsClick(category)
    } else {
      navigate(category ? `/products?category=${encodeURIComponent(category)}` : '/products')
    }
  }

  return (
    <footer className="border-t-4 border-black bg-black py-12 text-gray-300">
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
                  className="hover:text-[#FF00FF] transition"
                  aria-label={item.label}
                >
                  <Icon className="h-5 w-5" />
                </button>
              )
            })}
          </div>
        </div>
        <div>
          <p className="font-semibold text-white">Y2K Thrift Store</p>
          <ul className="mt-3 space-y-2 text-sm">
            {PRODUCT_LINKS.map((link) => (
              <li key={link.label}>
                <button
                  onClick={() => handleProductsClick(link.category || undefined)}
                  className="hover:text-[#FF00FF] transition text-left"
                >
                  {link.label}
                </button>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <p className="font-semibold text-white">Information</p>
          <ul className="mt-3 space-y-2 text-sm">
            {INFO_LINKS.map((link) => (
              <li key={link.slug}>
                <Link to={`/info/${link.slug}`} className="hover:text-[#FF00FF] transition">
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
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
              src={
                (footerSocials?.[socialModal] as { image?: string })?.image
                  ? api.getImageUrl((footerSocials[socialModal] as { image?: string }).image)
                  : PLACEHOLDER_IMAGES[socialModal]
              }
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

