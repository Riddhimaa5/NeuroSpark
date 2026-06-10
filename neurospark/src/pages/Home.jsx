import { useNavigate } from 'react-router-dom'
import { ArrowRight, Brain, Shield, Globe } from 'lucide-react'

export default function Home() {
  const navigate = useNavigate()

  return (
    <div className="page" style={{ background: '#fff', minHeight: '100vh' }}>

      {/* Top nav */}
      <nav style={{
        padding: '20px 32px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderBottom: '1px solid #f0f0f0'
      }}>
        <div className="logo">Neuro<span>Spark</span></div>
        <span style={{ fontSize: '12px', color: '#737373', fontWeight: 500 }}>
          Free · Private · Offline-ready
        </span>
      </nav>

      {/* Hero */}
      <div style={{
        maxWidth: '560px',
        margin: '0 auto',
        padding: '80px 32px 48px',
      }}>

        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '6px',
          background: '#f0f7ff',
          color: '#2563EB',
          padding: '5px 12px',
          borderRadius: '20px',
          fontSize: '12px',
          fontWeight: '500',
          marginBottom: '28px'
        }}>
          <span style={{
            width: '6px', height: '6px',
            borderRadius: '50%',
            background: '#2563EB',
            display: 'inline-block'
          }} />
          Early screening for every child
        </div>

        <h1 style={{
          fontSize: '42px',
          fontWeight: '700',
          lineHeight: '1.15',
          letterSpacing: '-1.5px',
          color: '#0A0A0A',
          marginBottom: '20px'
        }}>
          Detect learning<br />differences early.<br />
          <span style={{ color: '#2563EB' }}>For free.</span>
        </h1>

        <p style={{
          fontSize: '16px',
          color: '#737373',
          lineHeight: '1.7',
          marginBottom: '40px',
          maxWidth: '440px'
        }}>
          NeuroSpark screens children for dyslexia and autism using only your phone's camera and microphone — in 8 minutes, in your language, at zero cost.
        </p>

        {/* CTA buttons */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', maxWidth: '360px' }}>
          <button
  className="btn-primary"
  onClick={() => navigate('/signup')}
  style={{ fontSize: '15px', padding: '16px 24px' }}
>
  Get started free
  <ArrowRight size={16} />
</button>
<button
  className="btn-secondary"
  onClick={() => navigate('/login')}
>
  Sign in
</button>
        </div>

        {/* Trust row */}
        <div style={{
          display: 'flex',
          gap: '28px',
          marginTop: '48px',
          paddingTop: '32px',
          borderTop: '1px solid #f0f0f0'
        }}>
          {[
            { icon: <Brain size={15} />, text: 'Dyslexia + Autism' },
            { icon: <Shield size={15} />, text: '100% on-device' },
            { icon: <Globe size={15} />, text: '12 Indian languages' },
          ].map((item, i) => (
            <div key={i} style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              color: '#525252',
              fontSize: '13px',
              fontWeight: '500'
            }}>
              {item.icon}
              {item.text}
            </div>
          ))}
        </div>
      </div>

      {/* Stats section */}
      <div style={{
        background: '#FAFAFA',
        borderTop: '1px solid #f0f0f0',
        borderBottom: '1px solid #f0f0f0',
        padding: '48px 32px',
      }}>
        <div style={{
          maxWidth: '560px',
          margin: '0 auto',
          display: 'grid',
          gridTemplateColumns: '1fr 1fr 1fr',
          gap: '32px'
        }}>
          {[
            { n: '1 in 10', label: 'children have dyslexia' },
            { n: '1 in 36', label: 'children are autistic' },
            { n: '₹0', label: 'cost to screen' },
          ].map((s, i) => (
            <div key={i}>
              <div style={{
                fontSize: '28px',
                fontWeight: '700',
                letterSpacing: '-1px',
                color: '#0A0A0A',
                marginBottom: '4px'
              }}>{s.n}</div>
              <div style={{
                fontSize: '13px',
                color: '#737373',
                lineHeight: '1.5'
              }}>{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* How it works */}
      <div style={{ maxWidth: '560px', margin: '0 auto', padding: '64px 32px' }}>
        <p style={{
          fontSize: '11px',
          fontWeight: '600',
          letterSpacing: '1px',
          textTransform: 'uppercase',
          color: '#A3A3A3',
          marginBottom: '32px'
        }}>How it works</p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
          {[
            { n: '01', title: 'Create a child profile', desc: 'Enter your child\'s name, age, and preferred language. Takes 30 seconds.' },
            { n: '02', title: 'Complete the screening', desc: 'Three short tasks — gaze tracking, handwriting, and phonics. 8 minutes total.' },
            { n: '03', title: 'Get a personalised report', desc: 'Receive a detailed report with specific study techniques and a referral letter.' },
          ].map((step, i) => (
            <div key={i} style={{
              display: 'flex',
              gap: '24px',
              paddingBottom: '32px',
              marginBottom: '32px',
              borderBottom: i < 2 ? '1px solid #f5f5f5' : 'none'
            }}>
              <div style={{
                fontSize: '12px',
                fontWeight: '600',
                color: '#D4D4D4',
                letterSpacing: '0.5px',
                minWidth: '24px',
                paddingTop: '3px'
              }}>{step.n}</div>
              <div>
                <div style={{
                  fontSize: '15px',
                  fontWeight: '600',
                  color: '#0A0A0A',
                  marginBottom: '6px'
                }}>{step.title}</div>
                <div style={{
                  fontSize: '14px',
                  color: '#737373',
                  lineHeight: '1.6'
                }}>{step.desc}</div>
              </div>
            </div>
          ))}
        </div>

        <button
          className="btn-primary"
          onClick={() => navigate('/profile')}
          style={{ marginTop: '8px' }}
        >
          Get started — it's free
          <ArrowRight size={16} />
        </button>
      </div>

      {/* Footer */}
      <div style={{
        borderTop: '1px solid #f0f0f0',
        padding: '24px 32px',
        textAlign: 'center'
      }}>
        <p style={{ fontSize: '13px', color: '#A3A3A3' }}>
          NeuroSpark is a screening tool, not a clinical diagnosis. Always consult a specialist.
        </p>
      </div>

    </div>
  )
}