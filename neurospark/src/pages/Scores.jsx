import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import { computeScores } from '../data/recommendations'
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Cell } from 'recharts'

export default function Scores() {
  const navigate = useNavigate()
  const { child, taskResults, scores, setScores, t } = useApp()

  useEffect(() => {
    if (!scores && Object.keys(taskResults).length > 0) {
      setScores(computeScores(taskResults))
    }
  }, [])

  if (!scores) {
    return (
      <div className="page" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '32px', marginBottom: '12px' }}>⏳</div>
          <p style={{ color: '#737373' }}>{t('Computing results...')}</p>
        </div>
      </div>
    )
  }

  const domains = [
    { key: 'asd_social', label: t('ASD Social Communication'), score: scores.asd_social },
    { key: 'asd_repetitive', label: t('ASD Repetitive Behaviour'), score: scores.asd_repetitive },
    { key: 'dyslexia', label: t('Dyslexia'), score: scores.dyslexia },
    { key: 'dysgraphia', label: t('Dysgraphia'), score: scores.dysgraphia },
    { key: 'dyscalculia', label: t('Dyscalculia'), score: scores.dyscalculia },
  ]

  const getColor = (score) => score >= 70 ? '#DC2626' : score >= 40 ? '#D97706' : '#16A34A'
  const getLabel = (score) => score >= 70 ? t('HIGH CONCERN') : score >= 40 ? t('MODERATE') : t('LOW CONCERN')
  const getBg = (score) => score >= 70 ? '#FEF2F2' : score >= 40 ? '#FFFBEB' : '#F0FDF4'

  const flaggedDomains = domains.filter(d => d.score >= 40)

  return (
    <div className="page">
      <div className="page-header">
        <div className="logo">Neuro<span>Spark</span></div>
      </div>

      <div style={{ display: 'flex', gap: '6px', padding: '0 20px 12px', background: '#fff' }}>
        {['Profile', 'Gaze', 'Handwriting', 'Phonics', 'Results'].map((s, i) => (
          <div key={i} style={{ flex: 1 }}>
            <div style={{ height: '3px', borderRadius: '2px', background: '#0A0A0A' }} />
          </div>
        ))}
      </div>

      <div className="page-content">
        <div style={{ marginBottom: '24px' }}>
          <h1 style={{ fontSize: '24px', fontWeight: '700', letterSpacing: '-0.5px', marginBottom: '6px' }}>
            {child?.name || t('Child')}'s {t('SCREENING RESULTS').toLowerCase()}
          </h1>
          <p style={{ fontSize: '14px', color: '#737373' }}>
            {t('Based on gaze tracking, handwriting analysis, and phonological processing.')}
          </p>
        </div>

        {/* Score bars */}
        <div style={{ marginBottom: '24px' }}>
          {domains.map((d, i) => (
            <div key={i} style={{ marginBottom: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                <span style={{ fontSize: '13px', fontWeight: '500' }}>{d.label}</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontSize: '13px', fontWeight: '600', color: getColor(d.score) }}>{d.score}</span>
                  <span className="badge" style={{ background: getBg(d.score), color: getColor(d.score) }}>
                    {getLabel(d.score)}
                  </span>
                </div>
              </div>
              <div style={{ height: '8px', background: '#F5F5F5', borderRadius: '4px', overflow: 'hidden' }}>
                <div style={{
                  height: '100%', borderRadius: '4px',
                  width: `${d.score}%`,
                  background: getColor(d.score),
                  transition: 'width 1s ease'
                }} />
              </div>
            </div>
          ))}
        </div>

        {/* Detected types */}
        {scores.dyslexia >= 40 && (
          <div style={{ padding: '14px', background: '#FFFBEB', border: '1px solid #FCD34D', borderRadius: '12px', marginBottom: '12px' }}>
            <div style={{ fontSize: '12px', fontWeight: '500', color: '#78350F', marginBottom: '4px' }}>{t('DYSLEXIA TYPE:')}</div>
            <div style={{ fontSize: '16px', fontWeight: '700', color: '#0A0A0A' }}>{t(scores.dyslexiaType)} {t('Dyslexia')}</div>
          </div>
        )}

        {scores.asd_social >= 40 && (
          <div style={{ padding: '14px', background: '#EFF6FF', border: '1px solid #BFDBFE', borderRadius: '12px', marginBottom: '20px' }}>
            <div style={{ fontSize: '12px', fontWeight: '500', color: '#1D4ED8', marginBottom: '4px' }}>{t('ASD profile detected')}</div>
            <div style={{ fontSize: '16px', fontWeight: '700', color: '#0A0A0A' }}>{t(scores.asdProfile)}</div>
          </div>
        )}

        <div style={{ padding: '14px', background: '#FAFAFA', border: '1px solid #F0F0F0', borderRadius: '12px', marginBottom: '24px', fontSize: '13px', color: '#525252', lineHeight: '1.6' }}>
          ⚠️ {t('IMPORTANT: This is a screening tool, not a clinical diagnosis. Please consult a qualified specialist for a full assessment.')}
        </div>

        <button className="btn-primary" onClick={() => navigate('/report')} style={{ marginBottom: '10px' }}>
          {t('View full report + study techniques →')}
        </button>
        <button className="btn-secondary" onClick={() => navigate('/tracker')}>
          {t('View progress tracker')}
        </button>
      </div>
    </div>
  )
}