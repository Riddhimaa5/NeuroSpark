import { useRef, useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useApp } from '../context/AppContext'
const LETTERS = [
  {
    letter: 'b',
    instruction: 'Write the lowercase letter as you normally would.',
  },
  {
    letter: 'd',
    instruction: 'Write the lowercase letter as you normally would.',
  },
  {
    letter: 'p',
    instruction: 'Write the lowercase letter as you normally would.',
  },
  {
    letter: 'q',
    instruction: 'Write the lowercase letter as you normally would.',
  },
]

const analyzeDrawing = (strokes, letter) => {
  const allPoints = strokes.flat()
  if (allPoints.length === 0) return false

  const minX = Math.min(...allPoints.map(p => p.x))
  const maxX = Math.max(...allPoints.map(p => p.x))
  const minY = Math.min(...allPoints.map(p => p.y))
  const maxY = Math.max(...allPoints.map(p => p.y))

  const midX = (minX + maxX) / 2
  const midY = (minY + maxY) / 2

  let tl = 0, tr = 0, bl = 0, br = 0

  allPoints.forEach(p => {
    if (p.x < midX && p.y < midY) tl++
    else if (p.x >= midX && p.y < midY) tr++
    else if (p.x < midX && p.y >= midY) bl++
    else if (p.x >= midX && p.y >= midY) br++
  })

  // Find the quadrant with the absolute minimum points
  const quadrants = [
    { name: 'tl', count: tl },
    { name: 'tr', count: tr },
    { name: 'bl', count: bl },
    { name: 'br', count: br }
  ]
  quadrants.sort((a, b) => a.count - b.count)
  const emptyQuad = quadrants[0].name

  // Reversal logic based on expected empty quadrant
  if (letter === 'b') {
    // Expected empty: TR. Reversed (d) empty: TL.
    return emptyQuad === 'tl'
  } else if (letter === 'd') {
    // Expected empty: TL. Reversed (b) empty: TR.
    return emptyQuad === 'tr'
  } else if (letter === 'p') {
    // Expected empty: BR. Reversed (q) empty: BL.
    return emptyQuad === 'bl'
  } else if (letter === 'q') {
    // Expected empty: BL. Reversed (p) empty: BR.
    return emptyQuad === 'br'
  }
  return false
}

export default function StrokeTask() {
  const navigate = useNavigate()
  const { child, updateTaskResult, t } = useApp()
  const canvasRef = useRef(null)
  const [currentIdx, setCurrentIdx] = useState(0)
  const [isDrawing, setIsDrawing] = useState(false)
  const [strokes, setStrokes] = useState([])
  const [currentStroke, setCurrentStroke] = useState([])
  const [results, setResults] = useState([])
  const [phase, setPhase] = useState('task')
  const strokesRef = useRef([])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    ctx.strokeStyle = '#0A0A0A'
    ctx.lineWidth = 4
    ctx.lineCap = 'round'
    ctx.lineJoin = 'round'
    strokesRef.current.forEach(stroke => {
      if (stroke.length < 2) return
      ctx.beginPath()
      ctx.moveTo(stroke[0].x, stroke[0].y)
      stroke.forEach(p => ctx.lineTo(p.x, p.y))
      ctx.stroke()
    })
    if (currentStroke.length > 1) {
      ctx.beginPath()
      ctx.moveTo(currentStroke[0].x, currentStroke[0].y)
      currentStroke.forEach(p => ctx.lineTo(p.x, p.y))
      ctx.stroke()
    }
  }, [strokes, currentStroke])

  const getPos = (e, canvas) => {
    const rect = canvas.getBoundingClientRect()
    const clientX = e.touches ? e.touches[0].clientX : e.clientX
    const clientY = e.touches ? e.touches[0].clientY : e.clientY
    return {
      x: (clientX - rect.left) * (canvas.width / rect.width),
      y: (clientY - rect.top) * (canvas.height / rect.height),
      t: Date.now()
    }
  }

  const startDraw = (e) => {
    e.preventDefault()
    setIsDrawing(true)
    const pos = getPos(e, canvasRef.current)
    setCurrentStroke([pos])
  }

  const draw = (e) => {
    e.preventDefault()
    if (!isDrawing) return
    const pos = getPos(e, canvasRef.current)
    setCurrentStroke(prev => [...prev, pos])
  }

  const endDraw = (e) => {
    e.preventDefault()
    if (!isDrawing) return
    setIsDrawing(false)
    const newStrokes = [...strokesRef.current, currentStroke]
    strokesRef.current = newStrokes
    setStrokes(newStrokes)
    setCurrentStroke([])
  }

  const handleClear = () => {
    strokesRef.current = []
    setStrokes([])
    setCurrentStroke([])
    const canvas = canvasRef.current
    if (canvas) canvas.getContext('2d').clearRect(0, 0, canvas.width, canvas.height)
  }

  const handleDone = () => {
    if (strokesRef.current.length === 0) return
    const letter = LETTERS[currentIdx]
    const wasReversed = analyzeDrawing(strokesRef.current, letter.letter)
    handleJudgement(wasReversed)
  }

  const handleJudgement = (wasReversed) => {
    const letter = LETTERS[currentIdx]
    const newResult = {
      letter: letter.letter,
      reversed: wasReversed,
    }
    const newResults = [...results, newResult]

    strokesRef.current = []
    setStrokes([])
    setCurrentStroke([])
    const canvas = canvasRef.current
    if (canvas) canvas.getContext('2d').clearRect(0, 0, canvas.width, canvas.height)

    if (currentIdx + 1 >= LETTERS.length) {
      const reversalRate = newResults.filter(r => r.reversed).length / newResults.length
      updateTaskResult('stroke', {
        reversalRate,
        lettersAttempted: newResults.length,
        reversals: newResults.filter(r => r.reversed).length,
        details: newResults
      })
      setResults(newResults)
      setPhase('done')
    } else {
      setResults(newResults)
      setCurrentIdx(currentIdx + 1)
    }
  }

  const current = LETTERS[currentIdx]
  const reversalCount = results.filter(r => r.reversed).length
  const reversalRate = results.length > 0 ? reversalCount / results.length : 0

  return (
    <div className="page">
      <div className="page-header">
        <div className="logo">Neuro<span>Spark</span></div>
      </div>

      <div style={{ display: 'flex', gap: '6px', padding: '0 20px 12px', background: '#fff' }}>
        {[t('Profile'), t('Gaze'), t('Handwriting'), t('Phonics'), t('Results')].map((s, i) => (
          <div key={i} style={{ flex: 1 }}>
            <div style={{ height: '3px', borderRadius: '2px', background: i <= 2 ? '#0A0A0A' : '#E5E5E5' }} />
          </div>
        ))}
      </div>

      {phase === 'task' && (
        <div className="page-content">

          {/* Letter indicator */}
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
            {LETTERS.map((l, i) => (
              <div key={i} style={{
                width: '48px', height: '48px', borderRadius: '10px',
                background: i < currentIdx ? '#F0FDF4' : i === currentIdx ? '#0A0A0A' : '#F5F5F5',
                color: i < currentIdx ? '#16A34A' : i === currentIdx ? '#fff' : '#A3A3A3',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '18px', fontWeight: '700'
              }}>
                {i < currentIdx ? '✓' : l.letter.toUpperCase()}
              </div>
            ))}
          </div>

          {/* Instruction */}
          <div style={{ marginBottom: '12px' }}>
            <div style={{ width: '40px', height: '40px', background: '#F5F5F5', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '10px', fontSize: '20px' }}>✏️</div>
            <h1 style={{ fontSize: '22px', fontWeight: '700', letterSpacing: '-0.5px', marginBottom: '6px' }}>
              {t('Write the letter')} <span style={{ color: '#2563EB' }}>{current.letter.toUpperCase()}</span>
            </h1>
            <p style={{ fontSize: '14px', color: '#737373', lineHeight: '1.6' }}>
              {t(current.instruction)}
            </p>
          </div>

          {/* Visual guide + canvas side by side */}
          <div style={{ display: 'flex', gap: '12px', marginBottom: '12px', alignItems: 'flex-start' }}>

            {/* Letter reference card */}
            <div style={{
              width: '90px', flexShrink: 0,
              border: '1.5px solid #E5E5E5',
              borderRadius: '12px',
              background: '#fff',
              padding: '12px 8px',
              display: 'flex', flexDirection: 'column',
              alignItems: 'center', gap: '8px'
            }}>
              <div style={{ fontSize: '10px', fontWeight: '600', color: '#A3A3A3', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                {t('Example')}
              </div>
              <div style={{
                fontSize: '72px', fontWeight: '700',
                color: '#0A0A0A', lineHeight: 1,
                fontFamily: 'Georgia, serif'
              }}>
                {current.letter}
              </div>
            </div>

            {/* Canvas */}
            <div style={{ flex: 1, position: 'relative' }}>
              <canvas
                ref={canvasRef}
                width={800} height={320}
                style={{
                  width: '100%', height: '220px',
                  border: '1.5px solid #E5E5E5',
                  borderRadius: '12px',
                  background: '#FAFAFA',
                  cursor: 'crosshair',
                  touchAction: 'none'
                }}
                onMouseDown={startDraw} onMouseMove={draw}
                onMouseUp={endDraw} onMouseLeave={endDraw}
                onTouchStart={startDraw} onTouchMove={draw} onTouchEnd={endDraw}
              />
            </div>

          </div>

          {/* Controls */}
          <div style={{ display: 'flex', gap: '8px' }}>
            <button className="btn-secondary" onClick={handleClear} style={{ flex: 1 }}>
              {t('Clear')}
            </button>
            <button
              className="btn-primary"
              onClick={handleDone}
              disabled={strokes.length === 0}
              style={{ flex: 2 }}
            >
              {t('Done')} →
            </button>
          </div>
        </div>
      )}

      {phase === 'done' && (
        <div className="page-content">
          <div style={{
            width: '40px', height: '40px',
            background: reversalRate > 0.5 ? '#FEF2F2' : '#F0FDF4',
            borderRadius: '10px', display: 'flex', alignItems: 'center',
            justifyContent: 'center', marginBottom: '16px', fontSize: '20px'
          }}>
            {reversalRate > 0.5 ? '⚠️' : '✓'}
          </div>

          <h2 style={{ fontSize: '22px', fontWeight: '700', letterSpacing: '-0.5px', marginBottom: '8px' }}>
            {t('Handwriting complete')}
          </h2>
          <p style={{ fontSize: '14px', color: '#737373', marginBottom: '20px' }}>
            {reversalCount} {t('out of')} {results.length} {t('letters showed reversal patterns.')}
          </p>

          <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
            {results.map((r, i) => (
              <div key={i} style={{
                flex: 1, padding: '12px', borderRadius: '10px', textAlign: 'center',
                background: r.reversed ? '#FEF2F2' : '#F0FDF4',
                border: `1px solid ${r.reversed ? '#FECACA' : '#BBF7D0'}`
              }}>
                <div style={{
                  fontSize: '20px', fontWeight: '700',
                  color: r.reversed ? '#DC2626' : '#16A34A'
                }}>
                  {r.letter.toUpperCase()}
                </div>
                <div style={{
                  fontSize: '10px', fontWeight: '500', marginTop: '4px',
                  color: r.reversed ? '#DC2626' : '#16A34A'
                }}>
                  {r.reversed ? t('Reversed') : t('Correct')}
                </div>
              </div>
            ))}
          </div>

          <div style={{
            padding: '14px', marginBottom: '20px',
            background: reversalRate > 0.5 ? '#FEF2F2' : '#F0FDF4',
            border: `1px solid ${reversalRate > 0.5 ? '#FECACA' : '#BBF7D0'}`,
            borderRadius: '12px'
          }}>
            <div style={{
              fontSize: '13px', fontWeight: '600',
              color: reversalRate > 0.5 ? '#DC2626' : '#16A34A',
              marginBottom: '4px'
            }}>
              {reversalRate > 0.5 ? t('⚠ Letter reversals detected') : t('✓ Letter formation within normal range')}
            </div>
            <div style={{ fontSize: '13px', color: '#525252', lineHeight: '1.6' }}>
              {reversalRate > 0.5
                ? `${Math.round(reversalRate * 100)}% ${t('reversal rate. This pattern is associated with phonological dyslexia and dysgraphia.')}`
                : t('Letter formation appears typical for this age group.')}
            </div>
          </div>

          <button className="btn-primary" onClick={() => navigate('/tasks/phonics')}>
            {t('Continue to phonics task')} →
          </button>
        </div>
      )}
    </div>
  )
}