import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import { PHONICS_DATA, LANGUAGE_CODES } from '../data/phonicsData'

const speak = (text, lang = 'en-IN') => {
  return new Promise((resolve) => {
    window.speechSynthesis.cancel()
    const utterance = new SpeechSynthesisUtterance(text)
    utterance.lang = lang
    utterance.rate = 0.85
    utterance.pitch = 1.1
    utterance.volume = 1
    utterance.onend = resolve
    utterance.onerror = resolve
    window.speechSynthesis.speak(utterance)
  })
}

export default function PhonicsTask() {
  const navigate = useNavigate()
  const { child, updateTaskResult, t } = useApp()
  const langName = child?.language || 'English'
  const QUESTIONS = PHONICS_DATA[langName] || PHONICS_DATA.English
  const ttsLang = LANGUAGE_CODES[langName] || 'en-IN'

  const [currentIdx, setCurrentIdx] = useState(0)
  const [answers, setAnswers] = useState([])
  const [selected, setSelected] = useState(null)
  const [phase, setPhase] = useState('task')
  const startTimeRef = useRef(Date.now())
  const questionTimeRef = useRef(Date.now())
  useEffect(() => {
  if (phase !== 'task') return
  const q = QUESTIONS[currentIdx]
  const timer = setTimeout(async () => {
    await speak(t('Do these words rhyme?'), ttsLang)
    await new Promise(r => setTimeout(r, 400))
    await speak(q.word1, ttsLang)
    await new Promise(r => setTimeout(r, 300))
    await speak(q.word2, ttsLang)
  }, 500)
  return () => clearTimeout(timer)
}, [currentIdx, phase, ttsLang, t, QUESTIONS])

  const handleAnswer = (answer) => {
    if (selected !== null) return
    const q = QUESTIONS[currentIdx]
    const correct = answer === q.rhyme
    const responseTime = Date.now() - questionTimeRef.current
    setSelected(answer)
    const newAnswers = [...answers, { correct, responseTime, answer, expected: q.rhyme }]

    setTimeout(() => {
      if (currentIdx + 1 >= QUESTIONS.length) {
        const accuracy = newAnswers.filter(a => a.correct).length / newAnswers.length
        const avgTime = newAnswers.reduce((s, a) => s + a.responseTime, 0) / newAnswers.length
        updateTaskResult('phonics', { accuracy, avgResponseTime: avgTime, details: newAnswers })
        setAnswers(newAnswers)
        setPhase('done')
      } else {
        setCurrentIdx(currentIdx + 1)
        setSelected(null)
        questionTimeRef.current = Date.now()
        setAnswers(newAnswers)
      }
    }, 800)
  }

  const q = QUESTIONS[currentIdx]
  const correctCount = answers.filter(a => a.correct).length
  const accuracy = answers.length > 0 ? correctCount / answers.length : 0

  return (
    <div className="page">
      <div className="page-header">
        <div className="logo">Neuro<span>Spark</span></div>
        <div style={{ flex: 1 }} />
        <span style={{ fontSize: '13px', color: '#737373' }}>
          {currentIdx + 1} / {QUESTIONS.length}
        </span>
      </div>

      <div style={{ display: 'flex', gap: '6px', padding: '0 20px 12px', background: '#fff' }}>
        {[t('Profile'), t('Gaze'), t('Handwriting'), t('Phonics'), t('Results')].map((s, i) => (
          <div key={i} style={{ flex: 1 }}>
            <div style={{ height: '3px', borderRadius: '2px', background: i <= 3 ? '#0A0A0A' : '#E5E5E5' }} />
          </div>
        ))}
      </div>

      {phase === 'task' && (
        <div className="page-content">
          <div style={{ marginBottom: '24px' }}>
            <div style={{ width: '40px', height: '40px', background: '#F5F5F5', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '12px', fontSize: '20px' }}>🔤</div>
            <h1 style={{ fontSize: '22px', fontWeight: '700', letterSpacing: '-0.5px', marginBottom: '6px' }}>{t('Do these words rhyme?')}</h1>
            <p style={{ fontSize: '14px', color: '#737373' }}>{t('Listen carefully and tap Yes or No.')}</p>
          </div>

          <div style={{ display: 'flex', gap: '12px', marginBottom: '32px' }}>
            {[{ word: q.word1, emoji: q.emoji1 }, { word: q.word2, emoji: q.emoji2 }].map((item, i) => (
              <div key={i} style={{
                flex: 1, padding: '24px 16px', background: '#FAFAFA',
                border: '1px solid #F0F0F0', borderRadius: '16px', textAlign: 'center'
              }}>
                <div style={{ fontSize: '48px', marginBottom: '10px' }}>{item.emoji}</div>
                <div style={{ fontSize: '22px', fontWeight: '700', color: '#0A0A0A', letterSpacing: '-0.5px' }}>
                  {item.word}
                </div>
              </div>
            ))}
          </div>
            {/* Replay button */}
<button
  onClick={async () => {
    await speak(q.word1, ttsLang)
    await new Promise(r => setTimeout(r, 300))
    await speak(q.word2, ttsLang)
  }}
  style={{
    width: '100%',
    padding: '12px',
    background: '#F5F5F5',
    border: '1px solid #E5E5E5',
    borderRadius: '10px',
    fontSize: '13px',
    fontWeight: '500',
    color: '#525252',
    marginBottom: '10px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '6px'
  }}
>
  {t('🔊 Hear the words again')}
</button>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button
              onClick={() => handleAnswer(true)}
              disabled={selected !== null}
              style={{
                flex: 1, padding: '18px',
                background: selected === true ? (q.rhyme ? '#F0FDF4' : '#FEF2F2') : '#F5F5F5',
                border: `2px solid ${selected === true ? (q.rhyme ? '#16A34A' : '#DC2626') : '#E5E5E5'}`,
                borderRadius: '12px', fontSize: '16px', fontWeight: '600',
                color: selected === true ? (q.rhyme ? '#16A34A' : '#DC2626') : '#0A0A0A',
                transition: 'all 0.2s ease', cursor: selected !== null ? 'default' : 'pointer'
              }}
            >
              👍 {t('Yes')}
            </button>
            <button
              onClick={() => handleAnswer(false)}
              disabled={selected !== null}
              style={{
                flex: 1, padding: '18px',
                background: selected === false ? (!q.rhyme ? '#F0FDF4' : '#FEF2F2') : '#F5F5F5',
                border: `2px solid ${selected === false ? (!q.rhyme ? '#16A34A' : '#DC2626') : '#E5E5E5'}`,
                borderRadius: '12px', fontSize: '16px', fontWeight: '600',
                color: selected === false ? (!q.rhyme ? '#16A34A' : '#DC2626') : '#0A0A0A',
                transition: 'all 0.2s ease', cursor: selected !== null ? 'default' : 'pointer'
              }}
            >
              👎 {t('No')}
            </button>
          </div>

          <div style={{ marginTop: '20px', height: '4px', background: '#F0F0F0', borderRadius: '2px' }}>
            <div style={{
              height: '100%', borderRadius: '2px', background: '#0A0A0A',
              width: `${((currentIdx) / QUESTIONS.length) * 100}%`,
              transition: 'width 0.3s ease'
            }} />
          </div>
        </div>
      )}

      {phase === 'done' && (
        <div className="page-content">
          <div style={{ width: '40px', height: '40px', background: accuracy < 0.7 ? '#FEF2F2' : '#F0FDF4', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px', fontSize: '20px' }}>
            {accuracy < 0.7 ? '⚠️' : '✓'}
          </div>
          <h2 style={{ fontSize: '22px', fontWeight: '700', letterSpacing: '-0.5px', marginBottom: '8px' }}>{t('Phonics task complete')}</h2>
          <p style={{ fontSize: '14px', color: '#737373', marginBottom: '20px' }}>
            {correctCount} {t('out of')} {answers.length} {t('correct')}
          </p>

          <div style={{ padding: '20px', background: accuracy < 0.7 ? '#FEF2F2' : '#F0FDF4', borderRadius: '12px', marginBottom: '20px', border: `1px solid ${accuracy < 0.7 ? '#FECACA' : '#BBF7D0'}` }}>
            <div style={{ fontSize: '36px', fontWeight: '700', letterSpacing: '-1px', color: accuracy < 0.7 ? '#DC2626' : '#16A34A', marginBottom: '4px' }}>
              {Math.round(accuracy * 100)}%
            </div>
            <div style={{ fontSize: '13px', color: '#525252' }}>
              {accuracy < 0.7 ? t('Below expected range — phonological processing difficulty detected') : t('Within expected range for this age group')}
            </div>
          </div>

          <button className="btn-primary" onClick={() => navigate('/tasks/sparky')}>
  {t('Continue to Sparky task →')}
</button>
        </div>
      )}
    </div>
  )
}