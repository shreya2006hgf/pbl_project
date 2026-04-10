import { useState } from 'react'

const NUTRIENT_COLORS = {
  recommended: '#16a34a',
  avoid:       '#dc2626',
  meal:        '#7c3aed',
}

export default function DietaryGuide({ plan, stage, subtype, onBack }) {
  const [tab, setTab] = useState('overview')
  if (!plan) return <div>No plan available.</div>

  return (
    <div className="fade-in">
      {/* Header */}
      <div style={{display:'flex', alignItems:'center', gap:12, marginBottom:24}}>
        <button onClick={onBack} style={{padding:'8px 16px', borderRadius:20,
          background:'#f5f5f4', border:'none', color:'var(--warm-gray)', fontWeight:600}}>
          ← Back
        </button>
        <div>
          <h2 style={{fontFamily:'var(--font-display)', fontSize:28}}>🥗 Personalized Dietary Plan</h2>
          <p style={{color:'var(--warm-gray)', fontSize:14}}>
            Optimized for <strong style={{color:'var(--rose)'}}>{stage}</strong> ·{' '}
            <strong style={{color:'var(--rose)'}}>{subtype}</strong>
          </p>
        </div>
      </div>

      {/* Summary card */}
      <div style={{background:'linear-gradient(135deg,#fce7f3,#fff)', borderRadius:'var(--radius)',
        padding:24, marginBottom:24, border:'1px solid var(--rose-md)',
        display:'flex', justifyContent:'space-between', alignItems:'center', flexWrap:'wrap', gap:16}}>
        <div>
          <div style={{fontSize:13, fontWeight:600, color:'var(--warm-gray)', marginBottom:6}}>
            Dietary Strategy
          </div>
          <p style={{fontSize:16, lineHeight:1.6, maxWidth:620}}>{plan.summary}</p>
        </div>
        <div style={{textAlign:'center', background:'var(--rose)', color:'#fff',
          borderRadius:'var(--radius)', padding:'16px 28px', minWidth:160}}>
          <div style={{fontSize:11, fontWeight:600, opacity:.8, marginBottom:4}}>DAILY GOAL</div>
          <div style={{fontFamily:'var(--font-display)', fontSize:20, fontWeight:700}}>
            {plan.calorie_goal}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div style={{display:'flex', gap:8, marginBottom:24}}>
        {[
          {id:'overview', label:'📊 Overview'},
          {id:'foods',    label:'✅ Eat These'},
          {id:'avoid',    label:'🚫 Avoid'},
          {id:'meal',     label:'🍽️ Meal Plan'},
        ].map(t=>(
          <button key={t.id} onClick={()=>setTab(t.id)}
            style={{padding:'10px 20px', borderRadius:24,
              background: tab===t.id ? 'var(--rose)' : '#fff',
              color: tab===t.id ? '#fff' : 'var(--warm-gray)',
              fontWeight: tab===t.id ? 700 : 500, fontSize:14,
              border: tab===t.id ? 'none' : '1.5px solid #e5e7eb',
              transition:'all .2s'}}>
            {t.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      {tab === 'overview' && <OverviewTab plan={plan} stage={stage} subtype={subtype} />}
      {tab === 'foods'    && <FoodsTab items={plan.recommended} type="recommended" />}
      {tab === 'avoid'    && <FoodsTab items={plan.avoid} type="avoid" />}
      {tab === 'meal'     && <MealTab items={plan.meal_plan} />}

      {/* Science note */}
      <div style={{marginTop:28, background:'#f0fdf4', border:'1px solid #bbf7d0',
        borderRadius:'var(--radius)', padding:20}}>
        <h3 style={{fontFamily:'var(--font-display)', fontSize:17, color:'#166534', marginBottom:8}}>
          🔬 Evidence-Based Approach
        </h3>
        <p style={{fontSize:13, color:'#15803d', lineHeight:1.6}}>
          These recommendations are derived from peer-reviewed oncology literature, including studies on
          the relationship between specific phytonutrients, receptor status, and cancer cell proliferation.
          Foods and compounds are selected based on mechanisms targeting estrogen metabolism, HER2 signaling,
          inflammatory pathways, and gut microbiome health. Always discuss dietary changes with your
          oncology team, especially during active treatment.
        </p>
      </div>
    </div>
  )
}

function OverviewTab({ plan, stage, subtype }) {
  const keyPoints = [
    { icon:'🌱', title:'Anti-inflammatory Focus', desc:'Priority on whole-food plant-based eating to reduce systemic inflammation which fuels tumor microenvironment.' },
    { icon:'⚖️', title:'Weight Management', desc:'Maintaining a healthy BMI reduces adipose-derived estrogen and IGF-1, especially important for hormone-sensitive subtypes.' },
    { icon:'🦠', title:'Gut Microbiome Health', desc:'Diverse fiber intake promotes healthy gut flora that metabolizes estrogens and improves immune surveillance.' },
    { icon:'💊', title:'Treatment Support', desc:'Nutrition is timed around treatment cycles to maximize tolerance, prevent malnutrition, and maintain muscle mass.' },
  ]
  return (
    <div style={{display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(280px,1fr))', gap:16}}>
      {keyPoints.map(p=>(
        <div key={p.title} style={{background:'#fff', borderRadius:'var(--radius)', padding:24,
          border:'1px solid #e5e7eb', boxShadow:'var(--shadow-sm)'}}>
          <div style={{fontSize:32, marginBottom:12}}>{p.icon}</div>
          <h3 style={{fontFamily:'var(--font-display)', fontSize:17, marginBottom:8}}>{p.title}</h3>
          <p style={{fontSize:14, color:'var(--warm-gray)', lineHeight:1.6}}>{p.desc}</p>
        </div>
      ))}
    </div>
  )
}

function FoodsTab({ items, type }) {
  const color = type === 'recommended' ? NUTRIENT_COLORS.recommended : NUTRIENT_COLORS.avoid
  const icon  = type === 'recommended' ? '✅' : '🚫'
  return (
    <div style={{display:'flex', flexDirection:'column', gap:14}}>
      {items.map((item, i) => (
        <div key={i} style={{background:'#fff', borderRadius:'var(--radius-sm)', padding:20,
          border:`1px solid ${color}28`, boxShadow:'var(--shadow-sm)',
          display:'flex', gap:16, alignItems:'flex-start',
          transition:'transform .2s'}}
          onMouseOver={e=>e.currentTarget.style.transform='translateX(4px)'}
          onMouseOut={e=>e.currentTarget.style.transform='none'}>
          <div style={{width:40, height:40, borderRadius:10, background:`${color}18`,
            display:'flex', alignItems:'center', justifyContent:'center',
            flexShrink:0, fontSize:20}}>{icon}</div>
          <div>
            <div style={{fontWeight:700, fontSize:15, color, marginBottom:4}}>{item.food}</div>
            <div style={{fontSize:13, color:'var(--warm-gray)', lineHeight:1.5}}>{item.reason}</div>
          </div>
        </div>
      ))}
    </div>
  )
}

function MealTab({ items }) {
  const times  = ['🌅 Breakfast', '☀️ Lunch', '🌙 Dinner', '🍎 Snack']
  const colors = ['#fef3c7','#dbeafe','#f3e8ff','#dcfce7']
  const borders= ['#fde68a','#bfdbfe','#ddd6fe','#bbf7d0']
  return (
    <div style={{display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(260px,1fr))', gap:16}}>
      {items.map((item, i) => {
        const [timeLabel, ...rest] = item.split(':')
        const mealDesc = rest.join(':').trim()
        return (
          <div key={i} style={{background:colors[i%colors.length],
            border:`2px solid ${borders[i%borders.length]}`,
            borderRadius:'var(--radius)', padding:20}}>
            <div style={{fontWeight:700, fontSize:15, marginBottom:10}}>
              {times[i] || '🍽️ Meal'}
            </div>
            <div style={{fontSize:14, lineHeight:1.6, color:'var(--charcoal)'}}>
              {mealDesc || item}
            </div>
          </div>
        )
      })}
    </div>
  )
}
