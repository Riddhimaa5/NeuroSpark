import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import Sparky from '../components/Sparky'
import { analyseTranscript, computeCommunicationScore } from '../utils/speechAnalysis'

const QUESTIONS = [
  { text: 'Hi {name}! What did you eat today?', topic: 'food' },
  { text: 'What is your favourite cartoon or show?', topic: 'preference' },
  { text: 'How are you feeling today?', topic: 'emotion' },
  { text: 'Can you tell me about your best friend?', topic: 'social' },
  { text: 'What do you like to do after school?', topic: 'activity' },
]

const speak = (text, name = '') => {
  return new Promise(resolve => {
    window.speechSynthesis.cancel()
    const u = new SpeechSynthesisUtterance(text.replace('{name}', name))
    u.rate = 0.82
    u.pitch = 1.15
    u.volume = 1
    u.onend = resolve
    u.onerror = resolve
    window.speechSynthesis.speak(u)
  })
}

export default function ConversationalTask() {
  const navigate = useNavigate()
  const { child, updateTaskResult, t } = useApp()
  const [phase, setPhase] = useState('intro')
  const [currentQ, setCurrentQ] = useState(0)
  const [listening, setListening] = useState(false)
  const [sparkyGesture, setSparkyGesture] = useState('idle')
  const [speaking, setSpeaking] = useState(false)
  const [transcript, setTranscript] = useState('')
  const [responses, setResponses] = useState([])
  const [countdown, setCountdown] = useState(8)
  const [currentFeedback, setCurrentFeedback] = useState(null)
  const recognitionRef = useRef(null)
  const startTimeRef = useRef(null)
  const finalTranscriptRef = useRef('')
  const currentTranscriptRef = useRef('')
  const responsesRef = useRef([])

  const initRecognition = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
    if (!SpeechRecognition) return null
    const rec = new SpeechRecognition()
    rec.continuous = true
    rec.interimResults = true
    rec.lang = 'en-IN'
    rec.onresult = (e) => {
      let interim = ''
      let final = ''
      for (let i = e.resultIndex; i < e.results.length; i++) {
        if (e.results[i].isFinal) final += e.results[i][0].transcript
        else interim += e.results[i][0].transcript
      }
      finalTranscriptRef.current += final
      const combined = finalTranscriptRef.current + interim
      currentTranscriptRef.current = combined
      setTranscript(combined)
    }
    return rec
  }

  const askQuestion = async (idx) => {
    const q = QUESTIONS[idx]
    const name = child?.name || t('friend')
    setSparkyGesture('idle')
    setSpeaking(true)
    setTranscript('')
    finalTranscriptRef.current = ''
    currentTranscriptRef.current = ''

    await speak(t(q.text), name)
    setSpeaking(false)

    // Start listening
    const rec = initRecognition()
    if (rec) {
      recognitionRef.current = rec
      rec.start()
    }
    setListening(true)
    startTimeRef.current = Date.now()

    // 8 second window
    let c = 8
    setCountdown(c)
    const timer = setInterval(() => {
      c -= 1
      setCountdown(c)
      if (c <= 0) {
        clearInterval(timer)
        finishQuestion(idx)
      }
    }, 1000)
  }

  const finishQuestion = (idx) => {
    if (recognitionRef.current) {
      recognitionRef.current.stop()
      recognitionRef.current = null
    }
    setListening(false)
    const latency = startTimeRef.current ? Date.now() - startTimeRef.current : 5000
    const captured = currentTranscriptRef.current.trim()
    const q = QUESTIONS[idx]
    const analysis = analyseTranscript(captured, q.text)
    const newResponse = { question: q.text, transcript: captured, latency: Math.min(latency, 8000), analysis }
    const newResponses = [...responsesRef.current, newResponse]
    responsesRef.current = newResponses
    setResponses(newResponses)

    // Quick feedback
    if (captured.length > 0) {
      if (analysis.isEcholalic) {
        setCurrentFeedback({ text: t("You repeated my words! 🌟"), type: 'warning' })
      } else if (analysis.isShortResponse) {
        setCurrentFeedback({ text: t("Thanks for sharing! 🌟"), type: 'warning' })
      } else {
        setCurrentFeedback({ text: t('Nice answer! 🌟'), type: 'success' })
      }
    } else {
      setCurrentFeedback({ text: t("That's okay! Let's try the next one."), type: 'neutral' })
    }

    setTimeout(() => {
      setCurrentFeedback(null)
      if (idx + 1 >= QUESTIONS.length) {
        const score = computeCommunicationScore(newResponses)
        updateTaskResult('conversation', { responses: newResponses, score })
        setPhase('done')
        setResponses(newResponses)
      } else {
        setCurrentQ(idx + 1)
        askQuestion(idx + 1)
      }
    }, 1500)
  }

  const startTask = async () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
    if (!SpeechRecognition) {
      alert('Speech recognition not supported in this browser. Please use Chrome.')
      return
    }
    setPhase('running')
    await new Promise(r => setTimeout(r, 500))
    await askQuestion(0)
  }

  const score = computeCommunicationScore(responses)
  const flagCount = responses.filter(r =>
    r.analysis.isEcholalic || r.analysis.isShortResponse || r.latency > 3000
  ).length

  return (
    <div className="page">
      <div className="page-header">
        <div className="logo">Neuro<span>Spark</span></div>
      </div>

      <div style={{ display: 'flex', gap: '6px', padding: '0 20px 12px', background: '#fff' }}>
        {[t('Profile'), t('Gaze'), t('Handwriting'), t('Phonics'), t('Sparky'), t('Conversation'), t('Results')].map((s, i) => (
          <div key={i} style={{ flex: 1 }}>
            <div style={{ height: '3px', borderRadius: '2px', background: i <= 5 ? '#0A0A0A' : '#E5E5E5' }} />
          </div>
        ))}
      </div>

      {phase === 'intro' && (
        <div className="page-content">
          <div style={{ textAlign: 'center', marginBottom: '20px' }}>
            <Sparky gesture="idle" speaking={false} size={110} />
          </div>
          <h1 style={{ fontSize: '22px', fontWeight: '700', letterSpacing: '-0.5px', marginBottom: '8px' }}>
            {t('Chat with Sparky 💬')}
          </h1>
          <p style={{ fontSize: '14px', color: '#737373', lineHeight: '1.7', marginBottom: '20px' }}>
            {t('Sparky is going to ask')} {child?.name || t('the child')} {t('5 simple questions. Just speak naturally — there are no wrong answers! This helps us understand how')} {child?.name || t('the child')} {t('communicates.')}
          </p>
          <div style={{ padding: '14px', background: '#FFFBEB', border: '1px solid #FCD34D', borderRadius: '10px', marginBottom: '20px', fontSize: '13px', color: '#78350F' }}>
            {t('🎤 Make sure the microphone is working and the room is quiet.')}
          </div>
          <button className="btn-primary" onClick={startTask}>
            {t('Start chatting with Sparky →')}
          </button>
        </div>
      )}

      {phase === 'running' && (
        <div className="page-content">
          {/* Progress */}
          <div style={{ display: 'flex', gap: '6px', marginBottom: '16px' }}>
            {QUESTIONS.map((_, i) => (
              <div key={i} style={{ flex: 1, height: '4px', borderRadius: '2px', background: i < currentQ ? '#16A34A' : i === currentQ ? '#0A0A0A' : '#E5E5E5' }} />
            ))}
          </div>

          {/* Sparky + question */}
          <div style={{
            background: 'linear-gradient(135deg, #667eea12, #764ba212)',
            borderRadius: '16px', padding: '20px',
            display: 'flex', flexDirection: 'column', alignItems: 'center',
            marginBottom: '16px', border: '1px solid #E5E5E5'
          }}>
            {/* Question bubble */}
            <div style={{
              background: '#fff', border: '2px solid #E5E5E5',
              borderRadius: '16px', padding: '12px 16px',
              fontSize: '14px', fontWeight: '500', color: '#0A0A0A',
              maxWidth: '260px', textAlign: 'center',
              marginBottom: '16px', lineHeight: '1.5'
            }}>
              {t(QUESTIONS[currentQ].text).replace('{name}', child?.name || t('friend'))}
            </div>

            <Sparky gesture={sparkyGesture} speaking={speaking} size={110} />

            {currentFeedback && (
              <div style={{
                marginTop: '12px', padding: '8px 16px',
                background: currentFeedback.type === 'warning' ? '#FEF2F2' : currentFeedback.type === 'neutral' ? '#F5F5F5' : '#F0FDF4', 
                border: `1px solid ${currentFeedback.type === 'warning' ? '#FECACA' : currentFeedback.type === 'neutral' ? '#E5E5E5' : '#BBF7D0'}`,
                borderRadius: '10px', fontSize: '13px', fontWeight: '500', 
                color: currentFeedback.type === 'warning' ? '#DC2626' : currentFeedback.type === 'neutral' ? '#737373' : '#16A34A'
              }}>
                {currentFeedback.text}
              </div>
            )}
          </div>

          {/* Listening indicator */}
          {listening && !currentFeedback && (
            <div style={{
              padding: '14px', background: '#EFF6FF',
              border: '1px solid #BFDBFE', borderRadius: '12px',
              marginBottom: '12px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                <div style={{
                  width: '10px', height: '10px', borderRadius: '50%',
                  background: '#2563EB', animation: 'pulse 1s infinite'
                }} />
                <span style={{ fontSize: '13px', fontWeight: '500', color: '#1D4ED8' }}>
                  {t('Listening...')} {countdown}s {t('remaining')}
                </span>
              </div>
              {transcript && (
                <div style={{
                  fontSize: '13px', color: '#374151', fontStyle: 'italic',
                  background: '#fff', borderRadius: '8px', padding: '8px 12px',
                  border: '1px solid #BFDBFE', minHeight: '36px'
                }}>
                  "{transcript}"
                </div>
              )}
            </div>
          )}

          <div style={{ fontSize: '13px', color: '#A3A3A3', textAlign: 'center' }}>
            {t('Question')} {currentQ + 1} {t('out of')} {QUESTIONS.length}
          </div>
        </div>
      )}

      {phase === 'done' && (
        <div className="page-content">
          <div style={{ width: '40px', height: '40px', background: score > 50 ? '#FEF2F2' : '#F0FDF4', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px', fontSize: '20px' }}>
            {score > 50 ? '⚠️' : '✓'}
          </div>
          <h2 style={{ fontSize: '22px', fontWeight: '700', letterSpacing: '-0.5px', marginBottom: '8px' }}>
            {t('Conversation complete!')}
          </h2>
          <p style={{ fontSize: '14px', color: '#737373', marginBottom: '20px' }}>
            {flagCount > 0
              ? `${flagCount} ${t('communication pattern(s) flagged for review.')}`
              : t('Communication patterns appear typical for this age group.')}
          </p>

          {/* Response summary */}
          {responses.map((r, i) => (
            <div key={i} style={{
              padding: '12px', marginBottom: '8px',
              background: (r.analysis.isEcholalic || r.analysis.isShortResponse || r.latency > 3000)
                ? '#FEF2F2' : '#F0FDF4',
              border: `1px solid ${(r.analysis.isEcholalic || r.analysis.isShortResponse || r.latency > 3000) ? '#FECACA' : '#BBF7D0'}`,
              borderRadius: '10px'
            }}>
              <div style={{ fontSize: '12px', fontWeight: '500', marginBottom: '4px' }}>
                Q{i + 1}: {t(QUESTIONS[i].text).replace('{name}', child?.name || t('friend'))}
              </div>
              <div style={{ fontSize: '12px', color: '#525252', marginBottom: '6px', fontStyle: 'italic' }}>
                "{r.transcript || t('(no response)')}"
              </div>
              <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                <span style={{ fontSize: '10px', padding: '2px 7px', borderRadius: '8px', background: r.latency > 3000 ? '#FEE2E2' : '#DCFCE7', color: r.latency > 3000 ? '#991B1B' : '#14532D' }}>
                  {(r.latency / 1000).toFixed(1)}s {t('latency')}
                </span>
                <span style={{ fontSize: '10px', padding: '2px 7px', borderRadius: '8px', background: r.analysis.isShortResponse ? '#FEE2E2' : '#DCFCE7', color: r.analysis.isShortResponse ? '#991B1B' : '#14532D' }}>
                  {r.analysis.wordCount} {t('words')}
                </span>
                {r.analysis.isEcholalic && (
                  <span style={{ fontSize: '10px', padding: '2px 7px', borderRadius: '8px', background: '#FEE2E2', color: '#991B1B' }}>
                    {t('Echolalia detected')}
                  </span>
                )}
              </div>
            </div>
          ))}

          <div style={{
            padding: '14px', marginTop: '8px', marginBottom: '20px',
            background: score > 50 ? '#FEF2F2' : '#F0FDF4',
            border: `1px solid ${score > 50 ? '#FECACA' : '#BBF7D0'}`,
            borderRadius: '12px'
          }}>
            <div style={{ fontSize: '13px', fontWeight: '600', color: score > 50 ? '#DC2626' : '#16A34A', marginBottom: '4px' }}>
              {score > 50 ? t('⚠ Communication patterns warrant further assessment') : t('✓ Communication patterns appear typical')}
            </div>
            <div style={{ fontSize: '13px', color: '#525252', lineHeight: '1.6' }}>
              {t('Communication score:')} {score}/100 — {score > 70 ? t('High concern') : score > 40 ? t('Moderate concern') : t('Low concern')}
            </div>
          </div>

          <button className="btn-primary" onClick={() => navigate('/tasks/sensory')}>
            Continue to sensory test →
          </button>
        </div>
      )}
    </div>
  )
}