import { useState, useEffect } from 'react'

const STAGE_COLORS = {
  'Stage I':'#22c55e','Stage II':'#f59e0b','Stage III':'#f97316','Stage IV':'#ef4444'
}
const SUBTYPE_COLORS = {
  'Luminal A':'#22c55e','Luminal B':'#eab308','HER2+':'#f97316','Triple-Negative':'#ef4444'
}

export default function StageInfo({ API }) {
  const [data, setData]     = useState(null)
  const [active, setActive] = useState('Stage I')

  useEffect(() => {
    fetch(`${API}/stage_info`)
      .then(r => r.json())
      .then(setData)
      .catch(() => {})
  }, [])

  const stages   = data ? Object.entries(data.stages)   : []
  const subtypes = data ? Object.entries(data.subtypes) : []
  const activeInfo = data?.stages?.[active]

  return (
    <div className="fade-in" style={{paddingTop:32}}>
      <div style={{textAlign:'center', marginBottom:40}}>
        <h2 style={{fontFamily:'var(--font-display)', fontSize:36, marginBottom:8}}>
          Breast Cancer Stages & Subtypes
        </h2>
        <p style={{color:'var(--warm-gray)', fontSize:16}}>
          Understanding your diagnosis is the first step toward informed care.
        </p>
      </div>

      {/* Stage selector tabs */}
      <div style={{display:'flex', gap:8, marginBottom:24, justifyContent:'center'}}>
        {['Stage I','Stage II','Stage III','Stage IV'].map(s => (
          <button key={s} onClick={() => setActive(s)}
            style={{padding:'12px 24px', borderRadius:24,
              background: active===s ? STAGE_COLORS[s] : '#fff',
              color: active===s ? '#fff' : STAGE_COLORS[s],
              fontWeight:700, fontSize:15, border:`2px solid ${STAGE_COLORS[s]}`,
              transition:'all .2s'}}>
            {s}
          </button>
        ))}
      </div>

      {/* Stage detail */}
      {activeInfo && (
        <div className="fade-in" style={{background:'#fff', borderRadius:'var(--radius)',
          padding:32, border:`2px solid ${STAGE_COLORS[active]}44`,
          boxShadow:`0 8px 32px ${STAGE_COLORS[active]}18`, marginBottom:40}}>
          <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:32}}>
            <div>
              <div style={{display:'flex', alignItems:'center', gap:14, marginBottom:16}}>
                <div style={{width:56, height:56, borderRadius:'50%',
                  background:STAGE_COLORS[active], display:'flex',
                  alignItems:'center', justifyContent:'center',
                  color:'#fff', fontFamily:'var(--font-display)', fontSize:22, fontWeight:700}}>
                  {active.split(' ')[1]}
                </div>
                <div>
                  <h3 style={{fontFamily:'var(--font-display)', fontSize:24,
                    color:STAGE_COLORS[active]}}>{active}</h3>
                  <div style={{display:'inline-block', background:`${STAGE_COLORS[active]}18`,
                    color:STAGE_COLORS[active], padding:'3px 12px', borderRadius:20, fontSize:13, fontWeight:600}}>
                    {activeInfo['5yr_survival']} 5-year survival rate
                  </div>
                </div>
              </div>
              <p style={{fontSize:15, lineHeight:1.7, color:'var(--warm-gray)', marginBottom:20}}>
                {activeInfo.description}
              </p>

              {/* Survival bar */}
              <div>
                <div style={{fontSize:13, fontWeight:600, marginBottom:8}}>
                  5-Year Survival Rate
                </div>
                <div style={{height:12, borderRadius:6, background:'#f3f4f6', overflow:'hidden'}}>
                  <div style={{height:'100%', borderRadius:6,
                    background:`linear-gradient(90deg, ${STAGE_COLORS[active]}, ${STAGE_COLORS[active]}88)`,
                    width:activeInfo['5yr_survival']}}>
                  </div>
                </div>
                <div style={{fontSize:12, color:'var(--warm-gray)', marginTop:4}}>
                  {activeInfo['5yr_survival']} of patients survive ≥5 years
                </div>
              </div>
            </div>

            <div>
              <h4 style={{fontFamily:'var(--font-display)', fontSize:18, marginBottom:14}}>
                Treatment Options
              </h4>
              <div style={{display:'flex', flexDirection:'column', gap:10}}>
                {activeInfo.treatment.map((t, i) => (
                  <div key={i} style={{display:'flex', gap:12, alignItems:'flex-start',
                    padding:'12px 16px', borderRadius:10,
                    background: i===0 ? `${STAGE_COLORS[active]}12` : 'var(--light-gray)',
                    border:`1px solid ${i===0 ? STAGE_COLORS[active]+'33' : 'transparent'}`}}>
                    <div style={{width:22, height:22, borderRadius:'50%',
                      background:STAGE_COLORS[active], color:'#fff',
                      display:'flex', alignItems:'center', justifyContent:'center',
                      fontSize:11, fontWeight:700, flexShrink:0}}>{i+1}</div>
                    <span style={{fontSize:14}}>{t}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Stage timeline */}
      <div style={{marginBottom:40}}>
        <h3 style={{fontFamily:'var(--font-display)', fontSize:22, marginBottom:20,
          textAlign:'center'}}>Stage Progression Overview</h3>
        <div style={{display:'flex', alignItems:'center', gap:0, position:'relative'}}>
          <div style={{position:'absolute', top:'50%', left:0, right:0, height:3,
            background:'linear-gradient(90deg,#22c55e,#f59e0b,#f97316,#ef4444)',
            transform:'translateY(-50%)', zIndex:0}} />
          {['Stage I','Stage II','Stage III','Stage IV'].map((s,i)=>(
            <div key={s} style={{flex:1, textAlign:'center', position:'relative', zIndex:1}}
              onClick={()=>setActive(s)}>
              <div style={{width:48, height:48, borderRadius:'50%',
                background:STAGE_COLORS[s], border:'4px solid #fff',
                margin:'0 auto 12px', display:'flex', alignItems:'center',
                justifyContent:'center', cursor:'pointer',
                boxShadow:`0 0 0 3px ${active===s ? STAGE_COLORS[s] : 'transparent'}`,
                fontSize:18, fontWeight:700, color:'#fff',
                transition:'box-shadow .2s'}}>
                {['I','II','III','IV'][i]}
              </div>
              <div style={{fontSize:13, fontWeight:700, color:STAGE_COLORS[s]}}>{s}</div>
              <div style={{fontSize:12, color:'var(--warm-gray)', marginTop:2}}>
                {data?.stages?.[s]?.['5yr_survival']} survival
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Molecular subtypes section */}
      <h3 style={{fontFamily:'var(--font-display)', fontSize:24, marginBottom:20}}>
        Molecular Subtypes
      </h3>
      <div style={{display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(240px,1fr))', gap:16}}>
        {subtypes.map(([name, info]) => (
          <div key={name} style={{background:'#fff', borderRadius:'var(--radius)', padding:24,
            border:`2px solid ${SUBTYPE_COLORS[name]}33`,
            boxShadow:`0 4px 16px ${SUBTYPE_COLORS[name]}12`,
            transition:'transform .2s'}}
            onMouseOver={e=>e.currentTarget.style.transform='translateY(-4px)'}
            onMouseOut={e=>e.currentTarget.style.transform='none'}>
            <div style={{fontSize:28, marginBottom:10}}>{info.icon}</div>
            <h4 style={{fontFamily:'var(--font-display)', fontSize:18,
              color:SUBTYPE_COLORS[name], marginBottom:8}}>{name}</h4>
            <div style={{display:'inline-block', padding:'3px 10px', borderRadius:20,
              background:`${SUBTYPE_COLORS[name]}15`, color:SUBTYPE_COLORS[name],
              fontSize:12, fontWeight:600, marginBottom:10}}>
              {info.receptor}
            </div>
            <p style={{fontSize:13, color:'var(--warm-gray)', lineHeight:1.6, marginBottom:8}}>
              {info.description}
            </p>
            <p style={{fontSize:13, color:SUBTYPE_COLORS[name], fontWeight:600}}>
              📈 {info.prognosis}
            </p>
          </div>
        ))}
      </div>

      {/* PAM50 note */}
      <div style={{marginTop:32, background:'#eff6ff', border:'1px solid #bfdbfe',
        borderRadius:'var(--radius)', padding:20}}>
        <h4 style={{fontFamily:'var(--font-display)', fontSize:17, color:'#1e40af', marginBottom:8}}>
          🧬 About Molecular Subtyping (PAM50)
        </h4>
        <p style={{fontSize:13, color:'#1d4ed8', lineHeight:1.6}}>
          Molecular subtype classification is based on the PAM50 gene expression signature,
          which analyzes 50 key genes to categorize breast cancer into intrinsic subtypes.
          This classification drives treatment decisions more accurately than receptor status alone,
          as subtypes differ in their response to endocrine therapy, chemotherapy, and targeted agents.
          Our model uses gene expression data from the GSE2034, BC-TCGA, and Simulation datasets
          to classify samples into these four clinically validated subtypes.
        </p>
      </div>
    </div>
  )
}
