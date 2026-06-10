import { useState, useRef, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useApp } from '../context/AppContext'

const SOUNDS = [
    {
        id: 'low', label: 'Soft Sound', emoji: '🎵',
        desc: 'Gentle wind chimes', level: 1,
        color: '#16A34A', bg: '#F0FDF4', border: '#BBF7D0',
        generate: (ctx) => {
            [523, 659, 784, 1047].forEach((freq, i) => {
                const osc = ctx.createOscillator()
                const gain = ctx.createGain()
                osc.type = 'sine'
                osc.frequency.value = freq
                gain.gain.setValueAtTime(0, ctx.currentTime)
                gain.gain.linearRampToValueAtTime(0.07, ctx.currentTime + 0.1 + i * 0.15)
                gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 2 + i * 0.3)
                osc.connect(gain); gain.connect(ctx.destination)
                osc.start(ctx.currentTime + i * 0.1)
                osc.stop(ctx.currentTime + 2.5 + i * 0.3)
            })
        }
    },
    {
        id: 'medium', label: 'Medium Sound', emoji: '🎶',
        desc: 'Playful melody', level: 2,
        color: '#D97706', bg: '#FFFBEB', border: '#FCD34D',
        generate: (ctx) => {
            [[523, 0], [659, 0.18], [784, 0.36], [1047, 0.54], [784, 0.72], [659, 0.9]].forEach(([freq, t]) => {
                const osc = ctx.createOscillator()
                const gain = ctx.createGain()
                osc.type = 'triangle'
                osc.frequency.value = freq
                gain.gain.setValueAtTime(0, ctx.currentTime + t)
                gain.gain.linearRampToValueAtTime(0.35, ctx.currentTime + t + 0.04)
                gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + t + 0.17)
                osc.connect(gain); gain.connect(ctx.destination)
                osc.start(ctx.currentTime + t); osc.stop(ctx.currentTime + t + 0.2)
            })
        }
    },
    {
        id: 'loud', label: 'Loud Sound', emoji: '📢',
        desc: 'Sudden loud burst', level: 3,
        color: '#DC2626', bg: '#FEF2F2', border: '#FECACA',
        generate: (ctx) => {
            const buf = ctx.createBuffer(1, ctx.sampleRate * 0.5, ctx.sampleRate)
            const data = buf.getChannelData(0)
            for (let i = 0; i < data.length; i++) data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / data.length, 1.5)
            const src = ctx.createBufferSource()
            const gain = ctx.createGain()
            const filt = ctx.createBiquadFilter()
            filt.type = 'bandpass'; filt.frequency.value = 900; filt.Q.value = 0.6
            gain.gain.value = 3
            src.buffer = buf; src.connect(filt); filt.connect(gain); gain.connect(ctx.destination); src.start()
            const osc = ctx.createOscillator()
            const og = ctx.createGain()
            osc.type = 'square'; osc.frequency.value = 660
            og.gain.setValueAtTime(0.7, ctx.currentTime)
            og.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.9)
            osc.connect(og); og.connect(ctx.destination); osc.start(); osc.stop(ctx.currentTime + 0.9)
        }
    }
]

const REACTION_DEFS = {
    ear_cover: { label: 'Ear Covering', icon: '🙉', color: '#DC2626', bg: '#FEF2F2', severity: 'High', desc: 'Child covered ears — strong sensory sensitivity' },
    head_away: { label: 'Head Moving Away', icon: '↩️', color: '#D97706', bg: '#FFFBEB', severity: 'Moderate', desc: 'Child moved head away from sound' },
    startle: { label: 'Startle Response', icon: '😱', color: '#DC2626', bg: '#FEF2F2', severity: 'High', desc: 'Sudden movement detected after sound onset' },
    agitation: { label: 'Body Agitation', icon: '😣', color: '#D97706', bg: '#FFFBEB', severity: 'Moderate', desc: 'Increased body movement indicating discomfort' },
    calm: { label: 'No Reaction', icon: '😊', color: '#16A34A', bg: '#F0FDF4', severity: 'Low', desc: 'Child appeared comfortable with the sound' },
}

const computeSensitivity = (results) => {
    const highCount = results.filter(r => ['ear_cover', 'startle'].includes(r.reaction)).length
    const modCount = results.filter(r => ['head_away', 'agitation'].includes(r.reaction)).length

    // Autistic children often show heightened sensitivity specifically to loud sounds
    const loudReacted = results.some(r => r.sound.id === 'loud' && r.reaction !== 'calm')

    if (highCount >= 2 || loudReacted) return { level: 'High', score: 85, desc: 'Strong sensory sensitivity detected (heightened response to loud sounds)' }
    if (highCount === 1 || modCount >= 2) return { level: 'Moderate', score: 55, desc: 'Some sensory sensitivity noted — monitor response patterns' }
    return { level: 'Low', score: 20, desc: 'No significant sensory sensitivity detected at tested levels' }
}

export default function SensoryTask() {
    const navigate = useNavigate()
    const { child, updateTaskResult } = useApp()

    const [phase, setPhase] = useState('intro')
    const [soundIdx, setSoundIdx] = useState(0)
    const [playing, setPlaying] = useState(false)
    const [countdown, setCountdown] = useState(5)
    const [currentReaction, setCurrentReaction] = useState('calm')
    const [confidence, setConfidence] = useState(0)
    const [results, setResults] = useState([])
    const [sensitivity, setSensitivity] = useState(null)

    const videoRef = useRef(null)
    const canvasRef = useRef(null)
    const streamRef = useRef(null)
    const poseRef = useRef(null)
    const faceMeshRef = useRef(null)
    const cameraRef = useRef(null)
    const audioCtxRef = useRef(null)
    const frameBufferRef = useRef([])
    const baselineNoseRef = useRef(null)
    const prevNoseRef = useRef(null)
    const timerRef = useRef(null)
    const resultsRef = useRef([])
    const soundIdxRef = useRef(0)

    const name = child?.name || 'the child'

    const drawLandmark = (ctx2, lm, color, r, w, h) => {
        if (!lm) return
        ctx2.fillStyle = color
        ctx2.beginPath()
        ctx2.arc(lm.x * w, lm.y * h, r, 0, Math.PI * 2)
        ctx2.fill()
    }

    const onPoseResults = useCallback((results) => {
        if (!results.poseLandmarks) return
        const lms = results.poseLandmarks
        const lWrist = lms[15], rWrist = lms[16]
        const lEar = lms[7], rEar = lms[8]
        const nose = lms[0]
        const lShoulder = lms[11], rShoulder = lms[12]
        if (!nose) return

        if (!baselineNoseRef.current) {
            baselineNoseRef.current = { x: nose.x, y: nose.y }
        }

        const dist = (a, b) => Math.sqrt((a.x - b.x) ** 2 + (a.y - b.y) ** 2)

        let frame = { earCover: false, headAway: false, startle: false, agitation: false }

        // Ear covering — wrist exactly on/near ear
        if (lWrist && lEar && dist(lWrist, lEar) < 0.2) frame.earCover = true
        if (rWrist && rEar && dist(rWrist, rEar) < 0.2) frame.earCover = true
        // Also check wrist tightly near head sides
        if (lWrist && nose && lWrist.y < nose.y && dist(lWrist, nose) < 0.25) frame.earCover = true
        if (rWrist && nose && rWrist.y < nose.y && dist(rWrist, nose) < 0.25) frame.earCover = true

        // Head away from baseline (strict)
        if (baselineNoseRef.current) {
            const shift = dist(nose, baselineNoseRef.current)
            if (shift > 0.1) frame.headAway = true
        }

        // Startle — rapid, sudden nose movement between consecutive frames
        if (prevNoseRef.current) {
            const sudden = dist(nose, prevNoseRef.current)
            if (sudden > 0.08) frame.startle = true
        }

        // Agitation — shoulder variance
        if (lShoulder) {
            const buf = frameBufferRef.current
            if (buf.length >= 8) {
                const lYs = buf.slice(-8).map(f => f.lShY || 0)
                const avg = lYs.reduce((s, v) => s + v, 0) / lYs.length
                const variance = lYs.reduce((s, v) => s + Math.abs(v - avg), 0) / lYs.length
                if (variance > 0.012) frame.agitation = true
            }
        }

        frame.lShY = lShoulder?.y || 0
        prevNoseRef.current = { x: nose.x, y: nose.y }
        frameBufferRef.current = [...frameBufferRef.current.slice(-19), frame]

        // Multi-frame validation — need 6 of last 10 frames
        const buf10 = frameBufferRef.current.slice(-10)
        const counts = {
            earCover: buf10.filter(f => f.earCover).length,
            headAway: buf10.filter(f => f.headAway).length,
            startle: buf10.filter(f => f.startle).length,
            agitation: buf10.filter(f => f.agitation).length,
        }

        let reaction = 'calm', conf = 0
        if (counts.earCover >= 5) { reaction = 'ear_cover'; conf = counts.earCover / 10 }
        else if (counts.startle >= 4) { reaction = 'startle'; conf = counts.startle / 10 }
        else if (counts.headAway >= 5) { reaction = 'head_away'; conf = counts.headAway / 10 }
        else if (counts.agitation >= 5) { reaction = 'agitation'; conf = counts.agitation / 10 }
        else {
            const maxCount = Math.max(counts.earCover, counts.headAway, counts.startle, counts.agitation)
            conf = maxCount / 10
        }

        setCurrentReaction(reaction)
        setConfidence(Math.round(conf * 100))

        // Draw on canvas
        const canvas = canvasRef.current
        if (canvas) {
            const ctx2 = canvas.getContext('2d')
            const w = canvas.width, h = canvas.height
            ctx2.clearRect(0, 0, w, h)
            drawLandmark(ctx2, nose, '#34D399', 7, w, h)
            drawLandmark(ctx2, lWrist, frame.earCover ? '#EF4444' : '#60A5FA', 8, w, h)
            drawLandmark(ctx2, rWrist, frame.earCover ? '#EF4444' : '#60A5FA', 8, w, h)
            drawLandmark(ctx2, lEar, '#A78BFA', 5, w, h)
            drawLandmark(ctx2, rEar, '#A78BFA', 5, w, h)
            drawLandmark(ctx2, lShoulder, '#FCD34D', 5, w, h)
            drawLandmark(ctx2, rShoulder, '#FCD34D', 5, w, h)

            // Connection lines
            ctx2.strokeStyle = 'rgba(255,255,255,0.3)'
            ctx2.lineWidth = 2
            if (lWrist && lEar) {
                ctx2.beginPath()
                ctx2.moveTo(lWrist.x * w, lWrist.y * h)
                ctx2.lineTo(lEar.x * w, lEar.y * h)
                ctx2.stroke()
            }
            if (rWrist && rEar) {
                ctx2.beginPath()
                ctx2.moveTo(rWrist.x * w, rWrist.y * h)
                ctx2.lineTo(rEar.x * w, rEar.y * h)
                ctx2.stroke()
            }

            // Reaction label on canvas
            ctx2.fillStyle = reaction !== 'calm' ? 'rgba(220,38,38,0.85)' : 'rgba(22,163,74,0.85)'
            ctx2.beginPath()
            ctx2.roundRect(8, 8, 160, 28, 6)
            ctx2.fill()
            ctx2.fillStyle = '#fff'
            ctx2.font = 'bold 12px Inter, sans-serif'
            ctx2.fillText(`${REACTION_DEFS[reaction].icon} ${REACTION_DEFS[reaction].label}`, 14, 26)
        }
    }, [])

    const startCamera = async () => {
        const stream = await navigator.mediaDevices.getUserMedia({
            video: { facingMode: 'user', width: 480, height: 360 }
        })
        streamRef.current = stream
        setPhase('running')
        await new Promise(r => setTimeout(r, 600))

        if (videoRef.current) {
            videoRef.current.srcObject = stream
            await videoRef.current.play().catch(() => { })
        }

        if (!window.Pose) return

        const pose = new window.Pose({
            locateFile: f => `https://cdn.jsdelivr.net/npm/@mediapipe/pose/${f}`
        })
        pose.setOptions({ modelComplexity: 0, minDetectionConfidence: 0.5, minTrackingConfidence: 0.5 })
        pose.onResults(onPoseResults)
        poseRef.current = pose

        const cam = new window.Camera(videoRef.current, {
            onFrame: async () => {
                if (poseRef.current && videoRef.current) {
                    await poseRef.current.send({ image: videoRef.current })
                }
            },
            width: 480, height: 360
        })
        cameraRef.current = cam
        await cam.start()
    }

    const stopCamera = () => {
        if (cameraRef.current) { try { cameraRef.current.stop() } catch (e) { } }
        if (streamRef.current) streamRef.current.getTracks().forEach(t => t.stop())
    }

    const finishSound = useCallback((idx) => {
        clearInterval(timerRef.current)
        setPlaying(false)

        const buf = frameBufferRef.current.slice(-10)
        const counts = {
            earCover: buf.filter(f => f.earCover).length,
            headAway: buf.filter(f => f.headAway).length,
            startle: buf.filter(f => f.startle).length,
            agitation: buf.filter(f => f.agitation).length,
        }

        let finalReaction = 'calm', finalConf = 0
        if (counts.earCover >= 5) { finalReaction = 'ear_cover'; finalConf = counts.earCover / 10 }
        else if (counts.startle >= 4) { finalReaction = 'startle'; finalConf = counts.startle / 10 }
        else if (counts.headAway >= 5) { finalReaction = 'head_away'; finalConf = counts.headAway / 10 }
        else if (counts.agitation >= 5) { finalReaction = 'agitation'; finalConf = counts.agitation / 10 }

        const result = {
            sound: SOUNDS[idx],
            reaction: finalReaction,
            confidence: Math.round(finalConf * 100),
            frames: frameBufferRef.current.length,
        }

        const newResults = [...resultsRef.current, result]
        resultsRef.current = newResults
        setResults(newResults)

        if (idx + 1 >= SOUNDS.length) {
            stopCamera()
            const sens = computeSensitivity(newResults)
            updateTaskResult('sensory', { results: newResults, sensitivity: sens })
            setSensitivity(sens)
            setPhase('done')
        } else {
            const nextIdx = idx + 1
            setSoundIdx(nextIdx)
            soundIdxRef.current = nextIdx
            setTimeout(() => playSound(nextIdx), 2000)
        }
    }, [updateTaskResult])

    const playSound = useCallback((idx) => {
        if (!audioCtxRef.current) {
            audioCtxRef.current = new (window.AudioContext || window.webkitAudioContext)()
        }
        const ctx = audioCtxRef.current
        if (ctx.state === 'suspended') ctx.resume()

        frameBufferRef.current = []
        baselineNoseRef.current = null
        prevNoseRef.current = null
        setCurrentReaction('calm')
        setConfidence(0)
        setPlaying(true)
        setSoundIdx(idx)

        SOUNDS[idx].generate(ctx)

        let c = 5
        setCountdown(c)
        timerRef.current = setInterval(() => {
            c -= 1
            setCountdown(c)
            if (c <= 0) {
                clearInterval(timerRef.current)
                finishSound(idx)
            }
        }, 1000)
    }, [finishSound])

    const startTask = async () => {
        setPhase('loading')
        resultsRef.current = []
        try {
            await startCamera()
            setTimeout(() => playSound(0), 1500)
        } catch (e) {
            console.error(e)
            setPhase('error')
        }
    }

    useEffect(() => () => {
        stopCamera()
        clearInterval(timerRef.current)
        if (audioCtxRef.current) audioCtxRef.current.close()
    }, [])

    const senColors = { High: '#DC2626', Moderate: '#D97706', Low: '#16A34A' }
    const senBgs = { High: '#FEF2F2', Moderate: '#FFFBEB', Low: '#F0FDF4' }
    const senBorders = { High: '#FECACA', Moderate: '#FCD34D', Low: '#BBF7D0' }

    return (
        <div className="page">
            <div className="page-header">
                <div className="logo">Neuro<span>Spark</span></div>
            </div>

            <div style={{ display: 'flex', gap: '6px', padding: '0 20px 12px', background: '#fff' }}>
                {['Profile', 'Gaze', 'Writing', 'Phonics', 'Sparky', 'Chat', 'Sensory', 'Results'].map((_, i) => (
                    <div key={i} style={{ flex: 1 }}>
                        <div style={{ height: '3px', borderRadius: '2px', background: i <= 6 ? '#0A0A0A' : '#E5E5E5' }} />
                    </div>
                ))}
            </div>

            {/* INTRO */}
            {phase === 'intro' && (
                <div className="page-content">
                    <div style={{ width: '40px', height: '40px', background: '#F5F5F5', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '14px', fontSize: '20px' }}>👂</div>
                    <h1 style={{ fontSize: '22px', fontWeight: '700', letterSpacing: '-0.5px', marginBottom: '8px' }}>Sensory Response Test</h1>
                    <p style={{ fontSize: '14px', color: '#737373', lineHeight: '1.7', marginBottom: '20px' }}>
                        We will play <strong>3 sounds</strong> at different volumes. The camera automatically watches {name}'s reactions — <strong>no touching required</strong>.
                    </p>
                    {SOUNDS.map((s, i) => (
                        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 14px', background: s.bg, borderRadius: '10px', border: `1px solid ${s.border}`, marginBottom: '8px' }}>
                            <span style={{ fontSize: '20px' }}>{s.emoji}</span>
                            <div>
                                <div style={{ fontSize: '13px', fontWeight: '600', color: s.color }}>{s.label}</div>
                                <div style={{ fontSize: '11px', color: '#737373' }}>{s.desc}</div>
                            </div>
                            <div style={{ marginLeft: 'auto', display: 'flex', gap: '3px', alignItems: 'flex-end' }}>
                                {Array(s.level).fill(0).map((_, j) => (
                                    <div key={j} style={{ width: '6px', height: `${10 + j * 6}px`, borderRadius: '3px', background: s.color }} />
                                ))}
                            </div>
                        </div>
                    ))}
                    <div style={{ padding: '12px 14px', background: '#EFF6FF', border: '1px solid #BFDBFE', borderRadius: '10px', fontSize: '13px', color: '#1D4ED8', marginBottom: '20px', marginTop: '4px' }}>
                        📷 The camera detects ear covering, head movement, startle and agitation automatically
                    </div>
                    <button className="btn-primary" onClick={startTask}>Start sensory test</button>
                </div>
            )}

            {/* LOADING */}
            {phase === 'loading' && (
                <div className="page-content" style={{ textAlign: 'center', paddingTop: '60px' }}>
                    <div style={{ fontSize: '48px', marginBottom: '16px' }}>⏳</div>
                    <p style={{ color: '#737373' }}>Starting camera...</p>
                </div>
            )}

            {/* ERROR */}
            {phase === 'error' && (
                <div className="page-content">
                    <div style={{ padding: '14px', background: '#FEF2F2', borderRadius: '10px', marginBottom: '16px', fontSize: '13px', color: '#DC2626' }}>
                        Camera failed. Please allow camera access and try again.
                    </div>
                    <button className="btn-primary" onClick={() => setPhase('intro')}>Try again</button>
                </div>
            )}

            {/* RUNNING */}
            {phase === 'running' && (
                <div className="page-content">
                    <div style={{ display: 'flex', gap: '8px', marginBottom: '14px' }}>
                        {SOUNDS.map((s, i) => (
                            <div key={i} style={{ flex: 1, padding: '8px', borderRadius: '8px', textAlign: 'center', background: i < soundIdx ? '#F0FDF4' : i === soundIdx ? '#0A0A0A' : '#F5F5F5' }}>
                                <span style={{ fontSize: '16px' }}>{i < soundIdx ? '✓' : s.emoji}</span>
                            </div>
                        ))}
                    </div>

                    {/* Camera feed with canvas overlay */}
                    <div style={{ position: 'relative', borderRadius: '14px', overflow: 'hidden', marginBottom: '14px', border: '1.5px solid #E5E5E5', background: '#000' }}>
                        <video
                            ref={videoRef}
                            style={{ width: '100%', height: '220px', objectFit: 'cover', transform: 'scaleX(-1)', display: 'block' }}
                            autoPlay playsInline muted
                        />
                        <canvas
                            ref={canvasRef}
                            width={480} height={360}
                            style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none', transform: 'scaleX(-1)' }}
                        />
                        <div style={{ position: 'absolute', top: '10px', right: '10px', display: 'flex', alignItems: 'center', gap: '5px', background: 'rgba(0,0,0,0.65)', padding: '4px 10px', borderRadius: '20px' }}>
                            <div style={{ width: '7px', height: '7px', borderRadius: '50%', background: playing ? '#EF4444' : '#22C55E', animation: 'pulse 1s infinite' }} />
                            <span style={{ fontSize: '11px', color: '#fff', fontWeight: '600' }}>{playing ? 'DETECTING' : 'READY'}</span>
                        </div>

                        {/* Countdown circle */}
                        {playing && (
                            <div style={{ position: 'absolute', bottom: '10px', right: '10px', width: '44px', height: '44px', borderRadius: '50%', background: countdown <= 2 ? 'rgba(220,38,38,0.85)' : 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '2px solid rgba(255,255,255,0.4)' }}>
                                <span style={{ fontSize: '16px', fontWeight: '700', color: '#fff' }}>{countdown}</span>
                            </div>
                        )}
                    </div>

                    {/* Current sound */}
                    <div style={{ background: SOUNDS[soundIdx]?.bg || '#FAFAFA', border: `1px solid ${SOUNDS[soundIdx]?.border || '#E5E5E5'}`, borderRadius: '12px', padding: '14px', marginBottom: '12px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                            <div>
                                <div style={{ fontSize: '13px', fontWeight: '600' }}>{SOUNDS[soundIdx]?.emoji} {SOUNDS[soundIdx]?.label}</div>
                                <div style={{ fontSize: '11px', color: '#737373' }}>{SOUNDS[soundIdx]?.desc}</div>
                            </div>
                            {playing && <div style={{ fontSize: '12px', fontWeight: '600', color: SOUNDS[soundIdx]?.color }}>▶ Playing</div>}
                        </div>
                        <div style={{ display: 'flex', alignItems: 'flex-end', gap: '3px', height: '36px' }}>
                            {Array(14).fill(0).map((_, i) => {
                                const level = SOUNDS[soundIdx]?.level || 0
                                const threshold = level === 1 ? 5 : level === 2 ? 9 : 14
                                return (
                                    <div key={i} style={{ flex: 1, height: `${14 + i * 1.6}px`, borderRadius: '2px', background: playing && i < threshold ? SOUNDS[soundIdx]?.color : '#E5E5E5', transition: 'background 0.15s' }} />
                                )
                            })}
                        </div>
                    </div>

                    {/* Reaction + confidence */}
                    <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
                        <div style={{ flex: 1, padding: '12px', background: REACTION_DEFS[currentReaction].bg, border: `1px solid ${currentReaction !== 'calm' ? '#FECACA' : '#BBF7D0'}`, borderRadius: '10px' }}>
                            <div style={{ fontSize: '11px', color: '#737373', marginBottom: '4px' }}>Detected reaction</div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                <span style={{ fontSize: '18px' }}>{REACTION_DEFS[currentReaction].icon}</span>
                                <span style={{ fontSize: '13px', fontWeight: '600', color: REACTION_DEFS[currentReaction].color }}>{REACTION_DEFS[currentReaction].label}</span>
                            </div>
                        </div>
                        <div style={{ flex: 1, padding: '12px', background: '#F5F5F5', borderRadius: '10px' }}>
                            <div style={{ fontSize: '11px', color: '#737373', marginBottom: '4px' }}>Confidence</div>
                            <div style={{ fontSize: '22px', fontWeight: '700', color: confidence > 60 ? '#DC2626' : confidence > 30 ? '#D97706' : '#16A34A' }}>
                                {confidence}%
                            </div>
                            <div style={{ height: '4px', background: '#E5E5E5', borderRadius: '2px', marginTop: '6px' }}>
                                <div style={{ height: '100%', borderRadius: '2px', width: `${confidence}%`, background: confidence > 60 ? '#DC2626' : confidence > 30 ? '#D97706' : '#16A34A', transition: 'width 0.3s ease' }} />
                            </div>
                        </div>
                    </div>

                    <p style={{ fontSize: '11px', color: '#A3A3A3', textAlign: 'center' }}>
                        Watching {name} automatically — no input needed
                    </p>
                </div>
            )}

            {/* DONE */}
            {phase === 'done' && sensitivity && (
                <div className="page-content">
                    <div style={{ width: '40px', height: '40px', background: senBgs[sensitivity.level], borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '14px', fontSize: '20px' }}>
                        {sensitivity.level === 'High' ? '⚠️' : sensitivity.level === 'Moderate' ? '⚡' : '✓'}
                    </div>
                    <h2 style={{ fontSize: '22px', fontWeight: '700', letterSpacing: '-0.5px', marginBottom: '6px' }}>
                        Sensory test complete
                    </h2>
                    <p style={{ fontSize: '14px', color: '#737373', marginBottom: '16px' }}>
                        {name}'s sensory sensitivity profile:
                    </p>

                    {/* Sensitivity summary */}
                    <div style={{ padding: '18px', background: senBgs[sensitivity.level], border: `1px solid ${senBorders[sensitivity.level]}`, borderRadius: '14px', marginBottom: '16px', textAlign: 'center' }}>
                        <div style={{ fontSize: '28px', fontWeight: '700', letterSpacing: '-1px', color: senColors[sensitivity.level], marginBottom: '6px' }}>
                            {sensitivity.level} Sensitivity
                        </div>
                        <div style={{ fontSize: '13px', color: '#525252', lineHeight: '1.6' }}>{sensitivity.desc}</div>
                        <div style={{ marginTop: '12px', height: '6px', background: '#E5E5E5', borderRadius: '3px', overflow: 'hidden' }}>
                            <div style={{ height: '100%', borderRadius: '3px', width: `${sensitivity.score}%`, background: senColors[sensitivity.level], transition: 'width 1s ease' }} />
                        </div>
                        <div style={{ fontSize: '11px', color: '#737373', marginTop: '4px' }}>Sensitivity score: {sensitivity.score}/100</div>
                    </div>

                    {/* Per-sound results */}
                    <div style={{ fontSize: '11px', fontWeight: '600', color: '#A3A3A3', letterSpacing: '1px', textTransform: 'uppercase', marginBottom: '10px' }}>
                        Results per sound
                    </div>

                    {results.map((r, i) => {
                        const rd = REACTION_DEFS[r.reaction]
                        return (
                            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 14px', background: rd.bg, border: `1px solid ${rd.color}30`, borderRadius: '10px', marginBottom: '8px' }}>
                                <span style={{ fontSize: '22px' }}>{r.sound.emoji}</span>
                                <div style={{ flex: 1 }}>
                                    <div style={{ fontSize: '13px', fontWeight: '600', marginBottom: '2px' }}>{r.sound.label}</div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                                        <span style={{ fontSize: '14px' }}>{rd.icon}</span>
                                        <span style={{ fontSize: '12px', fontWeight: '500', color: rd.color }}>{rd.label}</span>
                                    </div>
                                    <div style={{ fontSize: '11px', color: '#737373', marginTop: '2px' }}>{rd.desc}</div>
                                </div>
                                <div style={{ textAlign: 'right', flexShrink: 0 }}>
                                    <div style={{ fontSize: '10px', color: '#A3A3A3' }}>Confidence</div>
                                    <div style={{ fontSize: '15px', fontWeight: '700', color: rd.color }}>{r.confidence}%</div>
                                </div>
                            </div>
                        )
                    })}

                    <div style={{ padding: '12px 14px', background: '#FAFAFA', border: '1px solid #F0F0F0', borderRadius: '10px', fontSize: '12px', color: '#737373', lineHeight: '1.6', marginBottom: '20px', marginTop: '4px' }}>
                        ⚠️ This is a screening indicator only. A specialist assessment is required for clinical diagnosis.
                    </div>

                    <button className="btn-primary" onClick={() => navigate('/scores')} style={{ marginBottom: '10px' }}>
                        View full results →
                    </button>
                </div>
            )}

            {/* Fallback if done but sensitivity not set */}
            {phase === 'done' && !sensitivity && (
                <div className="page-content" style={{ textAlign: 'center', paddingTop: '60px' }}>
                    <div style={{ fontSize: '48px', marginBottom: '16px' }}>✓</div>
                    <h2 style={{ fontSize: '20px', fontWeight: '700', marginBottom: '16px' }}>Sensory test complete!</h2>
                    <button className="btn-primary" onClick={() => navigate('/scores')}>View full results →</button>
                </div>
            )}
        </div>
    )
}