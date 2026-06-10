import { useNavigate } from 'react-router-dom'
import { generatePDF } from '../utils/generatePDF'
import { useApp } from '../context/AppContext'
import { dyslexiaTechniques, asdTechniques, universalAccommodations } from '../data/recommendations'

export default function Report() {
  const navigate = useNavigate()
  const { child, scores, t } = useApp()
  const handleDownload = () => {
  generatePDF(child, scores)
}

  if (!scores) return null

  const dTechs = dyslexiaTechniques[scores.dyslexiaType] || []
  const aTechs = asdTechniques[scores.asdProfile] || []
  const getColor = (s) => s >= 70 ? '#DC2626' : s >= 40 ? '#D97706' : '#16A34A'
  const getBg = (s) => s >= 70 ? '#FEF2F2' : s >= 40 ? '#FFFBEB' : '#F0FDF4'
  const getLabel = (s) => s >= 70 ? t('HIGH CONCERN') : s >= 40 ? t('MODERATE') : t('LOW CONCERN')

  const domains = [
    { label: t('ASD Social Communication'), score: scores.asd_social },
    { label: t('ASD Repetitive Behaviour'), score: scores.asd_repetitive },
    { label: `${t('Dyslexia')} (${t(scores.dyslexiaType)})`, score: scores.dyslexia },
    { label: t('Dysgraphia'), score: scores.dysgraphia },
    { label: t('Dyscalculia'), score: scores.dyscalculia },
  ]

  return (
    <div className="page">
      <div className="page-header">
        <button className="btn-ghost" onClick={() => navigate('/scores')}>← {t('Back')}</button>
        <div style={{ flex: 1 }} />
        <div className="logo">Neuro<span>Spark</span></div>
      </div>

      <div className="page-content">
        {/* Header */}
        <div style={{ marginBottom: '24px', paddingBottom: '20px', borderBottom: '1px solid #F0F0F0' }}>
          <div style={{ fontSize: '11px', fontWeight: '600', color: '#A3A3A3', letterSpacing: '1px', textTransform: 'uppercase', marginBottom: '6px' }}>
            {t('Neurodevelopmental Screening Report')}
          </div>
          <h1 style={{ fontSize: '22px', fontWeight: '700', letterSpacing: '-0.5px', marginBottom: '4px' }}>
            {child?.name || t('Child')}, {t('Age')} {child?.age}
          </h1>
          <p style={{ fontSize: '13px', color: '#737373' }}>
            {t('Date')}: {new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })} · {child?.language || 'English'}
          </p>
        </div>

        {/* Risk table */}
        <div style={{ fontSize: '11px', fontWeight: '600', color: '#A3A3A3', letterSpacing: '1px', textTransform: 'uppercase', marginBottom: '12px' }}>
          {t('SCREENING RESULTS')}
        </div>
        {domains.map((d, i) => (
          <div key={i} style={{
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            padding: '12px 0', borderBottom: i < domains.length - 1 ? '1px solid #F5F5F5' : 'none'
          }}>
            <span style={{ fontSize: '13px', color: '#0A0A0A' }}>{d.label}</span>
            <span className="badge" style={{ background: getBg(d.score), color: getColor(d.score) }}>
              {getLabel(d.score)}
            </span>
          </div>
        ))}

        {/* Study techniques */}
        {dTechs.length > 0 && (
          <>
            <div style={{ fontSize: '11px', fontWeight: '600', color: '#A3A3A3', letterSpacing: '1px', textTransform: 'uppercase', margin: '24px 0 12px' }}>
              Study techniques — {scores.dyslexiaType} Dyslexia
            </div>
            {dTechs.map((t, i) => (
              <div key={i} style={{ padding: '12px 0', borderBottom: i < dTechs.length - 1 ? '1px solid #F5F5F5' : 'none' }}>
                <div style={{ fontSize: '13px', fontWeight: '500', marginBottom: '3px' }}>{t.title}</div>
                <div style={{ fontSize: '12px', color: '#737373', lineHeight: '1.5' }}>{t.desc}</div>
              </div>
            ))}
          </>
        )}

        {aTechs.length > 0 && (
          <>
            <div style={{ fontSize: '11px', fontWeight: '600', color: '#A3A3A3', letterSpacing: '1px', textTransform: 'uppercase', margin: '24px 0 12px' }}>
              Study techniques — {scores.asdProfile} ASD Profile
            </div>
            {aTechs.map((t, i) => (
              <div key={i} style={{ padding: '12px 0', borderBottom: i < aTechs.length - 1 ? '1px solid #F5F5F5' : 'none' }}>
                <div style={{ fontSize: '13px', fontWeight: '500', marginBottom: '3px' }}>{t.title}</div>
                <div style={{ fontSize: '12px', color: '#737373', lineHeight: '1.5' }}>{t.desc}</div>
              </div>
            ))}
          </>
        )}

        {/* Accommodations */}
        <div style={{ fontSize: '11px', fontWeight: '600', color: '#A3A3A3', letterSpacing: '1px', textTransform: 'uppercase', margin: '24px 0 12px' }}>
          {t('CLASSROOM ACCOMMODATIONS')}
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '24px' }}>
          {universalAccommodations.map((a, i) => (
            <span key={i} className="badge badge--info">{a}</span>
          ))}
        </div>

        {/* Referral */}
        <div style={{ padding: '16px', background: '#FAFAFA', border: '1px solid #F0F0F0', borderRadius: '12px', marginBottom: '20px' }}>
          <div style={{ fontSize: '13px', fontWeight: '600', marginBottom: '6px' }}>{t('NEXT STEPS')}</div>
          <div style={{ fontSize: '13px', color: '#737373', lineHeight: '1.6', marginBottom: '12px' }}>
            {t('IMPORTANT: This is a screening tool, not a clinical diagnosis. Please consult a qualified specialist for a full assessment.')}
          </div>
          <div style={{ fontSize: '12px', color: '#2563EB', fontWeight: '500', cursor: 'pointer' }}>
            📍 Find specialists near you →
          </div>
        </div>

        <button className="btn-primary" onClick={handleDownload} style={{ marginBottom: '10px' }}>
  ⬇ Download detailed PDF report
</button>
<button className="btn-secondary" onClick={() => navigate('/tracker')} style={{ marginBottom: '10px' }}>
  Start progress tracking →
</button>
<button className="btn-ghost" onClick={() => navigate('/specialists')} style={{ margin: '0 auto' }}>
  📍 Find specialists near you →
</button>
      </div>
    </div>
  )
}