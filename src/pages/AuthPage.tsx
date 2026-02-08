import minimalistLogo from '../assets/wbnt_minimalist.png'

type Mode = 'login' | 'signup'

interface AuthPageProps {
  mode: Mode
  onBackHome?: () => void
  onSwitchMode?: (mode: Mode) => void
}

function AuthPage({ mode, onBackHome, onSwitchMode }: AuthPageProps) {
  const isLogin = mode === 'login'

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
          {isLogin ? 'Welcome back, thrift queen!' : 'Join the Y2K thrift fam in a few steps.'}
        </p>

        <form className="mt-8 space-y-4">
          {!isLogin && (
            <div>
              <label className="block text-sm font-medium text-gray-700">Username</label>
              <input
                type="text"
                className="mt-1 w-full rounded-full border border-pink-200 px-4 py-2 text-sm focus:border-pink-400 focus:outline-none focus:ring-2 focus:ring-pink-200"
                placeholder="ex. thriftbabe24"
              />
            </div>
          )}
          <div>
            <label className="block text-sm font-medium text-gray-700">Email</label>
            <input
              type="email"
              className="mt-1 w-full rounded-full border border-pink-200 px-4 py-2 text-sm focus:border-pink-400 focus:outline-none focus:ring-2 focus:ring-pink-200"
              placeholder="you@example.com"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Password</label>
            <input
              type="password"
              className="mt-1 w-full rounded-full border border-pink-200 px-4 py-2 text-sm focus:border-pink-400 focus:outline-none focus:ring-2 focus:ring-pink-200"
              placeholder="••••••••"
            />
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
            className="mt-2 w-full rounded-full bg-pink-500 py-2.5 text-sm font-semibold text-white shadow-md hover:bg-pink-400 transition"
          >
            {isLogin ? 'Log in' : 'Sign up'}
          </button>
        </form>

        <p className="mt-6 text-center text-xs text-gray-500">
          {isLogin ? "Don't have an account? " : 'Already part of the fam? '}
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

