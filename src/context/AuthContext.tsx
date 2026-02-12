import { createContext, useContext, useState, type ReactNode } from 'react'
import type { User } from '../lib/api'

const STORAGE_KEY = 'wbnt_user'

interface AuthContextValue {
  user: User | null
  setUser: (user: User | null) => void
  logout: () => void
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUserState] = useState<User | null>(() => {
    try {
      const s = localStorage.getItem(STORAGE_KEY)
      return s ? JSON.parse(s) : null
    } catch {
      return null
    }
  })

  const setUser = (u: User | null) => {
    if (u) localStorage.setItem(STORAGE_KEY, JSON.stringify(u))
    else localStorage.removeItem(STORAGE_KEY)
    setUserState(u)
  }

  const logout = () => setUser(null)

  return (
    <AuthContext.Provider value={{ user, setUser, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
