import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

const SPECIALISTS = [
  { name: 'NIMHANS', city: 'Bengaluru', state: 'Karnataka', address: 'Hosur Rd, Lakkasandra, Wilson Garden', phone: '080-46110007', type: 'Government', speciality: 'Child psychiatry, autism, learning disabilities' },
  { name: 'Ummeed Child Development Center', city: 'Mumbai', state: 'Maharashtra', address: 'Bandra West, Mumbai', phone: '022-26001200', type: 'NGO', speciality: 'Autism, developmental delays, LD' },
  { name: 'Child Development Centre AIIMS', city: 'New Delhi', state: 'Delhi', address: 'Ansari Nagar, New Delhi', phone: '011-26588500', type: 'Government', speciality: 'Full neurodevelopmental assessment' },
  { name: 'Vidya Sagar', city: 'Chennai', state: 'Tamil Nadu', address: 'Taramani, Chennai', phone: '044-22542404', type: 'NGO', speciality: 'Dyslexia, autism, special education' },
  { name: 'Asha Niketan', city: 'Kolkata', state: 'West Bengal', address: 'Tollygunge, Kolkata', phone: '033-24017735', type: 'NGO', speciality: 'Intellectual disability, autism' },
  { name: 'Samvedana', city: 'Hyderabad', state: 'Telangana', address: 'Banjara Hills, Hyderabad', phone: '040-23540568', type: 'Private', speciality: 'Child psychology, dyslexia, ASD' },
  { name: 'Centre for Child Development', city: 'Pune', state: 'Maharashtra', address: 'Koregaon Park, Pune', phone: '020-26153040', type: 'Private', speciality: 'Learning disabilities, ADHD, autism' },
  { name: 'NIEPMD', city: 'Chennai', state: 'Tamil Nadu', address: 'ECR Road, Muttukadu', phone: '044-27472046', type: 'Government', speciality: 'All neurodevelopmental conditions' },
  { name: 'Fireflies', city: 'Bengaluru', state: 'Karnataka', address: 'Indiranagar, Bengaluru', phone: '080-25277777', type: 'Private', speciality: 'Autism, sensory integration, dyslexia' },
  { name: 'AADI', city: 'New Delhi', state: 'Delhi', address: 'Panchsheel Vihar, New Delhi', phone: '011-26499535', type: 'NGO', speciality: 'Disability assessment and intervention' },
]

const STATES = ['All', ...new Set(SPECIALISTS.map(s => s.state))]
const TYPES = ['All', 'Government', 'NGO', 'Private']

const typeColors = {
  Government: { bg: '#EFF6FF', color: '#1D4ED8' },
  NGO: { bg: '#F0FDF4', color: '#15803D' },
  Private: { bg: '#FFFBEB', color: '#B45309' },
}

function SpecialistCard({ s }) {
  const mapsUrl = 'https://www.google.com/maps/search/' + encodeURIComponent(s.name + ' ' + s.city)
  const callUrl = 'tel:' + s.phone

  return (
    <div className="card" style={{ marginBottom: '10px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
        <div style={{ flex: 1, paddingRight: '8px' }}>
          <div style={{ fontSize: '14px', fontWeight: '600', marginBottom: '2px' }}>{s.name}</div>
          <div style={{ fontSize: '12px', color: '#737373' }}>{s.city}, {s.state}</div>
        </div>
        <span className="badge" style={{ background: typeColors[s.type].bg, color: typeColors[s.type].color, flexShrink: 0 }}>
          {s.type}
        </span>
      </div>

      <div style={{ fontSize: '12px', color: '#525252', marginBottom: '4px', lineHeight: '1.5' }}>
        📍 {s.address}
      </div>
      <div style={{ fontSize: '12px', color: '#525252', marginBottom: '10px', lineHeight: '1.5' }}>
        🔬 {s.speciality}
      </div>

      <div style={{ display: 'flex', gap: '8px' }}>
        <button
          onClick={() => window.open(callUrl)}
          style={{
            flex: 1, padding: '8px', background: '#F5F5F5',
            borderRadius: '8px', fontSize: '12px', fontWeight: '500',
            color: '#0A0A0A', textAlign: 'center', border: 'none',
            cursor: 'pointer'
          }}
        >
          📞 {s.phone}
        </button>
        <button
          onClick={() => window.open(mapsUrl, '_blank')}
          style={{
            flex: 1, padding: '8px', background: '#EFF6FF',
            borderRadius: '8px', fontSize: '12px', fontWeight: '500',
            color: '#2563EB', textAlign: 'center', border: 'none',
            cursor: 'pointer'
          }}
        >
          🗺 Open in Maps
        </button>
      </div>
    </div>
  )
}

export default function Specialists() {
  const navigate = useNavigate()
  const [selectedState, setSelectedState] = useState('All')
  const [selectedType, setSelectedType] = useState('All')
  const [search, setSearch] = useState('')

  const filtered = SPECIALISTS.filter(s => {
    const matchState = selectedState === 'All' || s.state === selectedState
    const matchType = selectedType === 'All' || s.type === selectedType
    const matchSearch = s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.city.toLowerCase().includes(search.toLowerCase())
    return matchState && matchType && matchSearch
  })

  return (
    <div className="page">
      <div className="page-header">
        <button className="btn-ghost" onClick={() => navigate(-1)}>← Back</button>
        <div style={{ flex: 1 }} />
        <div className="logo">Neuro<span>Spark</span></div>
      </div>

      <div className="page-content">
        <div style={{ marginBottom: '20px' }}>
          <h1 style={{ fontSize: '22px', fontWeight: '700', letterSpacing: '-0.5px', marginBottom: '6px' }}>
            Find a specialist
          </h1>
          <p style={{ fontSize: '14px', color: '#737373' }}>
            Verified child psychology and neurodevelopmental centres across India.
          </p>
        </div>

        <button
  onClick={() => window.open('https://www.google.com/maps/search/child+psychologist+dyslexia+autism+near+me', '_blank')}
  style={{
    width: '100%',
    padding: '20px',
    background: '#F5F5F5',
    border: '1px solid #E5E5E5',
    borderRadius: '12px',
    marginBottom: '16px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '10px',
    fontSize: '14px',
    fontWeight: '500',
    color: '#0A0A0A'
  }}
>
  <span style={{ fontSize: '24px' }}>🗺</span>
  <div style={{ textAlign: 'left' }}>
    <div style={{ fontSize: '14px', fontWeight: '600' }}>Search on Google Maps</div>
    <div style={{ fontSize: '12px', color: '#737373', marginTop: '2px' }}>
      Find child psychologists and specialists near your location
    </div>
  </div>
  <span style={{ marginLeft: 'auto', color: '#A3A3A3', fontSize: '16px' }}>→</span>
</button>

        <input
          className="input-field"
          placeholder="Search by name or city..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{ marginBottom: '12px', width: '100%' }}
        />

        <div style={{ display: 'flex', gap: '8px', marginBottom: '12px', overflowX: 'auto', paddingBottom: '4px' }}>
          {STATES.map(s => (
            <button
              key={s}
              onClick={() => setSelectedState(s)}
              style={{
                padding: '6px 14px', borderRadius: '20px', fontSize: '12px',
                fontWeight: '500', whiteSpace: 'nowrap', cursor: 'pointer',
                background: selectedState === s ? '#0A0A0A' : '#F5F5F5',
                color: selectedState === s ? '#fff' : '#525252',
                border: 'none', flexShrink: 0
              }}
            >
              {s}
            </button>
          ))}
        </div>

        <div style={{ display: 'flex', gap: '6px', marginBottom: '16px' }}>
          {TYPES.map(t => (
            <button
              key={t}
              onClick={() => setSelectedType(t)}
              style={{
                padding: '5px 12px', borderRadius: '20px', fontSize: '12px',
                fontWeight: '500', cursor: 'pointer',
                background: selectedType === t ? '#0A0A0A' : '#F5F5F5',
                color: selectedType === t ? '#fff' : '#525252',
                border: 'none'
              }}
            >
              {t}
            </button>
          ))}
        </div>

        <div style={{ fontSize: '12px', color: '#A3A3A3', marginBottom: '10px' }}>
          {filtered.length} centre{filtered.length !== 1 ? 's' : ''} found
        </div>

        {filtered.map((s, i) => (
          <SpecialistCard key={i} s={s} />
        ))}
      </div>
    </div>
  )
}