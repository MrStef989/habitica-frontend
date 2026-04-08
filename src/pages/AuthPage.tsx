import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../store/auth.store'
import { authApi } from '../lib/api'
import './AuthPage.css'

export function AuthPage() {
  const [mode, setMode]       = useState<'login' | 'register'>('login')
  const [email, setEmail]     = useState('')
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError]     = useState('')
  const [loading, setLoading] = useState(false)

  const setAuth  = useAuthStore((s) => s.setAuth)
  const navigate = useNavigate()

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const data = mode === 'register'
        ? await authApi.register({ email, username, password })
        : await authApi.login({ email, password })
      setAuth(data.user, data.accessToken, data.refreshToken)
      navigate('/tasks')
    } catch (err: any) {
      setError(err.response?.data?.message ?? 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-page">
      {/* Decorative background runes */}
      <div className="auth-bg" aria-hidden>
        {['⚔', '◈', '♦', '★', '▲', '◉'].map((r, i) => (
          <span key={i} className="auth-rune" style={{ '--i': i } as React.CSSProperties}>{r}</span>
        ))}
      </div>

      <div className="auth-card card fade-up">
        <div className="auth-header">
          <span className="auth-brand-icon">⚔</span>
          <h1 className="auth-title">QuestLog</h1>
          <p className="auth-subtitle">Turn your life into an adventure</p>
        </div>

        <div className="auth-tabs">
          <button
            className={`auth-tab ${mode === 'login' ? 'active' : ''}`}
            onClick={() => setMode('login')}
          >Login</button>
          <button
            className={`auth-tab ${mode === 'register' ? 'active' : ''}`}
            onClick={() => setMode('register')}
          >Register</button>
        </div>

        <form className="auth-form" onSubmit={submit}>
          <div className="field">
            <label>Email</label>
            <input
              type="email" required
              value={email} onChange={(e) => setEmail(e.target.value)}
              placeholder="hero@realm.com"
            />
          </div>

          {mode === 'register' && (
            <div className="field">
              <label>Hero Name</label>
              <input
                type="text" required minLength={3} maxLength={30}
                value={username} onChange={(e) => setUsername(e.target.value)}
                placeholder="DragonSlayer99"
              />
            </div>
          )}

          <div className="field">
            <label>Password</label>
            <input
              type="password" required minLength={8}
              value={password} onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
            />
          </div>

          {error && <p className="error-text">{error}</p>}

          <button type="submit" className="btn btn-gold auth-submit" disabled={loading}>
            {loading ? '...' : mode === 'login' ? '→ Enter the realm' : '→ Begin your quest'}
          </button>
        </form>
      </div>
    </div>
  )
}
