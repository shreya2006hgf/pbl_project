import { useState, useEffect } from 'react'
import PatientForm from './components/PatientForm.jsx'
import ResultsPanel from './components/ResultsPanel.jsx'
import DietaryGuide from './components/DietaryGuide.jsx'
import StageInfo from './components/StageInfo.jsx'
import DatasetInfo from './components/DatasetInfo.jsx'
import EmotionDetector from './components/EmotionDetector.jsx'

const API = 'http://localhost:5000/api'

export default function App() {
  const [page, setPage]       = useState('home')
  const [loading, setLoading] = useState(false)
  const [results, setResults] = useState(null)
  const [error, setError]     = useState(null)

  const handlePredict = async (formData) => {
    setLoading(true); setError(null); setResults(null)
    try {
      const res  = await fetch(`${API}/predict`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })
      const data = await res.json()
      setResults(data)
      setPage('results')
    } catch (e) {
      setError('Could not reach the backend. Make sure the Flask server is running on port 5000.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ minHeight:'100vh', background:'var(--cream)' }}>
      <Header page={page} setPage={setPage} />

      <main style={{ maxWidth:1100, margin:'0 auto', padding:'0 20px 60px' }}>

        {page === 'home' && <HomePage setPage={setPage} />}

        {page === 'predict' && (
          <div style={{ paddingTop:32 }}>
            {error && <ErrorBanner msg={error} onClose={() => setError(null)} />}
            <PatientForm onSubmit={handlePredict} loading={loading} />
          </div>
        )}

        {page === 'results' && results && (
          <div style={{ paddingTop:32 }}>
            <ResultsPanel
              results={results}
              onBack={() => setPage('predict')}
              onDiet={() => setPage('diet')} />
          </div>
        )}

        {page === 'diet' && results && (
          <div style={{ paddingTop:32 }}>
            <DietaryGuide
              plan={results.dietary_plan}
              stage={results.stage}
              subtype={results.subtype}
              onBack={() => setPage('results')} />
          </div>
        )}

        {page === 'emotion' && (
          <div style={{ paddingTop:32 }}>
            <EmotionDetector />
          </div>
        )}

        {page === 'stages'  && <StageInfo API={API} />}
        {page === 'dataset' && <DatasetInfo API={API} />}

      </main>

      <Footer />
    </div>
  )
}

// ── Header ────────────────────────────────────────────────────────────────────
function Header({ page, setPage }) {
  const nav = [
    { id:'home',    label:'Home' },
    { id:'predict', label:'Analyze Patient' },
    { id:'emotion', label:'💛 Emotional Wellness' },
    { id:'stages',  label:'Cancer Stages' },
    { id:'dataset', label:'Datasets & Model' },
  ]

  return (
    <header style={{ background:'#fff', borderBottom:'1px solid var(--rose-md)',
      position:'sticky', top:0, zIndex:100, boxShadow:'var(--shadow-sm)' }}>
      <div style={{ maxWidth:1100, margin:'0 auto', padding:'0 20px',
        display:'flex', alignItems:'center', gap:16, height:64 }}>

        {/* Logo */}
        <button onClick={() => setPage('home')}
          style={{ display:'flex', alignItems:'center', gap:10, background:'none',
            fontFamily:'var(--font-display)', fontSize:22, fontWeight:700,
            color:'var(--rose)', flexShrink:0 }}>
          <span style={{ fontSize:26 }}>🎗️</span> Curivia
        </button>

        {/* Nav */}
        <nav style={{ display:'flex', gap:4, marginLeft:'auto', flexWrap:'wrap' }}>
          {nav.map(n => (
            <button key={n.id} onClick={() => setPage(n.id)}
              style={{ padding:'6px 14px', borderRadius:20,
                background: page === n.id ? 'var(--rose)' : 'transparent',
                color: page === n.id ? '#fff' : 'var(--warm-gray)',
                fontWeight: page === n.id ? 600 : 400,
                fontSize:13, transition:'all .2s', cursor:'pointer' }}>
              {n.label}
            </button>
          ))}
        </nav>

      </div>
    </header>
  )
}

// ── Home Page ─────────────────────────────────────────────────────────────────
function HomePage({ setPage }) {
  const features = [
    {
      icon:'🔬',
      title:'Gene Expression Analysis',
      desc:'Trained on 1,076 samples from GSE2034, BC-TCGA, and Simulation datasets using Random Forest classifiers.'
    },
    {
      icon:'🧬',
      title:'Stage Classification',
      desc:'Predict breast cancer stage (I–IV) from clinical biomarkers using ML inference with 79% accuracy.'
    },
    {
      icon:'🥗',
      title:'AI Dietary Suggestions',
      desc:'Personalized nutrition plans based on your specific stage and subtype, backed by oncology research.'
    },
    {
      icon:'💛',
      title:'Emotional Wellness Check',
      desc:'Answer 5 questions to assess your emotional stability and receive personalized mental health guidance.'
    },
  ]

  const stats = [
    { value:'1,076', label:'Patient Samples' },
    { value:'500+',  label:'Genes Analyzed' },
    { value:'80%',   label:'Subtype Accuracy' },
    { value:'79%',   label:'Stage Accuracy' },
  ]

  return (
    <div className="fade-in">

      {/* Hero */}
      <div style={{ textAlign:'center', padding:'72px 20px 48px',
        position:'relative', overflow:'hidden' }}>

        {/* Decorative blobs */}
        <div style={{ position:'absolute', top:-60, right:-60, width:300, height:300,
          borderRadius:'50%', background:'var(--rose-md)', opacity:.25, filter:'blur(60px)' }} />
        <div style={{ position:'absolute', bottom:-40, left:-40, width:250, height:250,
          borderRadius:'50%', background:'var(--blush)', opacity:.2, filter:'blur(50px)' }} />

        <div style={{ display:'inline-block', padding:'6px 18px', borderRadius:20,
          background:'var(--rose-lt)', color:'var(--rose)', fontSize:13, fontWeight:600,
          marginBottom:20 }}>
          🎗️ Empowering Breast Cancer Awareness & Care
        </div>

        <h1 style={{ fontFamily:'var(--font-display)', fontSize:'clamp(36px,5vw,58px)',
          fontWeight:700, lineHeight:1.2, marginBottom:16, color:'var(--charcoal)' }}>
          Curivia
          <br />
          <span style={{ color:'var(--rose)', fontStyle:'italic' }}>
            Breast Cancer Intelligence
          </span>
        </h1>

        <p style={{ fontSize:18, color:'var(--warm-gray)', maxWidth:560,
          margin:'0 auto 36px', lineHeight:1.7 }}>
          An AI-powered clinical support tool that predicts cancer stage,
          molecular subtype, delivers personalized dietary guidance,
          and checks your emotional wellbeing.
        </p>

        <div style={{ display:'flex', gap:14, justifyContent:'center', flexWrap:'wrap' }}>
          <button onClick={() => setPage('predict')}
            style={{ padding:'14px 32px', borderRadius:30, background:'var(--rose)',
              color:'#fff', fontWeight:700, fontSize:16,
              boxShadow:'0 4px 20px rgba(225,29,116,.35)',
              transition:'transform .15s, box-shadow .15s', cursor:'pointer' }}
            onMouseOver={e => { e.currentTarget.style.transform='translateY(-2px)'; e.currentTarget.style.boxShadow='0 8px 28px rgba(225,29,116,.45)' }}
            onMouseOut={e  => { e.currentTarget.style.transform='none'; e.currentTarget.style.boxShadow='0 4px 20px rgba(225,29,116,.35)' }}>
            Analyze Patient →
          </button>
          <button onClick={() => setPage('emotion')}
            style={{ padding:'14px 32px', borderRadius:30, background:'#fff',
              color:'var(--rose)', fontWeight:600, fontSize:16,
              border:'2px solid var(--rose-md)', cursor:'pointer' }}>
            💛 Emotional Wellness
          </button>
        </div>
      </div>

      {/* Stats bar */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:16,
        background:'#fff', borderRadius:'var(--radius)', padding:28,
        marginBottom:48, boxShadow:'var(--shadow-sm)' }}>
        {stats.map(s => (
          <div key={s.label} style={{ textAlign:'center' }}>
            <div style={{ fontSize:32, fontWeight:700, color:'var(--rose)',
              fontFamily:'var(--font-display)' }}>{s.value}</div>
            <div style={{ fontSize:13, color:'var(--warm-gray)', marginTop:4 }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Feature cards */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(240px,1fr))',
        gap:20, marginBottom:48 }}>
        {features.map(f => (
          <div key={f.title}
            style={{ background:'#fff', borderRadius:'var(--radius)', padding:28,
              boxShadow:'var(--shadow-sm)', border:'1px solid var(--rose-lt)',
              transition:'transform .2s, box-shadow .2s', cursor:'default' }}
            onMouseOver={e => { e.currentTarget.style.transform='translateY(-4px)'; e.currentTarget.style.boxShadow='var(--shadow-md)' }}
            onMouseOut={e  => { e.currentTarget.style.transform='none'; e.currentTarget.style.boxShadow='var(--shadow-sm)' }}>
            <div style={{ fontSize:36, marginBottom:12 }}>{f.icon}</div>
            <h3 style={{ fontFamily:'var(--font-display)', fontSize:18, marginBottom:8 }}>{f.title}</h3>
            <p style={{ color:'var(--warm-gray)', fontSize:14, lineHeight:1.6 }}>{f.desc}</p>
          </div>
        ))}
      </div>

      {/* Disclaimer */}
      <div style={{ background:'var(--rose-lt)', borderRadius:'var(--radius)', padding:20,
        borderLeft:'4px solid var(--rose)', textAlign:'center' }}>
        <strong>⚕️ Medical Disclaimer:</strong>{' '}
        <span style={{ color:'var(--warm-gray)', fontSize:14 }}>
          Curivia is an educational research tool. Results should not replace professional medical advice.
          Always consult a qualified oncologist for diagnosis and treatment decisions.
        </span>
      </div>

    </div>
  )
}

// ── Error Banner ──────────────────────────────────────────────────────────────
function ErrorBanner({ msg, onClose }) {
  return (
    <div style={{ background:'#fef2f2', border:'1px solid #fca5a5',
      borderRadius:'var(--radius-sm)', padding:'12px 16px', marginBottom:20,
      display:'flex', justifyContent:'space-between', alignItems:'center' }}>
      <span style={{ color:'#dc2626', fontSize:14 }}>⚠️ {msg}</span>
      <button onClick={onClose}
        style={{ background:'none', color:'#dc2626', fontWeight:700, cursor:'pointer' }}>✕</button>
    </div>
  )
}

// ── Footer ────────────────────────────────────────────────────────────────────
function Footer() {
  return (
    <footer style={{ background:'var(--charcoal)', color:'#fff',
      textAlign:'center', padding:'28px 20px', marginTop:40 }}>
      <div style={{ fontSize:20, marginBottom:8 }}>🎗️ Curivia</div>
      <p style={{ color:'#a8a29e', fontSize:13 }}>
        Built with gene expression data from GSE2034 · BC-TCGA · Simulation datasets
        <br />Developed as part of PBL Project — School of Computer Science, Manipal University
      </p>
      <p style={{ color:'#57534e', fontSize:12, marginTop:8 }}>
        © 2025 Curivia · For Educational & Research Purposes Only
      </p>
    </footer>
  )
}