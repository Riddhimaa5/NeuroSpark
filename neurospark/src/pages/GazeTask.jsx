import { useEffect, useRef, useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useApp } from '../context/AppContext'

const TASK_DURATION = 30

export default function GazeTask() {
  const navigate = useNavigate()
  const { child, updateTaskResult, t } = useApp()
  const videoRef = useRef(null)
  const canvasRef = useRef(null)
  const heatmapRef = useRef(null)
  const gazeDataRef = useRef([])
  const animFrameRef = useRef(null)
  const faceMeshRef = useRef(null)
  const cameraRef = useRef(null)

  const [phase, setPhase] = useState('intro') // intro | running | done
  const [timeLeft, setTimeLeft] = useState(TASK_DURATION)
  const [gazeRegion, setGazeRegion] = useState(null) // 'face' | 'object'
  const [results, setResults] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  // Heatmap points stored as {x, y, region}
  const heatPoints = useRef([])

  const computeResults = useCallback(() => {
    const data = gazeDataRef.current
    if (data.length === 0) return { faceDwell: 50, objectDwell: 50, saccadeCount: 0 }
    const faceFrames = data.filter(d => d.region === 'face').length
    const total = data.length
    const faceDwell = Math.round((faceFrames / total) * 100)
    const objectDwell = 100 - faceDwell

    // Count saccades (rapid gaze shifts)
    let saccades = 0
    for (let i = 1; i < data.length; i++) {
      const dx = data[i].x - data[i - 1].x
      const dy = data[i].y - data[i - 1].y
      const dist = Math.sqrt(dx * dx + dy * dy)
      if (dist > 0.08) saccades++
    }
    return { faceDwell, objectDwell, saccadeCount: saccades }
  }, [])

  const finishTask = useCallback(() => {
    if (cameraRef.current) cameraRef.current.stop()
    if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current)
    const res = computeResults()
    setResults(res)
    updateTaskResult('gaze', res)
    setPhase('done')
  }, [computeResults, updateTaskResult])

const startTask = async () => {
  setLoading(true)
  setError(null)

  try {
    const stream = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: 'user', width: 320, height: 240 }
    })

    setLoading(false)
    setPhase('running')

    await new Promise(resolve => setTimeout(resolve, 500))

    if (videoRef.current) {
      videoRef.current.srcObject = stream
      await videoRef.current.play().catch(() => {})
    }

    // Use window globals loaded from CDN
    const faceMesh = new window.FaceMesh({
      locateFile: (file) =>
        `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/${file}`
    })

    faceMesh.setOptions({
      maxNumFaces: 1,
      refineLandmarks: true,
      minDetectionConfidence: 0.5,
      minTrackingConfidence: 0.5
    })

    faceMesh.onResults((results) => {
      if (!results.multiFaceLandmarks?.length) return
      const landmarks = results.multiFaceLandmarks[0]
      const leftIris = landmarks[468]
      const rightIris = landmarks[473]
      if (!leftIris || !rightIris) return
      const irisX = (leftIris.x + rightIris.x) / 2
      const region = irisX > 0.5 ? 'face' : 'object'
      setGazeRegion(region)
      gazeDataRef.current.push({ x: leftIris.x, y: leftIris.y, region })
      heatPoints.current.push({
        x: irisX,
        y: (leftIris.y + rightIris.y) / 2,
        region
      })
      drawHeatmap()
    })

    faceMeshRef.current = faceMesh

    const camera = new window.Camera(videoRef.current, {
      onFrame: async () => {
        if (faceMeshRef.current && videoRef.current) {
          await faceMeshRef.current.send({ image: videoRef.current })
        }
      },
      width: 320,
      height: 240
    })

    cameraRef.current = camera
    await camera.start()

    let timeRemaining = TASK_DURATION
    const timer = setInterval(() => {
      timeRemaining -= 1
      setTimeLeft(timeRemaining)
      if (timeRemaining <= 0) {
        clearInterval(timer)
        stream.getTracks().forEach(t => t.stop())
        finishTask()
      }
    }, 1000)

  } catch (err) {
    console.error(err)
    setLoading(false)
    setPhase('intro')
    if (err.name === 'NotAllowedError') {
      setError('Camera permission denied. Please allow camera access.')
    } else if (err.name === 'NotFoundError') {
      setError('No camera found on this device.')
    } else {
      setError(`Error: ${err.message}`)
    }
  }
}

  const drawHeatmap = () => {
    const canvas = heatmapRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    const W = canvas.width
    const H = canvas.height
    ctx.clearRect(0, 0, W, H)

    heatPoints.current.slice(-80).forEach(p => {
      const x = p.x * W
      const y = p.y * H
      const isObject = p.region === 'object'
      const grad = ctx.createRadialGradient(x, y, 0, x, y, 40)
      if (isObject) {
        grad.addColorStop(0, 'rgba(239,68,68,0.35)')
        grad.addColorStop(1, 'rgba(239,68,68,0)')
      } else {
        grad.addColorStop(0, 'rgba(59,130,246,0.35)')
        grad.addColorStop(1, 'rgba(59,130,246,0)')
      }
      ctx.fillStyle = grad
      ctx.beginPath()
      ctx.arc(x, y, 40, 0, Math.PI * 2)
      ctx.fill()
    })
  }

  useEffect(() => {
    return () => {
      if (cameraRef.current) cameraRef.current.stop()
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current)
    }
  }, [])

  const asdFlag = results && results.objectDwell > 60

  return (
    <div className="page">

      {/* Header */}
      <div className="page-header">
        <div className="logo">Neuro<span>Spark</span></div>
        <div style={{ flex: 1 }} />
        {phase === 'running' && (
          <div style={{
            display: 'flex', alignItems: 'center', gap: '8px',
            background: timeLeft <= 10 ? '#FEF2F2' : '#F5F5F5',
            padding: '6px 14px', borderRadius: '20px'
          }}>
            <div style={{
              width: '6px', height: '6px', borderRadius: '50%',
              background: timeLeft <= 10 ? '#DC2626' : '#16A34A',
              animation: 'pulse 1s infinite'
            }} />
            <span style={{
              fontSize: '13px', fontWeight: '600',
              color: timeLeft <= 10 ? '#DC2626' : '#0A0A0A'
            }}>{timeLeft}s</span>
          </div>
        )}
      </div>

      {/* Progress bar */}
      <div style={{ display: 'flex', gap: '6px', padding: '0 20px 0', background: '#fff', paddingBottom: '12px' }}>
        {[t('Profile'), t('Gaze'), t('Handwriting'), t('Phonics'), t('Results')].map((s, i) => (
          <div key={i} style={{ flex: 1 }}>
            <div style={{
              height: '3px', borderRadius: '2px',
              background: i <= 1 ? '#0A0A0A' : '#E5E5E5'
            }} />
          </div>
        ))}
      </div>

      {/* INTRO PHASE */}
      {phase === 'intro' && (
        <div className="page-content">
          <div style={{ marginBottom: '32px', marginTop: '8px' }}>
            <div style={{
              width: '40px', height: '40px', background: '#F5F5F5',
              borderRadius: '10px', display: 'flex', alignItems: 'center',
              justifyContent: 'center', marginBottom: '16px', fontSize: '20px'
            }}>👁️</div>
            <h1 style={{
              fontSize: '24px', fontWeight: '700',
              letterSpacing: '-0.5px', marginBottom: '10px'
            }}>{t('Gaze tracking task')}</h1>
            <p style={{ fontSize: '14px', color: '#737373', lineHeight: '1.7' }}>
              {child?.name || t('Child')} {t('will see two images side by side — a face and a pattern. We\'ll track where their eyes move using the front camera. The task takes 30 seconds.')}
            </p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '32px' }}>
            {[
              { icon: '📷', text: t('Allow camera access when prompted') },
              { icon: '💡', text: t('Make sure the room is well lit') },
              { icon: '👤', text: t('Hold the screen at eye level for the child') },
              { icon: '🔇', text: t('Minimise distractions around them') },
            ].map((tip, i) => (
              <div key={i} style={{
                display: 'flex', gap: '12px', alignItems: 'flex-start',
                padding: '12px 14px', background: '#FAFAFA',
                borderRadius: '10px', border: '1px solid #F0F0F0'
              }}>
                <span style={{ fontSize: '16px' }}>{tip.icon}</span>
                <span style={{ fontSize: '13px', color: '#525252', lineHeight: '1.5' }}>{tip.text}</span>
              </div>
            ))}
          </div>

          {error && (
            <div style={{
              padding: '12px 14px', background: '#FEF2F2',
              border: '1px solid #FECACA', borderRadius: '8px',
              fontSize: '13px', color: '#DC2626', marginBottom: '16px'
            }}>{t(error)}</div>
          )}

          <button
            className="btn-primary"
            onClick={startTask}
            disabled={loading}
          >
            {loading ? t('Starting camera...') : t('Start gaze task')}
          </button>
        </div>
      )}

      {/* RUNNING PHASE */}
      {phase === 'running' && (
        <div style={{ padding: '16px 20px' }}>

          {/* Live camera feed — small */}
          <div style={{
            display: 'flex', justifyContent: 'flex-end', marginBottom: '12px'
          }}>
            <div style={{
              position: 'relative', width: '100px', height: '75px',
              borderRadius: '10px', overflow: 'hidden',
              border: '2px solid #E5E5E5'
            }}>
              <video
                ref={videoRef}
                style={{ width: '100%', height: '100%', objectFit: 'cover', transform: 'scaleX(-1)' }}
                autoPlay playsInline muted
              />
              <div style={{
                position: 'absolute', bottom: '4px', left: '4px',
                display: 'flex', alignItems: 'center', gap: '3px',
                background: 'rgba(0,0,0,0.5)', padding: '2px 6px',
                borderRadius: '4px'
              }}>
                <div style={{
                  width: '5px', height: '5px', borderRadius: '50%',
                  background: '#22C55E'
                }} />
                <span style={{ fontSize: '9px', color: '#fff', fontWeight: '600' }}>LIVE</span>
              </div>
            </div>
          </div>

          {/* Stimulus area */}
          <div style={{
            position: 'relative',
            border: '1px solid #E5E5E5',
            borderRadius: '16px', overflow: 'hidden',
            marginBottom: '16px'
          }}>
            <div style={{ display: 'flex', height: '260px' }}>

              {/* Face side */}
              <div style={{
                flex: 1,
                background: gazeRegion === 'face' ? '#EFF6FF' : '#FAFAFA',
                display: 'flex', flexDirection: 'column',
                alignItems: 'center', justifyContent: 'center',
                borderRight: '1px solid #E5E5E5',
                transition: 'background 0.2s ease',
                padding: '20px'
              }}>
                <div style={{ fontSize: '72px', marginBottom: '8px' }}>😊</div>
                <span style={{
                  fontSize: '11px', fontWeight: '500',
                  color: gazeRegion === 'face' ? '#2563EB' : '#A3A3A3',
                  textTransform: 'uppercase', letterSpacing: '0.5px'
                }}>{t('Human face')}</span>
                {gazeRegion === 'face' && (
                  <div style={{
                    marginTop: '8px', width: '6px', height: '6px',
                    borderRadius: '50%', background: '#2563EB'
                  }} />
                )}
              </div>

              {/* Object side */}
              <div style={{
                flex: 1,
                background: gazeRegion === 'object' ? '#FEF2F2' : '#FAFAFA',
                display: 'flex', flexDirection: 'column',
                alignItems: 'center', justifyContent: 'center',
                transition: 'background 0.2s ease',
                padding: '20px'
              }}>
                <div style={{ fontSize: '64px', marginBottom: '8px' }}>⬡</div>
                <span style={{
                  fontSize: '11px', fontWeight: '500',
                  color: gazeRegion === 'object' ? '#DC2626' : '#A3A3A3',
                  textTransform: 'uppercase', letterSpacing: '0.5px'
                }}>{t('Geometric pattern')}</span>
                {gazeRegion === 'object' && (
                  <div style={{
                    marginTop: '8px', width: '6px', height: '6px',
                    borderRadius: '50%', background: '#DC2626'
                  }} />
                )}
              </div>
            </div>

            {/* Heatmap overlay */}
            <canvas
              ref={heatmapRef}
              width={800}
              height={260}
              style={{
                position: 'absolute', top: 0, left: 0,
                width: '100%', height: '100%',
                pointerEvents: 'none'
              }}
            />
          </div>

          {/* Progress */}
          <div style={{ marginBottom: '12px' }}>
            <div style={{
              display: 'flex', justifyContent: 'space-between',
              fontSize: '12px', color: '#737373', marginBottom: '6px'
            }}>
              <span>{t('Recording gaze...')}</span>
              <span>{TASK_DURATION - timeLeft}s / {TASK_DURATION}s</span>
            </div>
            <div style={{
              height: '4px', background: '#F0F0F0', borderRadius: '2px'
            }}>
              <div style={{
                height: '100%', borderRadius: '2px',
                background: '#0A0A0A',
                width: `${((TASK_DURATION - timeLeft) / TASK_DURATION) * 100}%`,
                transition: 'width 1s linear'
              }} />
            </div>
          </div>

          {/* Live dwell indicator */}
          <div style={{
            display: 'flex', gap: '8px'
          }}>
            <div style={{
              flex: 1, padding: '10px', background: '#EFF6FF',
              borderRadius: '8px', textAlign: 'center'
            }}>
              <div style={{ fontSize: '11px', color: '#2563EB', fontWeight: '500' }}>{t('Face attention')}</div>
              <div style={{ fontSize: '18px', fontWeight: '700', color: '#1D4ED8' }}>
                {gazeDataRef.current.length > 0
                  ? Math.round((gazeDataRef.current.filter(d => d.region === 'face').length / gazeDataRef.current.length) * 100)
                  : 0}%
              </div>
            </div>
            <div style={{
              flex: 1, padding: '10px', background: '#FEF2F2',
              borderRadius: '8px', textAlign: 'center'
            }}>
              <div style={{ fontSize: '11px', color: '#DC2626', fontWeight: '500' }}>{t('Object attention')}</div>
              <div style={{ fontSize: '18px', fontWeight: '700', color: '#DC2626' }}>
                {gazeDataRef.current.length > 0
                  ? Math.round((gazeDataRef.current.filter(d => d.region === 'object').length / gazeDataRef.current.length) * 100)
                  : 0}%
              </div>
            </div>
          </div>
        </div>
      )}

      {/* DONE PHASE */}
      {phase === 'done' && results && (
        <div className="page-content">
          <div style={{ marginBottom: '24px', marginTop: '8px' }}>
            <div style={{
              width: '40px', height: '40px',
              background: asdFlag ? '#FEF2F2' : '#F0FDF4',
              borderRadius: '10px', display: 'flex', alignItems: 'center',
              justifyContent: 'center', marginBottom: '16px', fontSize: '20px'
            }}>
              {asdFlag ? '⚠️' : '✓'}
            </div>
            <h2 style={{
              fontSize: '22px', fontWeight: '700',
              letterSpacing: '-0.5px', marginBottom: '8px'
            }}>{t('Gaze task complete')}</h2>
            <p style={{ fontSize: '14px', color: '#737373' }}>
              {t('Here\'s what we observed in')} {child?.name || t('the child')}'s {t('gaze pattern.')}
            </p>
          </div>

          {/* Result cards */}
          <div style={{ display: 'flex', gap: '10px', marginBottom: '16px' }}>
            <div style={{
              flex: 1, padding: '16px',
              background: '#EFF6FF', borderRadius: '12px'
            }}>
              <div style={{ fontSize: '11px', color: '#2563EB', fontWeight: '500', marginBottom: '4px' }}>
                Face attention
              </div>
              <div style={{ fontSize: '28px', fontWeight: '700', color: '#1D4ED8', letterSpacing: '-1px' }}>
                {results.faceDwell}%
              </div>
            </div>
            <div style={{
              flex: 1, padding: '16px',
              background: asdFlag ? '#FEF2F2' : '#F0FDF4',
              borderRadius: '12px'
            }}>
              <div style={{
                fontSize: '11px', fontWeight: '500', marginBottom: '4px',
                color: asdFlag ? '#DC2626' : '#16A34A'
              }}>
                Object attention
              </div>
              <div style={{
                fontSize: '28px', fontWeight: '700', letterSpacing: '-1px',
                color: asdFlag ? '#DC2626' : '#16A34A'
              }}>
                {results.objectDwell}%
              </div>
            </div>
          </div>

          {/* Flag */}
          <div style={{
            padding: '16px',
            background: asdFlag ? '#FEF2F2' : '#F0FDF4',
            border: `1px solid ${asdFlag ? '#FECACA' : '#BBF7D0'}`,
            borderRadius: '12px',
            marginBottom: '24px'
          }}>
            <div style={{
              fontSize: '13px', fontWeight: '600',
              color: asdFlag ? '#DC2626' : '#16A34A',
              marginBottom: '6px'
            }}>
              {asdFlag ? t('⚠ Reduced social attention detected') : t('✓ Social attention within normal range')}
            </div>
            <div style={{ fontSize: '13px', color: '#525252', lineHeight: '1.6' }}>
              {asdFlag
                ? `${child?.name || t('The child')} ${t('spent')} ${results.objectDwell}% ${t('of time looking at the geometric pattern vs')} ${results.faceDwell}% ${t('on the face. Typically developing children prefer faces. This pattern is associated with ASD social attention differences.')}`
                : `${child?.name || t('The child')} ${t('showed a typical social attention pattern, preferring to look at the human face over the geometric pattern.')}`
              }
            </div>
          </div>

          <button
            className="btn-primary"
            onClick={() => navigate('/tasks/stroke')}
          >
            {t('Continue to handwriting task →')}
          </button>
        </div>
      )}

    </div>
  )
}