import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route, Navigate, useNavigate } from 'react-router-dom'
import './index.css'
import App from './App.tsx'
import AuthPage from './pages/AuthPage.tsx'
import AdminDashboard from './pages/AdminDashboard.tsx'
import SupportPage from './pages/SupportPage.tsx'
import { AuthProvider, useAuth } from './context/AuthContext.tsx'

function AdminRoute() {
  const { user } = useAuth()
  const navigate = useNavigate()
  if (!user || (user.role !== 'admin' && user.role !== 'mod')) {
    return <Navigate to="/" replace />
  }
  return <AdminDashboard onBack={() => navigate('/')} />
}

function AuthLoginRoute() {
  const navigate = useNavigate()
  return (
    <AuthPage
      mode="login"
      onBackHome={() => navigate('/')}
      onSuccess={(user) => navigate(user.role === 'admin' || user.role === 'mod' ? '/admin/products' : '/')}
      onSwitchMode={(next) => navigate(next === 'login' ? '/login' : '/signup')}
    />
  )
}

function AuthSignupRoute() {
  const navigate = useNavigate()
  return (
    <AuthPage
      mode="signup"
      onBackHome={() => navigate('/')}
      onSuccess={(user) => navigate(user.role === 'admin' || user.role === 'mod' ? '/admin/products' : '/')}
      onSwitchMode={(next) => navigate(next === 'login' ? '/login' : '/signup')}
    />
  )
}

function SupportRoute() {
  const navigate = useNavigate()
  return <SupportPage onBack={() => navigate('/')} />
}

function Root() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/admin/*" element={<AdminRoute />} />
        <Route path="/login" element={<AuthLoginRoute />} />
        <Route path="/signup" element={<AuthSignupRoute />} />
        <Route path="/support" element={<SupportRoute />} />
        <Route path="/*" element={<App />} />
      </Routes>
    </AuthProvider>
  )
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <Root />
    </BrowserRouter>
  </StrictMode>,
)
