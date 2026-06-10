import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, ArrowRight, User } from 'lucide-react'
import { useApp } from '../context/AppContext'

const LANGUAGES = [
  'English', 'Hindi', 'Kannada', 'Tamil',
  'Telugu', 'Marathi', 'Bengali', 'Gujarati',
  'Punjabi', 'Malayalam', 'Odia', 'Assamese'
]

export default function Profile() {
  const navigate = useNavigate()
  const { setChild, setAppLanguage, loadDemoChild, t } = useApp()

  const [form, setForm] = useState({
    name: '', dob: '', gender: '', language: 'English'
  })
  const [error, setError] = useState('')

  const handleChange = (field, value) => {
    setForm(prev => ({ ...prev, [field]: value }))
    if (field === 'language') setAppLanguage(value)
    setError('')
  }

  const getAge = (dob) => {
    if (!dob) return null
    const diff = Date.now() - new Date(dob).getTime()
    return Math.floor(diff / (1000 * 60 * 60 * 24 * 365.25))
  }

  const handleSubmit = () => {
    if (!form.name.trim()) return setError('Please enter the child\'s name')
    if (!form.dob) return setError('Please enter date of birth')
    const age = getAge(form.dob)
    if (age < 3 || age > 16) return setError('NeuroSpark is designed for children aged 3–16')
    if (!form.gender) return setError('Please select gender')

    setChild({ ...form, age })
    navigate('/tasks/gaze')
  }

  const handleDemo = () => {
    loadDemoChild()
    navigate('/scores')
  }

  const age = getAge(form.dob)

  return (
    <div className="page">

      {/* Header */}
      <div className="page-header">
        <button className="btn-ghost" onClick={() => navigate('/')}>
          <ArrowLeft size={16} />
          {t('Back')}
        </button>
        <div style={{ flex: 1 }} />
        <div className="logo">Neuro<span>Spark</span></div>
      </div>

      <div className="page-content">

        {/* Progress */}
        <div style={{
          display: 'flex', gap: '6px', marginBottom: '32px'
        }}>
          {[t('Profile'), t('Gaze'), t('Handwriting'), t('Phonics'), t('Results')].map((s, i) => (
            <div key={i} style={{ flex: 1 }}>
              <div style={{
                height: '3px',
                borderRadius: '2px',
                background: i === 0 ? '#0A0A0A' : '#E5E5E5'
              }} />
              <div style={{
                fontSize: '10px',
                color: i === 0 ? '#0A0A0A' : '#A3A3A3',
                fontWeight: i === 0 ? '600' : '400',
                marginTop: '5px'
              }}>{s}</div>
            </div>
          ))}
        </div>

        {/* Title */}
        <div style={{ marginBottom: '32px' }}>
          <div style={{
            width: '40px', height: '40px',
            background: '#F5F5F5',
            borderRadius: '10px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            marginBottom: '16px'
          }}>
            <User size={20} color="#525252" />
          </div>
          <h1 style={{
            fontSize: '24px', fontWeight: '700',
            letterSpacing: '-0.5px', marginBottom: '8px'
          }}>{t('Child\'s profile')}</h1>
          <p style={{ fontSize: '14px', color: '#737373', lineHeight: '1.6' }}>
            {t('This helps us personalise the screening and compare results against age-appropriate norms.')}
          </p>
        </div>

        {/* Form */}
        <div className="input-group">
          <label className="input-label">{t('Child\'s first name')}</label>
          <input
            className="input-field"
            placeholder={t('e.g. Arjun')}
            value={form.name}
            onChange={e => handleChange('name', e.target.value)}
          />
        </div>

        <div className="input-group">
          <label className="input-label">{t('Date of birth')}</label>
          <input
            className="input-field"
            type="date"
            value={form.dob}
            onChange={e => handleChange('dob', e.target.value)}
            max={new Date().toISOString().split('T')[0]}
          />
          {age && age >= 3 && age <= 16 && (
            <span style={{ fontSize: '12px', color: '#16A34A', fontWeight: '500' }}>
              {t('Age')} {age} — {t('within screening range ✓')}
            </span>
          )}
        </div>

        <div className="input-group">
          <label className="input-label">{t('Gender')}</label>
          <div style={{ display: 'flex', gap: '8px' }}>
            {['Male', 'Female', 'Other'].map(g => (
              <button
                key={g}
                onClick={() => handleChange('gender', g)}
                style={{
                  flex: 1, padding: '11px',
                  border: `1.5px solid ${form.gender === g ? '#0A0A0A' : '#E5E5E5'}`,
                  borderRadius: '8px',
                  background: form.gender === g ? '#0A0A0A' : '#fff',
                  color: form.gender === g ? '#fff' : '#525252',
                  fontSize: '13px', fontWeight: '500',
                  transition: 'all 0.15s ease'
                }}
              >
                {t(g)}
              </button>
            ))}
          </div>
        </div>

        <div className="input-group">
          <label className="input-label">{t('Primary language')}</label>
          <select
            className="input-field"
            value={form.language}
            onChange={e => handleChange('language', e.target.value)}
            style={{ appearance: 'none', cursor: 'pointer' }}
          >
            {LANGUAGES.map(l => (
              <option key={l} value={l}>{l}</option>
            ))}
          </select>
        </div>

        {error && (
          <div style={{
            padding: '12px 14px',
            background: '#FEF2F2',
            border: '1px solid #FECACA',
            borderRadius: '8px',
            fontSize: '13px',
            color: '#DC2626',
            marginBottom: '16px'
          }}>
            {error}
          </div>
        )}

        <button className="btn-primary" onClick={handleSubmit} style={{ marginBottom: '12px' }}>
          {t('Continue to screening')}
          <ArrowRight size={16} />
        </button>

        <div className="divider" style={{ margin: '20px 0' }}>
        </div>

        {/* Demo shortcut */}
        <div style={{
          padding: '16px',
          background: '#FAFAFA',
          border: '1px solid #F0F0F0',
          borderRadius: '10px',
          textAlign: 'center'
        }}>
          <p style={{ fontSize: '13px', color: '#737373', marginBottom: '10px' }}>
            {t('Want to see a sample result first?')}
          </p>
          <button className="btn-ghost" onClick={handleDemo} style={{ margin: '0 auto' }}>
            {t('Load demo — Arjun, age 7 →')}
          </button>
        </div>

      </div>
    </div>
  )
}