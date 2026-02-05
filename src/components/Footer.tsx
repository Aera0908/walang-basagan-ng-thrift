import { FaInstagram, FaFacebookF, FaTiktok } from 'react-icons/fa6'

function Footer() {
  return (
    <footer className="bg-gray-900 py-12 text-gray-300">
      <div className="mx-auto grid max-w-6xl gap-10 px-6 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <p className="font-brand text-xl text-pink-400">Walang Basagan ng Thrift</p>
          <div className="mt-4 flex gap-4 text-lg items-center">
            <a href="#" className="hover:text-pink-400">
              <FaInstagram className="h-5 w-5" aria-label="Instagram" />
            </a>
            <a href="#" className="hover:text-pink-400">
              <FaFacebookF className="h-5 w-5" aria-label="Facebook" />
            </a>
            <a href="#" className="hover:text-pink-400">
              <FaTiktok className="h-5 w-5" aria-label="TikTok" />
            </a>
          </div>
        </div>
        <div>
          <p className="font-semibold text-white">Y2K Thrift Store</p>
          <ul className="mt-3 space-y-2 text-sm">
            <li><a href="#" className="hover:text-pink-400">All Y2K clothing</a></li>
            <li><a href="#" className="hover:text-pink-400">Tops</a></li>
            <li><a href="#" className="hover:text-pink-400">Bottoms</a></li>
            <li><a href="#" className="hover:text-pink-400">Sets</a></li>
          </ul>
        </div>
        <div>
          <p className="font-semibold text-white">Upcycling</p>
          <ul className="mt-3 space-y-2 text-sm">
            <li><a href="#" className="hover:text-pink-400">All Upcycled creations</a></li>
            <li><a href="#" className="hover:text-pink-400">Unique upcycled sets</a></li>
            <li><a href="#" className="hover:text-pink-400">Accessories</a></li>
          </ul>
        </div>
        <div>
          <p className="font-semibold text-white">Information</p>
          <ul className="mt-3 space-y-2 text-sm">
            <li><a href="#" className="hover:text-pink-400">Reviews</a></li>
            <li><a href="#" className="hover:text-pink-400">The concept</a></li>
            <li><a href="#" className="hover:text-pink-400">Contact</a></li>
            <li><a href="#" className="hover:text-pink-400">Delivery and Returns</a></li>
            <li><a href="#" className="hover:text-pink-400">Terms of sale</a></li>
          </ul>
        </div>
      </div>
      <p className="mt-10 text-center text-xs text-gray-500">
        2026 Walang Basagan ng Thrift. All rights reserved.
      </p>
    </footer>
  )
}

export default Footer

