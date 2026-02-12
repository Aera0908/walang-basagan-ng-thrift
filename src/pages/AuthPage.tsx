import { useState } from 'react'
import { FaEye, FaEyeSlash } from 'react-icons/fa6'
import minimalistLogo from '../assets/wbnt_minimalist.png'
import { useAuth } from '../context/AuthContext'
import { login, register, type User } from '../lib/api'

type Mode = 'login' | 'signup'

interface AuthPageProps {
  mode: Mode
  onBackHome?: () => void
  onSuccess?: (user: User) => void
  onSwitchMode?: (mode: Mode) => void
}

function AuthPage({ mode, onBackHome, onSuccess, onSwitchMode }: AuthPageProps) {
  const { setUser } = useAuth()
  const [email, setEmail] = useState('')
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  const isLogin = mode === 'login'

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      let user: User
      if (isLogin) {
        const res = await login(email, password)
        user = res.user
        setUser(user)
      } else {
        const res = await register(email, username, password)
        user = res.user
        setUser(user)
      }
      onSuccess?.(user) ?? onBackHome?.()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-pink-100 via-white to-pink-50 flex items-center justify-center px-4">
      <div className="w-full max-w-md rounded-3xl bg-white p-8 shadow-xl border border-pink-100">
        <div className="flex justify-center mb-4">
          <img
            src={minimalistLogo}
            alt="Walang Basagan ng Thrift"
            className="h-16 w-auto sm:h-20"
          />
        </div>
        <h1 className="text-2xl font-bold text-gray-900 text-center">
          {isLogin ? 'Log in to your account' : 'Create your account'}
        </h1>
        <p className="mt-2 text-center text-sm text-gray-500">
          {isLogin ? 'Sign in to continue' : 'Join the Y2K thrift community in a few steps.'}
        </p>

        {error && (
          <p className="mt-4 p-3 rounded-lg bg-red-50 text-red-600 text-sm">{error}</p>
        )}

        <form onSubmit={handleSubmit} className="mt-8 space-y-4">
          {!isLogin && (
            <div>
              <label className="block text-sm font-medium text-gray-700">Username</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="mt-1 w-full rounded-full border border-pink-200 px-4 py-2 text-sm focus:border-pink-400 focus:outline-none focus:ring-2 focus:ring-pink-200"
                placeholder="ex. thriftevryday"
                required
              />
            </div>
          )}
          <div>
            <label className="block text-sm font-medium text-gray-700">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 w-full rounded-full border border-pink-200 px-4 py-2 text-sm focus:border-pink-400 focus:outline-none focus:ring-2 focus:ring-pink-200"
              placeholder="you@example.com"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Password</label>
            <div className="relative mt-1">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-full border border-pink-200 px-4 py-2 pr-10 text-sm focus:border-pink-400 focus:outline-none focus:ring-2 focus:ring-pink-200"
                placeholder="••••••••"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword((s) => !s)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-pink-500 transition"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <FaEyeSlash className="h-4 w-4" /> : <FaEye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          {isLogin && (
            <div className="flex items-center justify-between text-xs text-gray-500">
              <label className="flex items-center gap-2">
                <input type="checkbox" className="rounded border-pink-200 text-pink-500" />
                <span>Remember me</span>
              </label>
              <button type="button" className="text-pink-500 hover:text-pink-400">
                Forgot password?
              </button>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="mt-2 w-full rounded-full bg-pink-500 py-2.5 text-sm font-semibold text-white shadow-md hover:bg-pink-400 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Please wait...' : isLogin ? 'Log in' : 'Sign up'}
          </button>
        </form>

        <p className="mt-6 text-center text-xs text-gray-500">
          {isLogin ? "Don't have an account? " : 'Already have an account? '}
          <button
            type="button"
            className="font-semibold text-pink-500 hover:text-pink-400 underline"
            onClick={() => onSwitchMode?.(isLogin ? 'signup' as Mode : 'login' as Mode)}
          >
            {isLogin ? 'Sign up here' : 'Log in instead'}
          </button>
        </p>

        <div className="mt-6 flex justify-center">
          <button
            type="button"
            onClick={onBackHome}
            className="text-xs text-gray-400 hover:text-pink-400 underline"
          >
            Back to home
          </button>
        </div>
      </div>
    </div>
  )
}

export default AuthPage
