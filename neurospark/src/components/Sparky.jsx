export default function Sparky({ gesture = 'idle', speaking = false, size = 200, name = 'friend' }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <style>{`
        @keyframes sparkBounce {
          0%,100%{transform:translateY(0)} 50%{transform:translateY(-8px)}
        }
        @keyframes sparkWaveLeft {
          0%,100%{transform:rotate(0deg)} 25%{transform:rotate(-50deg)} 75%{transform:rotate(-50deg)}
        }
        @keyframes sparkPointUp {
          0%{transform:rotate(0deg)} 100%{transform:rotate(-130deg)}
        }
        @keyframes sparkTouchHead {
          0%{transform:rotate(0deg)} 100%{transform:rotate(-130deg)}
        }
        @keyframes sparkIdle {
          0%,100%{transform:rotate(5deg)} 50%{transform:rotate(-5deg)}
        }
        @keyframes sparkExcited {
          0%,100%{transform:rotate(-30deg)} 50%{transform:rotate(30deg)}
        }
        @keyframes sparkBlink {
          0%,85%,100%{transform:scaleY(1)} 90%{transform:scaleY(0.05)}
        }
        @keyframes sparkGlow {
          0%,100%{r:10px;opacity:1} 50%{r:14px;opacity:0.7}
        }
        @keyframes sparkMouth {
          0%,100%{d:path('M38 62 Q50 72 62 62')} 50%{d:path('M40 64 Q50 70 60 64')}
        }
        @keyframes sparkSparkle {
          0%,100%{opacity:0;transform:scale(0)} 50%{opacity:1;transform:scale(1)}
        }
        @keyframes sparkFloat {
          0%,100%{transform:translateY(0) rotate(0deg)} 50%{transform:translateY(-4px) rotate(5deg)}
        }
      `}</style>

      <div style={{
        animation: 'sparkBounce 2s ease-in-out infinite',
        position: 'relative',
        width: size,
        height: size * 1.3
      }}>
        <svg viewBox="0 0 200 260" xmlns="http://www.w3.org/2000/svg"
          style={{ width: '100%', height: '100%' }}>
          <defs>
            <radialGradient id={`bodyG${size}`} cx="40%" cy="35%">
              <stop offset="0%" stopColor="#A78BFA"/>
              <stop offset="100%" stopColor="#7C3AED"/>
            </radialGradient>
            <radialGradient id={`faceG${size}`} cx="40%" cy="35%">
              <stop offset="0%" stopColor="#C4B5FD"/>
              <stop offset="100%" stopColor="#8B5CF6"/>
            </radialGradient>
            <radialGradient id={`eyeG${size}`} cx="35%" cy="35%">
              <stop offset="0%" stopColor="#60A5FA"/>
              <stop offset="100%" stopColor="#2563EB"/>
            </radialGradient>
            <radialGradient id={`cheekG${size}`} cx="50%" cy="50%">
              <stop offset="0%" stopColor="#FDA4AF" stopOpacity="0.8"/>
              <stop offset="100%" stopColor="#FDA4AF" stopOpacity="0"/>
            </radialGradient>
            <filter id={`glow${size}`}>
              <feGaussianBlur stdDeviation="2.5" result="blur"/>
              <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
            </filter>
          </defs>

          {/* Antenna */}
          <line x1="100" y1="30" x2="100" y2="55" stroke="#8B5CF6" strokeWidth="4" strokeLinecap="round"/>
          <circle cx="100" cy="22" r="11" fill="#FFD700" filter={`url(#glow${size})`}
            style={{ animation: 'sparkGlow 1.5s ease-in-out infinite' }}/>
          <circle cx="100" cy="22" r="7" fill="#FFF9C4"/>
          <text x="100" y="26" textAnchor="middle" fontSize="9" fill="#F59E0B" fontWeight="bold">★</text>

          {/* Body */}
          <rect x="65" y="145" width="70" height="78" rx="22" fill={`url(#bodyG${size})`}/>
          <ellipse cx="85" cy="160" rx="12" ry="7" fill="white" opacity="0.15"/>

          {/* Badge */}
          <circle cx="100" cy="178" r="15" fill="#FFD700" filter={`url(#glow${size})`}/>
          <circle cx="100" cy="178" r="11" fill="#FEF9C3"/>
          <text x="100" y="183" textAnchor="middle" fontSize="14" fill="#F59E0B">⚡</text>

          {/* Left arm */}
          <g style={{
            transformOrigin: '88px 148px',
            animation: gesture === 'wave'
              ? 'sparkWaveLeft 0.5s ease-in-out infinite'
              : gesture === 'touchHead'
              ? 'sparkTouchHead 0.5s ease forwards'
              : gesture === 'excited'
              ? 'sparkExcited 0.3s ease-in-out infinite'
              : 'sparkIdle 2s ease-in-out infinite'
          }}>
            <rect x="40" y="143" width="30" height="16" rx="8" fill="#7C3AED"/>
            <circle cx="36" cy="151" r="13" fill="#A78BFA"/>
            <circle cx="29" cy="145" r="5.5" fill="#C4B5FD"/>
            <circle cx="42" cy="142" r="5.5" fill="#C4B5FD"/>
            <circle cx="36" cy="141" r="5.5" fill="#C4B5FD"/>
            <circle cx="28" cy="153" r="4.5" fill="#C4B5FD"/>
            <circle cx="43" cy="157" r="4.5" fill="#C4B5FD"/>
          </g>

          {/* Right arm */}
          <g style={{
            transformOrigin: '112px 148px',
            animation: gesture === 'pointUp'
              ? 'sparkPointUp 0.5s ease forwards'
              : gesture === 'touchHead'
              ? 'sparkTouchHead 0.5s ease forwards'
              : gesture === 'excited'
              ? 'sparkExcited 0.3s ease-in-out infinite'
              : 'sparkIdle 2s ease-in-out infinite',
            animationDelay: gesture === 'excited' ? '0.15s' : '0s'
          }}>
            <rect x="130" y="143" width="30" height="16" rx="8" fill="#7C3AED"/>
            <circle cx="164" cy="151" r="13" fill="#A78BFA"/>
            <circle cx="171" cy="145" r="5.5" fill="#C4B5FD"/>
            <circle cx="158" cy="142" r="5.5" fill="#C4B5FD"/>
            <circle cx="164" cy="141" r="5.5" fill="#C4B5FD"/>
            <circle cx="172" cy="153" r="4.5" fill="#C4B5FD"/>
            <circle cx="157" cy="157" r="4.5" fill="#C4B5FD"/>
          </g>

          {/* Legs */}
          <rect x="72" y="218" width="23" height="33" rx="11" fill="#6D28D9"/>
          <rect x="105" y="218" width="23" height="33" rx="11" fill="#6D28D9"/>
          <ellipse cx="84" cy="252" rx="17" ry="10" fill="#5B21B6"/>
          <ellipse cx="116" cy="252" rx="17" ry="10" fill="#5B21B6"/>

          {/* Head */}
          <ellipse cx="100" cy="105" rx="53" ry="53" fill={`url(#bodyG${size})`}/>
          <ellipse cx="82" cy="82" rx="14" ry="10" fill="white" opacity="0.18"
            style={{ transform: 'rotate(-30deg)', transformOrigin: '82px 82px' }}/>

          {/* Face plate */}
          <ellipse cx="100" cy="108" rx="42" ry="40" fill={`url(#faceG${size})`}/>

          {/* Left eye */}
          <ellipse cx="82" cy="100" rx="17" ry="19" fill="white"/>
          <ellipse cx="82" cy="92" rx="17" ry="8" fill="#E0D7FF" opacity="0.5"/>
          <ellipse cx="82" cy="103" rx="12" ry="13" fill={`url(#eyeG${size})`}
            style={{ animation: 'sparkBlink 4s ease-in-out infinite' }}/>
          <ellipse cx="84" cy="104" rx="7" ry="8" fill="#1a1a2e"
            style={{ animation: 'sparkBlink 4s ease-in-out infinite' }}/>
          <circle cx="89" cy="98" r="3.5" fill="white" opacity="0.95"/>
          <circle cx="80" cy="107" r="1.8" fill="white" opacity="0.7"/>
          <path d="M67 89 Q72 83 78 87" stroke="#4C1D95" strokeWidth="2.5" fill="none" strokeLinecap="round"/>
          <path d="M80 85 Q84 79 89 84" stroke="#4C1D95" strokeWidth="2.5" fill="none" strokeLinecap="round"/>
          <path d="M91 86 Q96 81 98 86" stroke="#4C1D95" strokeWidth="2.5" fill="none" strokeLinecap="round"/>

          {/* Right eye */}
          <ellipse cx="118" cy="100" rx="17" ry="19" fill="white"/>
          <ellipse cx="118" cy="92" rx="17" ry="8" fill="#E0D7FF" opacity="0.5"/>
          <ellipse cx="118" cy="103" rx="12" ry="13" fill={`url(#eyeG${size})`}
            style={{ animation: 'sparkBlink 4s ease-in-out infinite', animationDelay: '0.1s' }}/>
          <ellipse cx="120" cy="104" rx="7" ry="8" fill="#1a1a2e"
            style={{ animation: 'sparkBlink 4s ease-in-out infinite', animationDelay: '0.1s' }}/>
          <circle cx="125" cy="98" r="3.5" fill="white" opacity="0.95"/>
          <circle cx="116" cy="107" r="1.8" fill="white" opacity="0.7"/>
          <path d="M103 89 Q108 83 114 87" stroke="#4C1D95" strokeWidth="2.5" fill="none" strokeLinecap="round"/>
          <path d="M116 85 Q120 79 125 84" stroke="#4C1D95" strokeWidth="2.5" fill="none" strokeLinecap="round"/>
          <path d="M127 86 Q132 81 134 86" stroke="#4C1D95" strokeWidth="2.5" fill="none" strokeLinecap="round"/>

          {/* Nose */}
          <ellipse cx="100" cy="115" rx="5" ry="3.5" fill="#6D28D9" opacity="0.5"/>

          {/* Mouth */}
          {speaking ? (
            <ellipse cx="100" cy="128" rx="14" ry="8" fill="white" opacity="0.9"
              style={{ animation: 'sparkMouth 0.25s ease-in-out infinite' }}/>
          ) : gesture === 'excited' ? (
            <path d="M83 124 Q100 140 117 124" stroke="white" strokeWidth="3.5" fill="none" strokeLinecap="round"/>
          ) : (
            <path d="M86 124 Q100 136 114 124" stroke="white" strokeWidth="3" fill="none" strokeLinecap="round"/>
          )}

          {/* Cheeks */}
          <ellipse cx="67" cy="118" rx="15" ry="11" fill={`url(#cheekG${size})`}/>
          <ellipse cx="133" cy="118" rx="15" ry="11" fill={`url(#cheekG${size})`}/>

          {/* Sparkles */}
          <text x="18" y="75" fontSize="14" fill="#FFD700" opacity="0.9"
            style={{ animation: 'sparkFloat 2s ease-in-out infinite' }}>✦</text>
          <text x="168" y="85" fontSize="11" fill="#FF6B9D" opacity="0.8"
            style={{ animation: 'sparkFloat 2.5s ease-in-out infinite', animationDelay: '0.5s' }}>✦</text>
          <text x="22" y="195" fontSize="10" fill="#60A5FA" opacity="0.7"
            style={{ animation: 'sparkFloat 1.8s ease-in-out infinite', animationDelay: '1s' }}>✦</text>
          <text x="162" y="190" fontSize="13" fill="#34D399" opacity="0.8"
            style={{ animation: 'sparkFloat 2.2s ease-in-out infinite', animationDelay: '0.3s' }}>✦</text>
        </svg>
      </div>

      {/* Name tag */}
      <div style={{
        background: 'linear-gradient(135deg, #FF6B9D, #FF8E53)',
        color: '#fff',
        fontSize: size * 0.075,
        fontWeight: '700',
        padding: `${size * 0.03}px ${size * 0.1}px`,
        borderRadius: size * 0.06,
        letterSpacing: '0.5px',
        boxShadow: '0 3px 12px rgba(255,107,157,0.4)',
        fontFamily: 'Inter, sans-serif',
        marginTop: '-10px'
      }}>
        ✨ Sparky!
      </div>
    </div>
  )
}