import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Signup() {
  const navigate = useNavigate()
  const { signup } = useAuth()
  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '', confirm: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = () => {
    if (!form.name || !form.email || !form.password) return setError('Please fill in all required fields')
    if (form.password !== form.confirm) return setError('Passwords do not match')
    if (form.password.length < 6) return setError('Password must be at least 6 characters')
    setLoading(true)
    const result = signup(form.name, form.email, form.password, form.phone)
    setLoading(false)
    if (result.error) return setError(result.error)
    navigate('/dashboard')
  }

  return (
    <div className="page" style={{ background: '#fff', minHeight: '100vh' }}>
      <nav style={{ padding: '20px 32px', borderBottom: '1px solid #f0f0f0', display: 'flex', alignItems: 'center' }}>
        <div className="logo" onClick={() => navigate('/')} style={{ cursor: 'pointer' }}>Neuro<span>Spark</span></div>
      </nav>

      <div style={{ maxWidth: '400px', margin: '48px auto', padding: '0 24px' }}>
        <h1 style={{ fontSize: '28px', fontWeight: '700', letterSpacing: '-0.5px', marginBottom: '8px' }}>Create your account</h1>
        <p style={{ fontSize: '14px', color: '#737373', marginBottom: '32px' }}>Free forever. No credit card needed.</p>

        <div className="input-group">
          <label className="input-label">Your name</label>
          <input className="input-field" placeholder="e.g. Priya Sharma" value={form.name} onChange={e => { setForm(p => ({ ...p, name: e.target.value })); setError('') }} />
        </div>

        <div className="input-group">
          <label className="input-label">Email address</label>
          <input className="input-field" type="email" placeholder="you@example.com" value={form.email} onChange={e => { setForm(p => ({ ...p, email: e.target.value })); setError('') }} />
        </div>

        <div className="input-group">
          <label className="input-label">Phone number <span style={{ color: '#A3A3A3', fontWeight: '400' }}>(optional)</span></label>
          <input className="input-field" type="tel" placeholder="+91 98765 43210" value={form.phone} onChange={e => setForm(p => ({ ...p, phone: e.target.value }))} />
        </div>

        <div className="input-group">
          <label className="input-label">Password</label>
          <input className="input-field" type="password" placeholder="Min. 6 characters" value={form.password} onChange={e => { setForm(p => ({ ...p, password: e.target.value })); setError('') }} />
        </div>

        <div className="input-group">
          <label className="input-label">Confirm password</label>
          <input className="input-field" type="password" placeholder="Repeat your password" value={form.confirm} onChange={e => { setForm(p => ({ ...p, confirm: e.target.value })); setError('') }} />
        </div>

        {error && (
          <div style={{ padding: '12px 14px', background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: '8px', fontSize: '13px', color: '#DC2626', marginBottom: '16px' }}>
            {error}
          </div>
        )}

        <button className="btn-primary" onClick={handleSubmit} disabled={loading} style={{ marginBottom: '16px' }}>
          {loading ? 'Creating account...' : 'Create account'}
        </button>

        <p style={{ textAlign: 'center', fontSize: '13px', color: '#737373' }}>
          Already have an account?{' '}
          <span onClick={() => navigate('/login')} style={{ color: '#2563EB', fontWeight: '500', cursor: 'pointer' }}>
            Sign in
          </span>
        </p>
      </div>
    </div>
  )
}