import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useApp } from '../context/AppContext'

export default function Dashboard() {
  const navigate = useNavigate()
  const { user, logout } = useAuth()
  const { loadDemoChild } = useApp()

  const sessions = user?.sessions || []
  const uniqueChildren = [...new Set(sessions.map(s => s.child?.name).filter(Boolean))]

  const getLatestScore = (childName) => {
    const childSessions = sessions
      .filter(s => s.child?.name?.toLowerCase() === childName?.toLowerCase())
      .sort((a, b) => new Date(b.date) - new Date(a.date))
    return childSessions[0]?.scores || null
  }

  const getFlag = (scores) => {
    if (!scores) return null
    if (scores.asd_social >= 70 || scores.dyslexia >= 70) return 'high'
    if (scores.asd_social >= 40 || scores.dyslexia >= 40) return 'moderate'
    return 'low'
  }

  const flagColors = {
    high: { bg: '#FEF2F2', color: '#DC2626', label: 'High concern' },
    moderate: { bg: '#FFFBEB', color: '#D97706', label: 'Moderate concern' },
    low: { bg: '#F0FDF4', color: '#16A34A', label: 'Low concern' },
  }

  return (
    <div className="page" style={{ background: '#fff', minHeight: '100vh' }}>
      <nav style={{
        padding: '16px 32px', borderBottom: '1px solid #f0f0f0',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        position: 'sticky', top: 0, background: '#fff', zIndex: 10
      }}>
        <div className="logo">Neuro<span>Spark</span></div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <span style={{ fontSize: '13px', color: '#737373' }}>Hi, {user?.name?.split(' ')[0]}</span>
          <button className="btn-ghost" onClick={logout} style={{ color: '#737373' }}>Sign out</button>
        </div>
      </nav>

      <div style={{ maxWidth: '600px', margin: '0 auto', padding: '40px 24px' }}>

        {/* Welcome */}
        <div style={{ marginBottom: '32px' }}>
          <h1 style={{ fontSize: '26px', fontWeight: '700', letterSpacing: '-0.5px', marginBottom: '6px' }}>
            Your dashboard
          </h1>
          <p style={{ fontSize: '14px', color: '#737373' }}>
            Track your child's progress and run new screenings.
          </p>
        </div>

        {/* Start new screening */}
        <div style={{
          padding: '20px', background: '#0A0A0A', borderRadius: '16px',
          marginBottom: '24px', cursor: 'pointer'
        }} onClick={() => navigate('/profile')}>
          <div style={{ fontSize: '13px', color: '#A3A3A3', marginBottom: '6px' }}>Ready to screen?</div>
          <div style={{ fontSize: '18px', fontWeight: '600', color: '#fff', marginBottom: '4px' }}>
            Start new screening →
          </div>
          <div style={{ fontSize: '13px', color: '#737373' }}>8 minutes · Free · Private</div>
        </div>

        {/* Children profiles */}
        {uniqueChildren.length > 0 && (
          <>
            <div style={{ fontSize: '11px', fontWeight: '600', color: '#A3A3A3', letterSpacing: '1px', textTransform: 'uppercase', marginBottom: '12px' }}>
              Your children
            </div>
            {uniqueChildren.map((name, i) => {
              const scores = getLatestScore(name)
              const flag = getFlag(scores)
              const fc = flag ? flagColors[flag] : null
              const childSessions = sessions.filter(s => s.child?.name?.toLowerCase() === name?.toLowerCase())

              return (
                <div key={i} className="card" style={{ marginBottom: '10px', cursor: 'pointer' }}
                  onClick={() => navigate('/tracker')}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{
                        width: '44px', height: '44px', borderRadius: '50%',
                        background: '#F5F5F5', display: 'flex', alignItems: 'center',
                        justifyContent: 'center', fontSize: '20px'
                      }}>
                        👤
                      </div>
                      <div>
                        <div style={{ fontSize: '15px', fontWeight: '600', marginBottom: '2px' }}>{name}</div>
                        <div style={{ fontSize: '12px', color: '#737373' }}>
                          {childSessions.length} screening{childSessions.length !== 1 ? 's' : ''} · Last:{' '}
                          {new Date(childSessions[childSessions.length - 1]?.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                        </div>
                      </div>
                    </div>
                    {fc && (
                      <span className="badge" style={{ background: fc.bg, color: fc.color }}>
                        {fc.label}
                      </span>
                    )}
                  </div>

                  {scores && (
                    <div style={{ display: 'flex', gap: '8px', marginTop: '14px', paddingTop: '14px', borderTop: '1px solid #F5F5F5' }}>
                      {[
                        { label: 'ASD Social', score: scores.asd_social },
                        { label: 'Dyslexia', score: scores.dyslexia },
                        { label: 'Dysgraphia', score: scores.dysgraphia },
                      ].map((d, j) => (
                        <div key={j} style={{ flex: 1, textAlign: 'center' }}>
                          <div style={{
                            fontSize: '16px', fontWeight: '700',
                            color: d.score >= 70 ? '#DC2626' : d.score >= 40 ? '#D97706' : '#16A34A'
                          }}>{d.score}</div>
                          <div style={{ fontSize: '10px', color: '#A3A3A3', marginTop: '2px' }}>{d.label}</div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )
            })}
          </>
        )}

        {uniqueChildren.length === 0 && (
          <div style={{
            padding: '40px 20px', textAlign: 'center',
            background: '#FAFAFA', borderRadius: '16px',
            border: '1px dashed #E5E5E5'
          }}>
            <div style={{ fontSize: '32px', marginBottom: '12px' }}>👶</div>
            <div style={{ fontSize: '15px', fontWeight: '500', marginBottom: '6px' }}>No screenings yet</div>
            <div style={{ fontSize: '13px', color: '#737373', marginBottom: '16px' }}>
              Run your first screening to see results here
            </div>
            <button className="btn-primary" onClick={() => navigate('/profile')} style={{ maxWidth: '200px', margin: '0 auto' }}>
              Start screening →
            </button>
          </div>
        )}

        {/* Quick links */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginTop: '24px' }}>
          <div className="card" style={{ cursor: 'pointer', textAlign: 'center' }} onClick={() => navigate('/specialists')}>
            <div style={{ fontSize: '24px', marginBottom: '8px' }}>📍</div>
            <div style={{ fontSize: '13px', fontWeight: '500' }}>Find specialists</div>
            <div style={{ fontSize: '12px', color: '#737373', marginTop: '2px' }}>Near you in India</div>
          </div>
          <div className="card" style={{ cursor: 'pointer', textAlign: 'center' }} onClick={() => navigate('/tracker')}>
            <div style={{ fontSize: '24px', marginBottom: '8px' }}>📈</div>
            <div style={{ fontSize: '13px', fontWeight: '500' }}>Progress tracker</div>
            <div style={{ fontSize: '12px', color: '#737373', marginTop: '2px' }}>View trends over time</div>
          </div>
        </div>
      </div>
    </div>
  )
}