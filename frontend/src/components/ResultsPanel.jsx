import { RadarChart, Radar, PolarGrid, PolarAngleAxis,
         PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts'

const STAGE_COLORS = {
  'Stage I':'#22c55e','Stage II':'#f59e0b','Stage III':'#f97316','Stage IV':'#ef4444'
}
const SUBTYPE_COLORS = {
  'Luminal A':'#22c55e','Luminal B':'#eab308','HER2+':'#f97316','Triple-Negative':'#ef4444'
}

export default function ResultsPanel({ results, onBack, onDiet }) {
  const { stage, subtype, stage_info, subtype_info, stage_probs, subtype_probs, disclaimer } = results
  const sc = STAGE_COLORS[stage]   || '#6b7280'
  const tc = SUBTYPE_COLORS[subtype] || '#6b7280'

  const stageData   = Object.entries(stage_probs).map(([name,val])=>({name,value:Math.round(val*100)}))
  const subtypeData = Object.entries(subtype_probs).map(([name,val])=>({name,value:Math.round(val*100)}))

  const radarData = [
    {subject:'Tumor Size',  A: stage_info.severity*25},
    {subject:'Lymph Nodes', A: stage_info.severity*20},
    {subject:'Proliferation',A: stage_info.severity*22},
    {subject:'Invasion',    A: stage_info.severity*18},
    {subject:'Metastasis',  A: stage_info.severity*15},
  ]

  return (
    <div className="fade-in">
      <div style={{display:'flex', alignItems:'center', gap:12, marginBottom:28}}>
        <button onClick={onBack} style={{padding:'8px 16px', borderRadius:20,
          background:'#f5f5f4', border:'none', color:'var(--warm-gray)', fontWeight:600}}>
          ← Back
        </button>
        <h2 style={{fontFamily:'var(--font-display)', fontSize:28}}>Analysis Results</h2>
        <button onClick={onDiet} style={{marginLeft:'auto', padding:'10px 24px',
          borderRadius:24, background:'var(--sage)', color:'#fff', fontWeight:700}}>
          🥗 View Diet Plan
        </button>
      </div>

      {/* ── Hero result cards ──────────────────────────────────────────────── */}
      <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:20, marginBottom:28}}>
        <HeroCard icon="📊" label="Cancer Stage" value={stage} color={sc}
          detail={stage_info.description} badge={`${stage_info['5yr_survival']} 5-yr survival`} />
        <HeroCard icon={subtype_info.icon} label="Molecular Subtype" value={subtype} color={tc}
          detail={subtype_info.description} badge={subtype_info.receptor} />
      </div>

      {/* ── Charts row ────────────────────────────────────────────────────── */}
      <div style={{display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:20, marginBottom:28}}>
        {/* Stage probability pie */}
        <ChartCard title="Stage Probability">
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie data={stageData} cx="50%" cy="50%" innerRadius={55} outerRadius={85}
                paddingAngle={3} dataKey="value">
                {stageData.map((entry,i)=>(
                  <Cell key={i} fill={Object.values(STAGE_COLORS)[i]} opacity={entry.name===stage?1:.4} />
                ))}
              </Pie>
              <Tooltip formatter={(v)=>`${v}%`} />
              <Legend iconSize={10} />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* Subtype probability pie */}
        <ChartCard title="Subtype Probability">
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie data={subtypeData} cx="50%" cy="50%" innerRadius={55} outerRadius={85}
                paddingAngle={3} dataKey="value">
                {subtypeData.map((entry,i)=>(
                  <Cell key={i} fill={Object.values(SUBTYPE_COLORS)[i]} opacity={entry.name===subtype?1:.4} />
                ))}
              </Pie>
              <Tooltip formatter={(v)=>`${v}%`} />
              <Legend iconSize={10} />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* Radar */}
        <ChartCard title="Risk Profile">
          <ResponsiveContainer width="100%" height={220}>
            <RadarChart data={radarData}>
              <PolarGrid stroke="#e5e7eb" />
              <PolarAngleAxis dataKey="subject" tick={{fontSize:11}} />
              <Radar name="Risk" dataKey="A" stroke={sc} fill={sc} fillOpacity={0.35} />
            </RadarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      {/* ── Treatment recommendations ──────────────────────────────────────── */}
      <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:20, marginBottom:20}}>
        <div style={{background:'#fff', borderRadius:'var(--radius)', padding:24,
          border:'1px solid #e5e7eb', boxShadow:'var(--shadow-sm)'}}>
          <h3 style={{fontFamily:'var(--font-display)', fontSize:18, marginBottom:16,
            color:'var(--charcoal)'}}>💊 Recommended Treatments</h3>
          <div style={{display:'flex', flexDirection:'column', gap:10}}>
            {stage_info.treatment.map((t,i)=>(
              <div key={i} style={{display:'flex', gap:12, alignItems:'flex-start',
                padding:'10px 14px', borderRadius:10,
                background:i===0?`${sc}12`:'var(--light-gray)'}}>
                <span style={{color:sc, fontWeight:700, fontSize:13}}>{i+1}</span>
                <span style={{fontSize:14}}>{t}</span>
              </div>
            ))}
          </div>
        </div>

        <div style={{background:'#fff', borderRadius:'var(--radius)', padding:24,
          border:'1px solid #e5e7eb', boxShadow:'var(--shadow-sm)'}}>
          <h3 style={{fontFamily:'var(--font-display)', fontSize:18, marginBottom:16}}>
            📋 Stage Progression Bar
          </h3>
          {['Stage I','Stage II','Stage III','Stage IV'].map((s,i)=>{
            const si = ['Stage I','Stage II','Stage III','Stage IV'].indexOf(stage)
            const active = i <= si
            return (
              <div key={s} style={{marginBottom:12}}>
                <div style={{display:'flex', justifyContent:'space-between',
                  marginBottom:4, fontSize:13}}>
                  <span style={{fontWeight:s===stage?700:400, color:s===stage?sc:'var(--warm-gray)'}}>
                    {s===stage?'▶ ':''}{s}
                  </span>
                  <span style={{color:active?Object.values(STAGE_COLORS)[i]:'#d1d5db', fontSize:12}}>
                    {['99%','86%','57%','28%'][i]} survival
                  </span>
                </div>
                <div style={{height:8, borderRadius:4, background:'#f3f4f6', overflow:'hidden'}}>
                  <div style={{height:'100%',
                    width: active ? '100%' : '0%',
                    background: Object.values(STAGE_COLORS)[i],
                    borderRadius:4, opacity: s===stage?1:.4,
                    transition:'width 1s ease'}} />
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Disclaimer */}
      <div style={{background:'#fffbeb', border:'1px solid #fde68a', borderRadius:10,
        padding:'12px 16px', fontSize:13, color:'#92400e', textAlign:'center'}}>
        ⚠️ {disclaimer}
      </div>
    </div>
  )
}

function HeroCard({ icon, label, value, color, detail, badge }) {
  return (
    <div style={{background:'#fff', borderRadius:'var(--radius)', padding:28,
      border:`2px solid ${color}33`, boxShadow:`0 4px 20px ${color}18`,
      position:'relative', overflow:'hidden'}}>
      <div style={{position:'absolute', top:-20, right:-20, width:120, height:120,
        borderRadius:'50%', background:color, opacity:.07}} />
      <div style={{fontSize:13, color:'var(--warm-gray)', marginBottom:6, fontWeight:600}}>{label}</div>
      <div style={{display:'flex', alignItems:'center', gap:12, marginBottom:10}}>
        <span style={{fontSize:32}}>{icon}</span>
        <span style={{fontFamily:'var(--font-display)', fontSize:28, fontWeight:700, color}}>{value}</span>
      </div>
      <p style={{fontSize:13, color:'var(--warm-gray)', lineHeight:1.5, marginBottom:10}}>{detail}</p>
      <div style={{display:'inline-block', padding:'4px 12px', borderRadius:20,
        background:`${color}18`, color, fontSize:12, fontWeight:600}}>{badge}</div>
    </div>
  )
}

function ChartCard({ title, children }) {
  return (
    <div style={{background:'#fff', borderRadius:'var(--radius)', padding:20,
      border:'1px solid #e5e7eb', boxShadow:'var(--shadow-sm)'}}>
      <h3 style={{fontFamily:'var(--font-display)', fontSize:15, marginBottom:8,
        color:'var(--charcoal)'}}>{title}</h3>
      {children}
    </div>
  )
}
