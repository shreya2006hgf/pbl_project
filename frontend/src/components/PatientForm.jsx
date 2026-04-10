import { useState } from 'react'

const FIELD_STYLES = {
  label: { display:'block', fontSize:13, fontWeight:600, color:'#44403c', marginBottom:6 },
  input: { width:'100%', padding:'10px 14px', borderRadius:10, border:'1.5px solid #e7d5e0',
    fontSize:14, outline:'none', transition:'border-color .2s, box-shadow .2s',
    background:'#fff', fontFamily:'var(--font-body)' },
  group: { display:'flex', flexDirection:'column', gap:4 },
}

const hoverInput = (e, active) => {
  e.target.style.borderColor = active ? 'var(--rose)' : '#e7d5e0'
  e.target.style.boxShadow   = active ? '0 0 0 3px rgba(225,29,116,.12)' : 'none'
}

const SYMPTOMS = [
  { id:'hair_loss',     label:'Hair Loss or Thinning',    icon:'🪮', desc:'Noticeable hair fall, thinning, or patches' },
  { id:'fatigue',       label:'Unusual Tiredness',         icon:'😔', desc:'Feeling exhausted even after rest' },
  { id:'skin_changes',  label:'Skin Changes',              icon:'🔍', desc:'Redness, dryness, or texture changes on skin' },
  { id:'appetite_loss', label:'Loss of Appetite',          icon:'🍽️', desc:'Reduced interest in food or unintended weight loss' },
  { id:'body_aches',    label:'Body Aches or Discomfort',  icon:'💫', desc:'Persistent pain or discomfort in the body' },
  { id:'swelling',      label:'Swelling or Puffiness',     icon:'🫧', desc:'Swelling in arms, neck, or around chest area' },
]

const DURATION_OPTIONS = [
  { val:1, label:'Less than a month' },
  { val:2, label:'1 – 3 months' },
  { val:3, label:'3 – 6 months' },
  { val:4, label:'More than 6 months' },
]

export default function PatientForm({ onSubmit, loading }) {
  const [form, setForm] = useState({
    patient_name: '',
    age: 45,
    grade: 1,        // duration (1-4) reused as grade field for backend
    symptoms: [],
    // silent defaults kept for backend compatibility
    tumor_size_mm: 18,
    lymph_nodes: 0,
    er_positive: true,
    pr_positive: true,
    her2_positive: false,
    ki67_percent: 15,
    metastasis: false,
  })

  const set = (k, v) => setForm(p => ({ ...p, [k]: v }))

  const toggleSymptom = (id) => {
    setForm(p => {
      const has = p.symptoms.includes(id)
      return { ...p, symptoms: has ? p.symptoms.filter(s => s !== id) : [...p.symptoms, id] }
    })
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    onSubmit(form)
  }

  return (
    <div className="fade-in">

      {/* Header */}
      <div style={{ textAlign:'center', marginBottom:36 }}>
        <h2 style={{ fontFamily:'var(--font-display)', fontSize:32,
          color:'var(--charcoal)', marginBottom:8 }}>
          Patient Analysis
        </h2>
        <p style={{ color:'var(--warm-gray)', fontSize:15, maxWidth:480, margin:'0 auto' }}>
          Share some basic details and the symptoms you have been noticing.
          We will give you a personalised stage estimate and dietary plan.
        </p>
      </div>

      <form onSubmit={handleSubmit}
        style={{ display:'grid', gridTemplateColumns:'1fr',
          gap:24, maxWidth:540, margin:'0 auto' }}>

        {/* ── Basic Info ─────────────────────────────────────────────── */}
        <div style={{ background:'#fff', borderRadius:'var(--radius)', padding:28,
          boxShadow:'var(--shadow-sm)', border:'1px solid #e11d7422',
          display:'flex', flexDirection:'column', gap:20 }}>

          <h3 style={{ fontFamily:'var(--font-display)', fontSize:18,
            color:'var(--rose)', paddingBottom:12, borderBottom:'2px solid #e11d7422' }}>
            👤 Basic Information
          </h3>

          {/* Name */}
          <div style={FIELD_STYLES.group}>
            <label style={FIELD_STYLES.label}>Your Name (optional)</label>
            <input style={FIELD_STYLES.input} placeholder="e.g. Priya Sharma"
              value={form.patient_name}
              onChange={e => set('patient_name', e.target.value)}
              onFocus={e => hoverInput(e, true)}
              onBlur={e  => hoverInput(e, false)} />
          </div>

          {/* Age */}
          <div style={FIELD_STYLES.group}>
            <label style={FIELD_STYLES.label}>Age — {form.age} years</label>
            <input type="range" min={18} max={90} value={form.age}
              onChange={e => set('age', Number(e.target.value))}
              style={{ accentColor:'var(--rose)', width:'100%', cursor:'pointer' }} />
            <div style={{ display:'flex', justifyContent:'space-between',
              fontSize:11, color:'#9ca3af' }}>
              <span>18</span><span>90</span>
            </div>
          </div>

          {/* Duration */}
          <div style={FIELD_STYLES.group}>
            <label style={FIELD_STYLES.label}>How long have you noticed these symptoms?</label>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:8 }}>
              {DURATION_OPTIONS.map(opt => (
                <button type="button" key={opt.val}
                  onClick={() => set('grade', opt.val)}
                  style={{ padding:'10px 8px', borderRadius:10, fontSize:13,
                    lineHeight:1.4, textAlign:'center', cursor:'pointer',
                    background: form.grade===opt.val ? 'var(--rose)' : '#f5f5f4',
                    color:      form.grade===opt.val ? '#fff' : 'var(--warm-gray)',
                    fontWeight: form.grade===opt.val ? 700 : 400,
                    border:     form.grade===opt.val ? 'none' : '1.5px solid #e5e7eb',
                    transition:'all .15s' }}>
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* ── Symptoms ────────────────────────────────────────────────── */}
        <div style={{ background:'#fff', borderRadius:'var(--radius)', padding:28,
          boxShadow:'var(--shadow-sm)', border:'1px solid #e11d7422',
          display:'flex', flexDirection:'column', gap:16 }}>

          <div>
            <h3 style={{ fontFamily:'var(--font-display)', fontSize:18,
              color:'var(--rose)', paddingBottom:12, borderBottom:'2px solid #e11d7422' }}>
              🩺 Symptoms You Have Noticed
            </h3>
            <p style={{ fontSize:13, color:'var(--warm-gray)', marginTop:10 }}>
              Select all that apply. You can pick more than one.
            </p>
          </div>

          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10 }}>
            {SYMPTOMS.map(s => {
              const active = form.symptoms.includes(s.id)
              return (
                <button type="button" key={s.id}
                  onClick={() => toggleSymptom(s.id)}
                  style={{ padding:'14px 12px', borderRadius:12, textAlign:'left',
                    cursor:'pointer', transition:'all .18s',
                    border:     active ? '2px solid var(--rose)' : '2px solid #e5e7eb',
                    background: active ? 'var(--rose-lt)' : '#fafafa',
                    boxShadow:  active ? '0 2px 10px rgba(225,29,116,.12)' : 'none' }}
                  onMouseOver={e => {
                    if (!active) {
                      e.currentTarget.style.borderColor = 'var(--blush)'
                      e.currentTarget.style.background  = 'var(--rose-lt)'
                    }
                  }}
                  onMouseOut={e => {
                    if (!active) {
                      e.currentTarget.style.borderColor = '#e5e7eb'
                      e.currentTarget.style.background  = '#fafafa'
                    }
                  }}>
                  <div style={{ fontSize:22, marginBottom:6 }}>{s.icon}</div>
                  <div style={{ fontSize:13, fontWeight:700, marginBottom:3,
                    color: active ? 'var(--rose)' : 'var(--charcoal)' }}>
                    {s.label}
                  </div>
                  <div style={{ fontSize:11, color:'var(--warm-gray)', lineHeight:1.4 }}>
                    {s.desc}
                  </div>
                  {active && (
                    <div style={{ marginTop:6, fontSize:11,
                      color:'var(--rose)', fontWeight:600 }}>
                      ✓ Selected
                    </div>
                  )}
                </button>
              )
            })}
          </div>

          {/* Selection count */}
          {form.symptoms.length === 0 ? (
            <p style={{ fontSize:12, color:'#b0a0aa', textAlign:'center',
              fontStyle:'italic' }}>
              No symptoms selected — that is okay too
            </p>
          ) : (
            <div style={{ background:'var(--rose-lt)', borderRadius:10,
              padding:'10px 14px', fontSize:13, color:'var(--rose)' }}>
              <strong>{form.symptoms.length}</strong> symptom
              {form.symptoms.length > 1 ? 's' : ''} selected
            </div>
          )}
        </div>

        {/* ── Submit ───────────────────────────────────────────────────── */}
        <div style={{ display:'flex', justifyContent:'center' }}>
          <button type="submit" disabled={loading}
            style={{ padding:'16px 52px', borderRadius:30,
              background:'var(--rose)', color:'#fff',
              fontWeight:700, fontSize:17,
              boxShadow:'0 4px 24px rgba(225,29,116,.35)',
              opacity: loading ? .7 : 1, transition:'all .2s',
              display:'flex', alignItems:'center', gap:10,
              cursor: loading ? 'not-allowed' : 'pointer' }}>
            {loading && (
              <span className="spin" style={{ display:'inline-block',
                width:18, height:18,
                border:'2px solid rgba(255,255,255,.4)',
                borderTopColor:'#fff', borderRadius:'50%' }} />
            )}
            {loading ? 'Analysing...' : '🔬 Get My Analysis'}
          </button>
        </div>

        {/* Disclaimer */}
        <p style={{ textAlign:'center', fontSize:12, color:'#b0a0aa',
          lineHeight:1.6, marginTop:-8 }}>
          ⚕️ This tool is for awareness only. Always consult a doctor for a proper diagnosis.
        </p>

      </form>
    </div>
  )
}