import { useState } from 'react'

const QUESTIONS = [
  {
    id: 'sleep',
    question: "How has your sleep been lately?",
    options: [
      { label: "Sleeping well, feeling rested",           score: 3 },
      { label: "Some trouble, but managing",              score: 2 },
      { label: "Frequently waking up or restless",        score: 1 },
      { label: "Barely sleeping, exhausted",              score: 0 },
    ]
  },
  {
    id: 'mood',
    question: "How would you describe your overall mood this week?",
    options: [
      { label: "Positive and hopeful",                    score: 3 },
      { label: "Mostly okay with some low moments",       score: 2 },
      { label: "Often sad or anxious",                    score: 1 },
      { label: "Overwhelmed and struggling",              score: 0 },
    ]
  },
  {
    id: 'support',
    question: "Do you feel supported by people around you?",
    options: [
      { label: "Yes, I have strong support",              score: 3 },
      { label: "Some support but could use more",         score: 2 },
      { label: "I feel somewhat alone in this",           score: 1 },
      { label: "I feel very isolated",                    score: 0 },
    ]
  },
  {
    id: 'motivation',
    question: "How is your energy and motivation for daily activities?",
    options: [
      { label: "Good — I can do most things I enjoy",     score: 3 },
      { label: "Moderate — I push through",               score: 2 },
      { label: "Low — small tasks feel heavy",            score: 1 },
      { label: "Very low — I struggle to get going",      score: 0 },
    ]
  },
  {
    id: 'worry',
    question: "How often do thoughts about your health cause you distress?",
    options: [
      { label: "Rarely — I manage worries well",          score: 3 },
      { label: "Sometimes, but I cope",                   score: 2 },
      { label: "Often, it affects my day",                score: 1 },
      { label: "Almost constantly",                       score: 0 },
    ]
  },
]

const RESULTS = [
  {
    range: [12, 15],
    label: "Emotionally Stable",
    emoji: "🌸",
    color: "#16a34a",
    bg: "#f0fdf4",
    border: "#bbf7d0",
    description: "You appear to be coping well emotionally. Your resilience is a real strength during this time. Keep nurturing your support systems and self-care routines.",
    tips: [
      "Continue activities that bring you joy and calm",
      "Share your coping strategies with others in your support group",
      "Maintain regular check-ins with your care team",
      "Celebrate small wins — they matter enormously",
    ]
  },
  {
    range: [8, 11],
    label: "Mild Emotional Strain",
    emoji: "🌼",
    color: "#d97706",
    bg: "#fffbeb",
    border: "#fde68a",
    description: "You're managing, but showing some signs of emotional strain. This is completely normal and expected. With a little extra support, you can feel more balanced.",
    tips: [
      "Try a short daily mindfulness or breathing practice (5 min)",
      "Talk to a trusted friend or family member about how you feel",
      "Ask your oncology team about a counsellor referral",
      "Gentle movement like walking or yoga can lift mood",
    ]
  },
  {
    range: [4, 7],
    label: "Moderate Emotional Distress",
    emoji: "💛",
    color: "#ea580c",
    bg: "#fff7ed",
    border: "#fed7aa",
    description: "Your responses suggest you may be experiencing significant emotional distress. This is a heavy time and what you're feeling is valid — but you deserve support.",
    tips: [
      "Please speak with a mental health professional or counsellor",
      "Consider joining a breast cancer support group",
      "Inform your care team — emotional health affects physical recovery",
      "Practice small acts of self-compassion every day",
    ]
  },
  {
    range: [0, 3],
    label: "High Emotional Distress",
    emoji: "💙",
    color: "#dc2626",
    bg: "#fef2f2",
    border: "#fca5a5",
    description: "Your responses indicate you may be going through a very difficult time emotionally. Please know you are not alone, and reaching out for help is a sign of strength.",
    tips: [
      "Please reach out to a mental health professional as soon as possible",
      "Talk to your doctor — they can connect you to the right support",
      "iCall (India): 9152987821 | Vandrevala Foundation: 1860-2662-345",
      "You do not have to face this alone — help is available",
    ]
  },
]

export default function EmotionDetector() {
  const [current,  setCurrent]  = useState(0)
  const [answers,  setAnswers]  = useState({})
  const [result,   setResult]   = useState(null)
  const [selected, setSelected] = useState(null)

  const handleAnswer = (score) => {
    setSelected(score)
    setTimeout(() => {
      const newAnswers = { ...answers, [QUESTIONS[current].id]: score }
      setAnswers(newAnswers)
      setSelected(null)
      if (current < QUESTIONS.length - 1) {
        setCurrent(current + 1)
      } else {
        const total = Object.values(newAnswers).reduce((a, b) => a + b, 0)
        const res   = RESULTS.find(r => total >= r.range[0] && total <= r.range[1])
        setResult({ ...res, total, max: QUESTIONS.length * 3 })
      }
    }, 280)
  }

  const reset = () => {
    setCurrent(0); setAnswers({}); setResult(null); setSelected(null)
  }

  const progress = (current / QUESTIONS.length) * 100

  return (
    <div className="fade-in">

      {/* Page header */}
      <div style={{ textAlign:'center', marginBottom:36 }}>
        <div style={{ fontSize:48, marginBottom:12 }}>🌸</div>
        <h2 style={{ fontFamily:'var(--font-display)', fontSize:32,
          color:'var(--charcoal)', marginBottom:10 }}>
          Emotional Wellness Check
        </h2>
        <p style={{ color:'var(--warm-gray)', fontSize:15, maxWidth:520,
          margin:'0 auto', lineHeight:1.7 }}>
          Your emotional health is just as important as your physical health.
          Answer 5 simple questions to understand how you are feeling right now.
        </p>
      </div>

      {!result ? (
        <div style={{ maxWidth:600, margin:'0 auto' }}>

          {/* Progress */}
          <div style={{ marginBottom:28 }}>
            <div style={{ display:'flex', justifyContent:'space-between',
              fontSize:13, color:'var(--warm-gray)', marginBottom:8 }}>
              <span>Question {current + 1} of {QUESTIONS.length}</span>
              <span>{Math.round(progress)}% complete</span>
            </div>
            <div style={{ height:8, borderRadius:4, background:'#f3f4f6', overflow:'hidden' }}>
              <div style={{ height:'100%', borderRadius:4,
                background:'linear-gradient(90deg, var(--rose), var(--blush))',
                width:`${progress}%`, transition:'width 0.4s ease' }} />
            </div>
            {/* Step dots */}
            <div style={{ display:'flex', justifyContent:'center', gap:8, marginTop:12 }}>
              {QUESTIONS.map((_, i) => (
                <div key={i} style={{ width: i === current ? 24 : 8, height:8,
                  borderRadius:4, transition:'all 0.3s',
                  background: i <= current ? 'var(--rose)' : '#e5e7eb' }} />
              ))}
            </div>
          </div>

          {/* Question card */}
          <div className="fade-in" key={current}
            style={{ background:'#fff', borderRadius:'var(--radius)', padding:36,
              boxShadow:'var(--shadow-md)', border:'1px solid var(--rose-md)' }}>

            <h3 style={{ fontFamily:'var(--font-display)', fontSize:22,
              color:'var(--charcoal)', marginBottom:28, lineHeight:1.4,
              textAlign:'center' }}>
              {QUESTIONS[current].question}
            </h3>

            <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
              {QUESTIONS[current].options.map((opt, i) => (
                <button key={i} onClick={() => handleAnswer(opt.score)}
                  style={{ padding:'14px 20px', borderRadius:12, textAlign:'left',
                    border: selected === opt.score
                      ? '2px solid var(--rose)'
                      : '2px solid #e5e7eb',
                    background: selected === opt.score ? 'var(--rose-lt)' : '#fff',
                    color:'var(--charcoal)', fontSize:15,
                    transition:'all 0.15s', cursor:'pointer',
                    display:'flex', alignItems:'center', gap:14 }}
                  onMouseOver={e => {
                    if (selected !== opt.score) {
                      e.currentTarget.style.borderColor = 'var(--blush)'
                      e.currentTarget.style.background  = 'var(--rose-lt)'
                    }
                  }}
                  onMouseOut={e => {
                    if (selected !== opt.score) {
                      e.currentTarget.style.borderColor = '#e5e7eb'
                      e.currentTarget.style.background  = '#fff'
                    }
                  }}>
                  <div style={{ width:30, height:30, borderRadius:'50%', flexShrink:0,
                    border:'2px solid var(--blush)', display:'flex',
                    alignItems:'center', justifyContent:'center',
                    fontSize:13, color:'var(--rose)', fontWeight:700 }}>
                    {String.fromCharCode(65 + i)}
                  </div>
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Reassurance */}
          <p style={{ textAlign:'center', color:'var(--warm-gray)', fontSize:13,
            marginTop:20, lineHeight:1.6 }}>
            💛 There are no right or wrong answers. Be honest with yourself — this is a safe space.
          </p>

        </div>
      ) : (
        <ResultScreen result={result} onReset={reset} />
      )}
    </div>
  )
}

function ResultScreen({ result, onReset }) {
  return (
    <div className="fade-in" style={{ maxWidth:640, margin:'0 auto' }}>

      {/* Score card */}
      <div style={{ background:result.bg, borderRadius:'var(--radius)',
        border:`2px solid ${result.border}`, padding:36,
        textAlign:'center', marginBottom:24, boxShadow:'var(--shadow-md)' }}>

        <div style={{ fontSize:56, marginBottom:12,
          animation:'heartbeat 1.5s ease 2' }}>
          {result.emoji}
        </div>

        <h3 style={{ fontFamily:'var(--font-display)', fontSize:28,
          color:result.color, marginBottom:8 }}>
          {result.label}
        </h3>

        {/* Score bar */}
        <div style={{ display:'flex', alignItems:'center', gap:12,
          justifyContent:'center', marginBottom:16 }}>
          <span style={{ fontSize:14, color:result.color, fontWeight:700 }}>
            Score: {result.total}/{result.max}
          </span>
          <div style={{ width:160, height:10, borderRadius:5,
            background:'#e5e7eb', overflow:'hidden' }}>
            <div style={{ height:'100%', borderRadius:5, background:result.color,
              width:`${(result.total / result.max) * 100}%`,
              transition:'width 1s ease' }} />
          </div>
        </div>

        <p style={{ fontSize:15, color:'#44403c', lineHeight:1.7,
          maxWidth:480, margin:'0 auto' }}>
          {result.description}
        </p>
      </div>

      {/* Tips */}
      <div style={{ background:'#fff', borderRadius:'var(--radius)', padding:28,
        border:'1px solid #e5e7eb', boxShadow:'var(--shadow-sm)', marginBottom:24 }}>
        <h4 style={{ fontFamily:'var(--font-display)', fontSize:20,
          marginBottom:16, color:'var(--charcoal)' }}>
          💡 Recommended Next Steps
        </h4>
        <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
          {result.tips.map((tip, i) => (
            <div key={i} style={{ display:'flex', gap:12, alignItems:'flex-start',
              padding:'12px 16px', borderRadius:10,
              background: i === 0 ? result.bg : 'var(--light-gray)',
              border:`1px solid ${i === 0 ? result.border : 'transparent'}` }}>
              <div style={{ width:24, height:24, borderRadius:'50%', flexShrink:0,
                background:result.color, color:'#fff', fontSize:12, fontWeight:700,
                display:'flex', alignItems:'center', justifyContent:'center' }}>
                {i + 1}
              </div>
              <span style={{ fontSize:14, lineHeight:1.5 }}>{tip}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Disclaimer */}
      <div style={{ background:'#fffbeb', border:'1px solid #fde68a',
        borderRadius:10, padding:'12px 16px', fontSize:13,
        color:'#92400e', marginBottom:24, textAlign:'center' }}>
        ⚠️ This is a wellness screening tool, not a clinical diagnosis.
        If you are in distress, please speak to your doctor or a mental health professional.
      </div>

      {/* Retake */}
      <div style={{ textAlign:'center' }}>
        <button onClick={onReset}
          style={{ padding:'12px 32px', borderRadius:24,
            background:'var(--rose)', color:'#fff', fontWeight:700, fontSize:15,
            boxShadow:'0 4px 16px rgba(225,29,116,.3)', cursor:'pointer' }}>
          🔄 Retake Assessment
        </button>
      </div>

    </div>
  )
}
