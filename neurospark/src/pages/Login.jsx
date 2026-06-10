import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Login() {
  const navigate = useNavigate()
  const { login } = useAuth()
  const [form, setForm] = useState({ email: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = () => {
    if (!form.email || !form.password) return setError('Please fill in all fields')
    setLoading(true)
    const result = login(form.email, form.password)
    setLoading(false)
    if (result.error) return setError(result.error)
    navigate('/dashboard')
  }

  return (
    <div className="page" style={{ background: '#fff', minHeight: '100vh' }}>
      <nav style={{ padding: '20px 32px', borderBottom: '1px solid #f0f0f0', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div className="logo" onClick={() => navigate('/')} style={{ cursor: 'pointer' }}>Neuro<span>Spark</span></div>
      </nav>

      <div style={{ maxWidth: '400px', margin: '64px auto', padding: '0 24px' }}>
        <h1 style={{ fontSize: '28px', fontWeight: '700', letterSpacing: '-0.5px', marginBottom: '8px' }}>Welcome back</h1>
        <p style={{ fontSize: '14px', color: '#737373', marginBottom: '32px' }}>Sign in to view your child's progress</p>

        <div className="input-group">
          <label className="input-label">Email address</label>
          <input
            className="input-field"
            type="email"
            placeholder="you@example.com"
            value={form.email}
            onChange={e => { setForm(p => ({ ...p, email: e.target.value })); setError('') }}
          />
        </div>

        <div className="input-group">
          <label className="input-label">Password</label>
          <input
            className="input-field"
            type="password"
            placeholder="Your password"
            value={form.password}
            onChange={e => { setForm(p => ({ ...p, password: e.target.value })); setError('') }}
          />
        </div>

        {error && (
          <div style={{ padding: '12px 14px', background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: '8px', fontSize: '13px', color: '#DC2626', marginBottom: '16px' }}>
            {error}
          </div>
        )}

        <button className="btn-primary" onClick={handleSubmit} disabled={loading} style={{ marginBottom: '16px' }}>
          {loading ? 'Signing in...' : 'Sign in'}
        </button>

        <p style={{ textAlign: 'center', fontSize: '13px', color: '#737373' }}>
          Don't have an account?{' '}
          <span
            onClick={() => navigate('/signup')}
            style={{ color: '#2563EB', fontWeight: '500', cursor: 'pointer' }}
          >
            Sign up free
          </span>
        </p>

        {/* Demo shortcut */}
        <div style={{ marginTop: '32px', padding: '16px', background: '#FAFAFA', border: '1px solid #F0F0F0', borderRadius: '10px', textAlign: 'center' }}>
          <p style={{ fontSize: '12px', color: '#737373', marginBottom: '8px' }}>Just here to explore?</p>
          <button className="btn-ghost" onClick={() => navigate('/profile')} style={{ margin: '0 auto' }}>
            Continue without account →
          </button>
        </div>
      </div>
    </div>
  )
}