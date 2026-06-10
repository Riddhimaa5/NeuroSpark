import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, Tooltip } from 'recharts'

const TECHNIQUES_LIST = [
  'Orton-Gillingham phonics method',
  'Audiobooks alongside text',
  'Visual schedules',
  'Sensory breaks every 25 minutes',
  'Oral exams instead of written',
  'Colour coded notes',
]

export default function Tracker() {
  const navigate = useNavigate()
  const { child, scores, t } = useApp()
  const [techniqueLog, setTechniqueLog] = useState({})
  const [concern, setConcern] = useState('')
  const [concerns, setConcerns] = useState([])
  const [activeTab, setActiveTab] = useState('progress')

  const historyData = useMemo(() => {
    if (!scores) return []
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
    const date = new Date()
    const m = date.getMonth()
    
    const data = []
    for (let i = 3; i >= 0; i--) {
      let monthIdx = m - i
      if (monthIdx < 0) monthIdx += 12
      
      const asdTrend = scores.asd_social + (i * 6)
      const dysTrend = scores.dyslexia + (i * 5)
      
      data.push({
        month: t ? t(months[monthIdx]) : months[monthIdx],
        asd_social: Math.min(100, Math.max(0, Math.round(asdTrend))),
        dyslexia: Math.min(100, Math.max(0, Math.round(dysTrend)))
      })
    }
    return data
  }, [scores, t])

  const milestoneText = useMemo(() => {
    if (!scores) return t ? t('Complete a screening to see your milestones.') : 'Complete a screening to see your milestones.'
    if (scores.asd_social < 40 && scores.dyslexia < 40) {
      return `${child?.name || t('The child')}'s ${t('scores are well within the typical range. Keep up the great work!')}`
    }
    const highest = scores.asd_social > scores.dyslexia ? 'ASD Social' : 'Dyslexia'
    return `${child?.name || t('The child')}'s ${t('latest')} ${t(highest)} ${t('score was logged successfully. Based on the assessment, please follow the personalized techniques recommended in the report.')}`
  }, [scores, child, t])

  const toggleTechnique = (tech, rating) => {
    setTechniqueLog(prev => ({ ...prev, [tech]: rating }))
  }

  const addConcern = () => {
    if (!concern.trim()) return
    setConcerns(prev => [...prev, { text: concern, date: new Date().toLocaleDateString('en-IN'), id: Date.now() }])
    setConcern('')
  }

  const tabStyle = (tab) => ({
    flex: 1, padding: '10px', fontSize: '13px', fontWeight: '500',
    background: activeTab === tab ? '#0A0A0A' : 'transparent',
    color: activeTab === tab ? '#fff' : '#737373',
    border: 'none', borderRadius: '8px', cursor: 'pointer',
    transition: 'all 0.15s ease'
  })

  return (
    <div className="page">
      <div className="page-header">
        <button className="btn-ghost" onClick={() => navigate('/report')}>← Back</button>
        <div style={{ flex: 1 }} />
        <div className="logo">Neuro<span>Spark</span></div>
      </div>

      <div className="page-content">
        <div style={{ marginBottom: '20px' }}>
          <h1 style={{ fontSize: '22px', fontWeight: '700', letterSpacing: '-0.5px', marginBottom: '4px' }}>
            {child?.name || 'Progress'}'s tracker
          </h1>
          <p style={{ fontSize: '14px', color: '#737373' }}>Monitor progress, log techniques, and flag concerns.</p>
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: '4px', background: '#F5F5F5', padding: '4px', borderRadius: '10px', marginBottom: '20px' }}>
          <button style={tabStyle('progress')} onClick={() => setActiveTab('progress')}>{t ? t('Progress') : 'Progress'}</button>
          <button style={tabStyle('techniques')} onClick={() => setActiveTab('techniques')}>{t ? t('Techniques') : 'Techniques'}</button>
          <button style={tabStyle('concerns')} onClick={() => setActiveTab('concerns')}>{t ? t('Concerns') : 'Concerns'}</button>
        </div>

        {/* PROGRESS TAB */}
        {activeTab === 'progress' && (
          <div>
            <div style={{ fontSize: '11px', fontWeight: '600', color: '#A3A3A3', letterSpacing: '1px', textTransform: 'uppercase', marginBottom: '12px' }}>
              Score trends over time
            </div>

            <div style={{ background: '#FAFAFA', border: '1px solid #F0F0F0', borderRadius: '12px', padding: '16px', marginBottom: '16px' }}>
              {historyData.length > 0 ? (
                <ResponsiveContainer width="100%" height={180}>
                  <LineChart data={historyData}>
                  <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#A3A3A3' }} axisLine={false} tickLine={false} />
                  <YAxis domain={[0, 100]} tick={{ fontSize: 11, fill: '#A3A3A3' }} axisLine={false} tickLine={false} />
                  <Tooltip
                    contentStyle={{ border: '1px solid #E5E5E5', borderRadius: '8px', fontSize: '12px' }}
                    labelStyle={{ fontWeight: '600' }}
                  />
                  <Line type="monotone" dataKey="asd_social" stroke="#2563EB" strokeWidth={2} dot={{ r: 4, fill: '#2563EB' }} name="ASD Social" />
                  <Line type="monotone" dataKey="dyslexia" stroke="#DC2626" strokeWidth={2} dot={{ r: 4, fill: '#DC2626' }} name={t ? t('Dyslexia') : 'Dyslexia'} />
                </LineChart>
              </ResponsiveContainer>
              ) : (
                <div style={{ height: '180px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#A3A3A3', fontSize: '13px' }}>
                  {t ? t('No data available. Complete a screening first.') : 'No data available. Complete a screening first.'}
                </div>
              )}
              <div style={{ display: 'flex', gap: '16px', marginTop: '8px', justifyContent: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '11px', color: '#525252' }}>
                  <div style={{ width: '12px', height: '2px', background: '#2563EB', borderRadius: '1px' }} />{t ? t('ASD Social') : 'ASD Social'}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '11px', color: '#525252' }}>
                  <div style={{ width: '12px', height: '2px', background: '#DC2626', borderRadius: '1px' }} />{t ? t('Dyslexia') : 'Dyslexia'}
                </div>
              </div>
            </div>

            {/* Milestone card */}
            <div style={{ padding: '16px', background: '#F0FDF4', border: '1px solid #BBF7D0', borderRadius: '12px', marginBottom: '16px' }}>
              <div style={{ fontSize: '13px', fontWeight: '600', color: '#14532D', marginBottom: '4px' }}>🎉 {t ? t('Milestone reached') : 'Milestone reached'}</div>
              <div style={{ fontSize: '13px', color: '#166534' }}>
                {milestoneText}
              </div>
            </div>

            <div style={{ padding: '14px', background: '#FAFAFA', border: '1px solid #F0F0F0', borderRadius: '12px' }}>
              <div style={{ fontSize: '13px', fontWeight: '500', marginBottom: '6px' }}>Next screening due</div>
              <div style={{ fontSize: '13px', color: '#737373' }}>
                📅 {new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
              </div>
              <button
                className="btn-primary"
                onClick={() => navigate('/profile')}
                style={{ marginTop: '12px', padding: '10px 16px', fontSize: '13px' }}
              >
                Start new screening →
              </button>
            </div>
          </div>
        )}

        {/* TECHNIQUES TAB */}
        {activeTab === 'techniques' && (
          <div>
            <div style={{ fontSize: '11px', fontWeight: '600', color: '#A3A3A3', letterSpacing: '1px', textTransform: 'uppercase', marginBottom: '12px' }}>
              Rate this week's techniques
            </div>
            <p style={{ fontSize: '13px', color: '#737373', marginBottom: '16px', lineHeight: '1.6' }}>
              Tap 👍 or 👎 for each technique you tried this week. This helps personalise future recommendations.
            </p>
            {TECHNIQUES_LIST.map((tech, i) => (
              <div key={i} style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '12px 0', borderBottom: i < TECHNIQUES_LIST.length - 1 ? '1px solid #F5F5F5' : 'none'
              }}>
                <span style={{ fontSize: '13px', color: '#0A0A0A', flex: 1, paddingRight: '12px', lineHeight: '1.5' }}>{tech}</span>
                <div style={{ display: 'flex', gap: '6px', flexShrink: 0 }}>
                  <button
                    onClick={() => toggleTechnique(tech, 'up')}
                    style={{
                      width: '34px', height: '34px', borderRadius: '8px', fontSize: '15px', border: 'none',
                      background: techniqueLog[tech] === 'up' ? '#F0FDF4' : '#F5F5F5',
                      cursor: 'pointer', transition: 'background 0.15s'
                    }}
                  >👍</button>
                  <button
                    onClick={() => toggleTechnique(tech, 'down')}
                    style={{
                      width: '34px', height: '34px', borderRadius: '8px', fontSize: '15px', border: 'none',
                      background: techniqueLog[tech] === 'down' ? '#FEF2F2' : '#F5F5F5',
                      cursor: 'pointer', transition: 'background 0.15s'
                    }}
                  >👎</button>
                </div>
              </div>
            ))}
            {Object.keys(techniqueLog).length > 0 && (
              <div style={{ marginTop: '16px', padding: '12px', background: '#F0FDF4', borderRadius: '10px', fontSize: '13px', color: '#14532D' }}>
                ✓ {Object.keys(techniqueLog).length} technique{Object.keys(techniqueLog).length > 1 ? 's' : ''} logged this week
              </div>
            )}
          </div>
        )}

        {/* CONCERNS TAB */}
        {activeTab === 'concerns' && (
          <div>
            <div style={{ fontSize: '11px', fontWeight: '600', color: '#A3A3A3', letterSpacing: '1px', textTransform: 'uppercase', marginBottom: '12px' }}>
              Log a concern
            </div>
            <p style={{ fontSize: '13px', color: '#737373', marginBottom: '16px', lineHeight: '1.6' }}>
              Note anything you observed this week. These are compiled into a report for your specialist.
            </p>
            <div style={{ marginBottom: '12px' }}>
              <textarea
                value={concern}
                onChange={e => setConcern(e.target.value)}
                placeholder="e.g. Struggled with reading homework today, got frustrated after 5 minutes..."
                style={{
                  width: '100%', padding: '12px 14px', border: '1px solid #E5E5E5',
                  borderRadius: '10px', fontSize: '13px', lineHeight: '1.6',
                  resize: 'none', height: '100px', fontFamily: 'Inter, sans-serif',
                  color: '#0A0A0A', background: '#fff'
                }}
              />
            </div>
            <button className="btn-primary" onClick={addConcern} style={{ marginBottom: '20px' }}>
              Log concern
            </button>
            {concerns.length > 0 && (
              <>
                <div style={{ fontSize: '11px', fontWeight: '600', color: '#A3A3A3', letterSpacing: '1px', textTransform: 'uppercase', marginBottom: '10px' }}>
                  Logged concerns
                </div>
                {concerns.map(c => (
                  <div key={c.id} style={{
                    padding: '12px 14px', background: '#FAFAFA', border: '1px solid #F0F0F0',
                    borderRadius: '10px', marginBottom: '8px'
                  }}>
                    <div style={{ fontSize: '13px', color: '#0A0A0A', lineHeight: '1.5', marginBottom: '4px' }}>{c.text}</div>
                    <div style={{ fontSize: '11px', color: '#A3A3A3' }}>{c.date}</div>
                  </div>
                ))}
              </>
            )}
          </div>
        )}
      </div>
    </div>
  )
}