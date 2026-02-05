import { StrictMode, useState } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import AuthPage from './pages/AuthPage.tsx'

type View = 'home' | 'login' | 'signup'

function Root() {
  const [view, setView] = useState<View>('home')

  if (view === 'login') {
    return (
      <AuthPage
        mode="login"
        onBackHome={() => setView('home')}
        onSwitchMode={(next) => setView(next)}
      />
    )
  }

  if (view === 'signup') {
    return (
      <AuthPage
        mode="signup"
        onBackHome={() => setView('home')}
        onSwitchMode={(next) => setView(next)}
      />
    )
  }

  return <App onLogin={() => setView('login')} onSignup={() => setView('signup')} />
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Root />
  </StrictMode>,
)
