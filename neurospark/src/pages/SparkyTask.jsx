import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import Sparky from '../components/Sparky'
import { computeGestureScore } from '../utils/speechAnalysis'

const TRIALS = [
  {
    id: 'wave',
    gesture: 'wave',
    instruction: 'Wave hello! 👋',
    prompt: 'wave hello',
    detect: 'wrist_oscillation',
    emoji: '👋'
  },
  {
    id: 'pointUp',
    gesture: 'pointUp',
    instruction: 'Point up! ☝️',
    prompt: 'point up',
    detect: 'wrist_above_shoulder',
    emoji: '☝️'
  },
  {
    id: 'touchHead',
    gesture: 'touchHead',
    instruction: 'Touch your head! 🤚',
    prompt: 'touch your head',
    detect: 'wrist_near_head',
    emoji: '🤚'
  }
]

const speak = (text, name = '') => {
  return new Promise(resolve => {
    window.speechSynthesis.cancel()
    const u = new SpeechSynthesisUtterance(text.replace('{name}', name))
    u.rate = 0.85
    u.pitch = 1.2
    u.volume = 1
    u.onend = resolve
    u.onerror = resolve
    window.speechSynthesis.speak(u)
  })
}

export default function SparkyTask() {
  const navigate = useNavigate()
  const { child, updateTaskResult, t } = useApp()
  const [phase, setPhase] = useState('intro')
  const [currentTrial, setCurrentTrial] = useState(0)
  const [gesture, setGesture] = useState('idle')
  const [speaking, setSpeaking] = useState(false)
  const [trialPhase, setTrialPhase] = useState('waiting')
  const [countdown, setCountdown] = useState(5)
  const [results, setResults] = useState([])
  const [feedback, setFeedback] = useState(null)
  const videoRef = useRef(null)
  const poseRef = useRef(null)
  const cameraRef = useRef(null)
  const trialStartRef = useRef(null)
  const wristHistoryRef = useRef([])
  const respondedRef = useRef(false)
  const streamRef = useRef(null)
  const trialPhaseRef = useRef('waiting')
  const currentTrialRef = useRef(0)
  const detectionFramesRef = useRef(0)
  const resultsRef = useRef([])

  const stopCamera = () => {
    if (cameraRef.current) cameraRef.current.stop()
    if (streamRef.current) streamRef.current.getTracks().forEach(t => t.stop())
  }

  const startCamera = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: 'user' }
    })
    streamRef.current = stream

    // Set phase first so video element renders
    setPhase('running')

    // Wait for React to render the video element
    await new Promise(r => setTimeout(r, 500))

    if (videoRef.current) {
      videoRef.current.srcObject = stream
      await videoRef.current.play().catch(() => { })
    }

    const pose = new window.Pose({
      locateFile: f => `https://cdn.jsdelivr.net/npm/@mediapipe/pose/${f}`
    })
    pose.setOptions({
      modelComplexity: 0,
      minDetectionConfidence: 0.5,
      minTrackingConfidence: 0.5
    })
    pose.onResults(onPoseResults)
    poseRef.current = pose

    const camera = new window.Camera(videoRef.current, {
      onFrame: async () => {
        if (poseRef.current && videoRef.current) {
          await poseRef.current.send({ image: videoRef.current })
        }
      },
      width: 320, height: 240
    })
    cameraRef.current = camera
    await camera.start()
  }

  const onPoseResults = (results) => {
    if (!results.poseLandmarks || trialPhaseRef.current !== 'detecting' || respondedRef.current) return
    const lms = results.poseLandmarks
    const leftWrist = lms[15]
    const rightWrist = lms[16]
    const leftShoulder = lms[11]
    const rightShoulder = lms[12]
    const nose = lms[0]

    if (!leftWrist || !rightWrist || !leftShoulder || !rightShoulder) return

    const trial = TRIALS[currentTrialRef.current]
    wristHistoryRef.current.push({ y: leftWrist.y, x: leftWrist.x, t: Date.now() })
    if (wristHistoryRef.current.length > 30) wristHistoryRef.current.shift()

    let detected = false

    if (trial.detect === 'wrist_oscillation') {
      const hist = wristHistoryRef.current
      if (hist.length > 10) {
        const xs = hist.map(h => h.x)
        const max = Math.max(...xs)
        const min = Math.min(...xs)
        if (max - min > 0.15) detected = true
      }
    }

    if (trial.detect === 'wrist_above_shoulder') {
      const avgShoulderY = (leftShoulder.y + rightShoulder.y) / 2
      if (leftWrist.y < avgShoulderY || rightWrist.y < avgShoulderY) detected = true
    }

    if (trial.detect === 'wrist_near_head') {
      const noseY = nose?.y || 0.2
      const noseX = nose?.x || 0.5
      const distL = Math.sqrt(Math.pow(leftWrist.x - noseX, 2) + Math.pow(leftWrist.y - noseY, 2))
      const distR = Math.sqrt(Math.pow(rightWrist.x - noseX, 2) + Math.pow(rightWrist.y - noseY, 2))
      if (distL < 0.3 || distR < 0.3) detected = true
    }

    if (detected) {
      detectionFramesRef.current += 1
      if (trial.detect === 'wrist_oscillation') {
        // Waving is dynamic, but require a few frames to ensure it's a deliberate wave
        if (detectionFramesRef.current >= 5 && !respondedRef.current) {
          respondedRef.current = true
          const latency = Date.now() - trialStartRef.current
          handleTrialResult(true, latency)
        }
      } else {
        // Static gestures require holding for 10 frames (~1s) to avoid early random triggers
        if (detectionFramesRef.current >= 10 && !respondedRef.current) {
          respondedRef.current = true
          const latency = Date.now() - trialStartRef.current
          handleTrialResult(true, latency)
        }
      }
    } else {
      detectionFramesRef.current = 0
    }
  }

  const handleTrialResult = (responded, latency = 5000) => {
    const actualTrialIdx = currentTrialRef.current;
    const trial = TRIALS[actualTrialIdx];
    if (!trial) return;

    const newResult = { id: trial.id, responded, latency };
    const newResults = [...resultsRef.current, newResult];
    resultsRef.current = newResults;
    setResults(newResults);

    setFeedback(responded ? 'great' : 'missed')

    setTimeout(() => {
      setFeedback(null)
      setGesture('idle')
      if (actualTrialIdx + 1 >= TRIALS.length) {
        stopCamera()
        const score = computeGestureScore(resultsRef.current)
        updateTaskResult('sparky', { trials: resultsRef.current, score })
        setPhase('done')
      } else {
        setCurrentTrial(prev => {
          const next = prev + 1;
          currentTrialRef.current = next;
          return next;
        })
        setTrialPhase('waiting')
        trialPhaseRef.current = 'waiting'
        wristHistoryRef.current = []
        respondedRef.current = false
      }
    }, 1500)
  }

  const runTrial = async (idx) => {
    const trial = TRIALS[idx]
    setSpeaking(true)
    setTrialPhase('showing')
    setGesture('happy')
    const name = child?.name || t('friend')
    await speak(`${t("Heyy")} ${name}, ${t("can you")} ${t(trial.prompt)}?`, name)
    setSpeaking(false)

    setTrialPhase('detecting')
    trialPhaseRef.current = 'detecting'
    trialStartRef.current = Date.now()
    respondedRef.current = false
    wristHistoryRef.current = []
    detectionFramesRef.current = 0

    let c = 10
    setCountdown(c)
    const timer = setInterval(() => {
      c -= 1
      setCountdown(c)
      if (c <= 0 || respondedRef.current) {
        clearInterval(timer)
        if (!respondedRef.current) handleTrialResult(false, 5000)
      }
    }, 1000)
  }

  useEffect(() => {
    if (phase === 'running' && trialPhase === 'waiting') {
      const t = setTimeout(() => runTrial(currentTrial), 500)
      return () => clearTimeout(t)
    }
  }, [phase, trialPhase, currentTrial])

  const startTask = async () => {
    try {
      await startCamera()
    } catch (e) {
      console.error(e)
      setPhase('error')
    }
  }

  const score = computeGestureScore(results)
  const responseRate = results.length > 0
    ? (results.filter(r => r.responded).length / results.length * 100).toFixed(0)
    : 0

  return (
    <div className="page">
      <div className="page-header">
        <div className="logo">Neuro<span>Spark</span></div>
      </div>

      <div style={{ display: 'flex', gap: '6px', padding: '0 20px 12px', background: '#fff' }}>
        {[t('Profile'), t('Gaze'), t('Handwriting'), t('Phonics'), t('Sparky'), t('Conversation'), t('Results')].map((s, i) => (
          <div key={i} style={{ flex: 1 }}>
            <div style={{ height: '3px', borderRadius: '2px', background: i <= 4 ? '#0A0A0A' : '#E5E5E5' }} />
          </div>
        ))}
      </div>

      {phase === 'intro' && (
        <div className="page-content">
          <div style={{ textAlign: 'center', marginBottom: '24px' }}>
            <Sparky gesture="wave" speaking={false} size={130} />
          </div>
          <h1 style={{ fontSize: '22px', fontWeight: '700', letterSpacing: '-0.5px', marginBottom: '8px' }}>
            {t('Meet Sparky! 🌟')}
          </h1>
          <p style={{ fontSize: '14px', color: '#737373', lineHeight: '1.7', marginBottom: '24px' }}>
            {t('Sparky is going to do some movements.')} {child?.name || t('the child')} {t('needs to watch carefully and copy each movement. There are 3 rounds — it only takes 2 minutes!')}
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '24px' }}>
            {TRIALS.map((tItem, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 14px', background: '#FAFAFA', borderRadius: '10px', border: '1px solid #F0F0F0' }}>
                <span style={{ fontSize: '20px' }}>{tItem.emoji}</span>
                <span style={{ fontSize: '13px', color: '#525252' }}>{t('Round')} {i + 1}: {t(tItem.instruction)}</span>
              </div>
            ))}
          </div>
          <button className="btn-primary" onClick={startTask}>{t('Start Sparky task')}</button>
        </div>
      )}

      {phase === 'loading' && (
        <div className="page-content" style={{ textAlign: 'center', paddingTop: '40px' }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>⏳</div>
          <p style={{ color: '#737373' }}>Starting camera...</p>
        </div>
      )}

      {phase === 'error' && (
        <div className="page-content">
          <div style={{ padding: '14px', background: '#FEF2F2', borderRadius: '10px', marginBottom: '16px', fontSize: '13px', color: '#DC2626' }}>
            {t('Camera access failed. Please allow camera access and try again.')}
          </div>
          <button className="btn-primary" onClick={() => setPhase('intro')}>{t('Try again')}</button>
        </div>
      )}

      {phase === 'running' && (
        <div className="page-content">
          <video ref={videoRef} style={{ display: 'none' }} autoPlay playsInline muted />

          {/* Live camera preview */}
          <div style={{
            position: 'relative',
            width: '100%',
            borderRadius: '12px',
            overflow: 'hidden',
            border: '2px solid #E5E5E5',
            marginBottom: '12px',
            background: '#000'
          }}>
            <video
              ref={videoRef}
              style={{
                width: '100%',
                height: '200px',
                objectFit: 'cover',
                transform: 'scaleX(-1)',
                display: 'block'
              }}
              autoPlay playsInline muted
            />
            {/* Live badge */}
            <div style={{
              position: 'absolute',
              top: '10px',
              left: '10px',
              display: 'flex',
              alignItems: 'center',
              gap: '5px',
              background: 'rgba(0,0,0,0.6)',
              padding: '4px 10px',
              borderRadius: '20px'
            }}>
              <div style={{
                width: '7px', height: '7px',
                borderRadius: '50%',
                background: '#22C55E',
                animation: 'pulse 1s infinite'
              }} />
              <span style={{ fontSize: '11px', color: '#fff', fontWeight: '600' }}>LIVE</span>
            </div>
            {/* Instruction overlay */}
            {trialPhase === 'detecting' && (
              <div style={{
                position: 'absolute',
                bottom: '10px',
                left: '50%',
                transform: 'translateX(-50%)',
                background: 'rgba(0,0,0,0.7)',
                color: '#fff',
                padding: '6px 14px',
                borderRadius: '20px',
                fontSize: '12px',
                fontWeight: '500',
                whiteSpace: 'nowrap'
              }}>
                {TRIALS[currentTrial]?.instruction}
              </div>
            )}
          </div>

          {/* Trial indicator */}
          <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
            {TRIALS.map((t, i) => (
              <div key={i} style={{
                flex: 1, height: '6px', borderRadius: '3px',
                background: i < currentTrial ? '#16A34A' : i === currentTrial ? '#0A0A0A' : '#E5E5E5'
              }} />
            ))}
          </div>

          {/* Sparky display */}
          <div style={{
            background: 'linear-gradient(135deg, #667eea15, #764ba215)',
            borderRadius: '16px', padding: '24px',
            display: 'flex', flexDirection: 'column', alignItems: 'center',
            marginBottom: '16px', border: '1px solid #E5E5E5'
          }}>
            {/* Speech bubble */}
            {trialPhase !== 'waiting' && (
              <div style={{
                background: '#fff', border: '2px solid #E5E5E5',
                borderRadius: '16px', padding: '10px 16px',
                fontSize: '13px', fontWeight: '500',
                maxWidth: '240px', textAlign: 'center',
                marginBottom: '16px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)'
              }}>
                {`${t("Heyy")} ${child?.name || t('friend')}, ${t("can you")} ${t(TRIALS[currentTrial]?.prompt)}?`}
              </div>
            )}

            <Sparky gesture={gesture} speaking={speaking} size={130} />

            {/* Countdown */}
            {trialPhase === 'detecting' && !feedback && (
              <div style={{
                marginTop: '16px', width: '48px', height: '48px',
                borderRadius: '50%', background: countdown <= 2 ? '#FEF2F2' : '#F5F5F5',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '20px', fontWeight: '700',
                color: countdown <= 2 ? '#DC2626' : '#0A0A0A'
              }}>
                {countdown}
              </div>
            )}

            {/* Feedback */}
            {feedback && (
              <div style={{
                marginTop: '16px', padding: '10px 20px',
                background: feedback === 'great' ? '#F0FDF4' : '#FEF2F2',
                border: `1px solid ${feedback === 'great' ? '#BBF7D0' : '#FECACA'}`,
                borderRadius: '10px', fontSize: '14px', fontWeight: '600',
                color: feedback === 'great' ? '#16A34A' : '#DC2626'
              }}>
                {feedback === 'great' ? t('🌟 Great job!') : t("⏰ Time's up — let's try the next one!")}
              </div>
            )}
          </div>

          {/* Progress */}
          <div style={{ fontSize: '13px', color: '#737373', textAlign: 'center' }}>
            {t('Round')} {currentTrial + 1} {t('out of')} {TRIALS.length}
          </div>
        </div>
      )}

      {phase === 'done' && (
        <div className="page-content">
          <div style={{ width: '40px', height: '40px', background: score > 50 ? '#FEF2F2' : '#F0FDF4', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px', fontSize: '20px' }}>
            {score > 50 ? '⚠️' : '✓'}
          </div>
          <h2 style={{ fontSize: '22px', fontWeight: '700', letterSpacing: '-0.5px', marginBottom: '8px' }}>{t('Sparky task complete!')}</h2>
          <p style={{ fontSize: '14px', color: '#737373', marginBottom: '20px' }}>
            {child?.name || t('the child')} {t('responded to')} {responseRate}% {t("of Sparky's gestures.")}
          </p>

          <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
            {results.map((r, i) => (
              <div key={i} style={{
                flex: 1, padding: '14px', borderRadius: '10px', textAlign: 'center',
                background: r.responded ? '#F0FDF4' : '#FEF2F2',
                border: `1px solid ${r.responded ? '#BBF7D0' : '#FECACA'}`
              }}>
                <div style={{ fontSize: '20px', marginBottom: '4px' }}>{TRIALS[i]?.emoji}</div>
                <div style={{ fontSize: '11px', fontWeight: '500', color: r.responded ? '#16A34A' : '#DC2626' }}>
                  {r.responded ? `${(r.latency / 1000).toFixed(1)}s` : t('No response')}
                </div>
              </div>
            ))}
          </div>

          <div style={{
            padding: '14px', marginBottom: '20px',
            background: score > 50 ? '#FEF2F2' : '#F0FDF4',
            border: `1px solid ${score > 50 ? '#FECACA' : '#BBF7D0'}`,
            borderRadius: '12px'
          }}>
            <div style={{ fontSize: '13px', fontWeight: '600', color: score > 50 ? '#DC2626' : '#16A34A', marginBottom: '4px' }}>
              {score > 50 ? t('⚠ Delayed or absent imitation response detected') : t('✓ Imitation response within normal range')}
            </div>
            <div style={{ fontSize: '13px', color: '#525252', lineHeight: '1.6' }}>
              {score > 50
                ? t('Reduced or delayed imitation of social gestures is associated with ASD social communication differences.')
                : t('Gesture imitation appeared typical for this age group.')}
            </div>
          </div>

          <button className="btn-primary" onClick={() => navigate('/tasks/conversation')}>
            {t('Continue to conversation task →')}
          </button>
        </div>
      )}
    </div>
  )
}