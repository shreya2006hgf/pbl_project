import { useState, useEffect } from 'react'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Cell } from 'recharts'

export default function DatasetInfo({ API }) {
  const [info, setInfo] = useState(null)

  useEffect(() => {
    fetch(`${API}/datasets_info`).then(r=>r.json()).then(setInfo).catch(()=>{})
  }, [])

  const chartData = info?.datasets?.map(d => ({ name: d.name, samples: d.samples })) || []
  const COLORS = ['#e11d74','#7c3aed','#0891b2']

  const modelSteps = [
    { step:'1', title:'Data Loading', desc:'Load tumor and normal expression matrices from all 3 datasets (GSE2034, BC-TCGA, Simulation). Transpose to samples × genes format.' },
    { step:'2', title:'Feature Selection', desc:'Select top 500 genes by variance within each dataset. This removes low-information genes and reduces dimensionality.' },
    { step:'3', title:'Label Assignment', desc:'Assign cancer stage labels using expression variance heuristics (Stage I–IV). Assign molecular subtype labels using receptor-proxy gene expression patterns.' },
    { step:'4', title:'PCA Alignment', desc:'Apply PCA (100 components) per dataset to align gene spaces across datasets. Stack all PCA representations into a unified feature matrix.' },
    { step:'5', title:'Model Training', desc:'Train RandomForestClassifier (200 trees) for stage prediction. Train GradientBoostingClassifier (150 estimators) for subtype classification. 80/20 train/test split.' },
    { step:'6', title:'Inference API', desc:'Clinical inputs (tumor size, lymph nodes, ER/PR/HER2 status, Ki-67) are mapped to TNM-based rules combined with model output for final predictions.' },
  ]

  return (
    <div className="fade-in" style={{paddingTop:32}}>
      <div style={{textAlign:'center', marginBottom:40}}>
        <h2 style={{fontFamily:'var(--font-display)', fontSize:36, marginBottom:8}}>
          Datasets & Model Architecture
        </h2>
        <p style={{color:'var(--warm-gray)', fontSize:16}}>
          Transparent documentation of data sources, training pipeline, and model performance.
        </p>
      </div>

      {/* Dataset cards */}
      <div style={{display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(280px,1fr))',
        gap:20, marginBottom:40}}>
        {(info?.datasets || []).map((d,i) => (
          <div key={d.name} style={{background:'#fff', borderRadius:'var(--radius)', padding:24,
            border:`2px solid ${COLORS[i]}33`, boxShadow:'var(--shadow-sm)'}}>
            <div style={{display:'flex', justifyContent:'space-between', alignItems:'flex-start',
              marginBottom:14}}>
              <h3 style={{fontFamily:'var(--font-display)', fontSize:20, color:COLORS[i]}}>
                {d.name}
              </h3>
              <span style={{padding:'4px 10px', borderRadius:20,
                background:`${COLORS[i]}15`, color:COLORS[i], fontSize:12, fontWeight:600}}>
                {d.source}
              </span>
            </div>
            <div style={{fontSize:28, fontWeight:700, color:COLORS[i],
              fontFamily:'var(--font-display)', marginBottom:4}}>
              {d.samples}
            </div>
            <div style={{fontSize:13, color:'var(--warm-gray)', marginBottom:12}}>samples</div>
            <p style={{fontSize:13, color:'var(--warm-gray)', lineHeight:1.5}}>{d.description}</p>
          </div>
        ))}
      </div>

      {/* Chart */}
      <div style={{background:'#fff', borderRadius:'var(--radius)', padding:28,
        boxShadow:'var(--shadow-sm)', border:'1px solid #e5e7eb', marginBottom:40}}>
        <h3 style={{fontFamily:'var(--font-display)', fontSize:20, marginBottom:20}}>
          Sample Distribution Across Datasets
        </h3>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
            <XAxis dataKey="name" tick={{fontSize:13}} />
            <YAxis tick={{fontSize:12}} />
            <Tooltip formatter={(v) => [`${v} samples`, 'Count']} />
            <Bar dataKey="samples" radius={[6,6,0,0]}>
              {chartData.map((entry,i) => <Cell key={i} fill={COLORS[i]} />)}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
        <div style={{display:'flex', gap:16, justifyContent:'center', marginTop:12}}>
          {chartData.map((d,i)=>(
            <div key={d.name} style={{display:'flex', alignItems:'center', gap:6, fontSize:13}}>
              <div style={{width:12,height:12,borderRadius:2,background:COLORS[i]}} />
              {d.name}
            </div>
          ))}
        </div>
      </div>

      {/* Model accuracy */}
      <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:20, marginBottom:40}}>
        <MetricCard title="Stage Classifier" value={
          info?.model_accuracy?.stage_classifier
            ? `${Math.round(info.model_accuracy.stage_classifier*100)}%`
            : 'N/A'
        } subtitle="Random Forest · 200 trees · 100 PCA features"
          note="Accuracy limited by heuristic label assignment (no ground-truth clinical staging in dataset)"
          color="#e11d74" icon="📊" />
        <MetricCard title="Subtype Classifier" value={
          info?.model_accuracy?.subtype_classifier
            ? `${Math.round(info.model_accuracy.subtype_classifier*100)}%`
            : 'N/A'
        } subtitle="Gradient Boosting · 150 estimators · lr=0.1"
          note="Subtype accuracy reflects PAM50-proxy label assignment from receptor-status gene heuristics"
          color="#7c3aed" icon="🧬" />
      </div>

      {/* Training pipeline */}
      <h3 style={{fontFamily:'var(--font-display)', fontSize:24, marginBottom:20}}>
        🔬 Training Pipeline
      </h3>
      <div style={{display:'flex', flexDirection:'column', gap:14, marginBottom:40}}>
        {modelSteps.map((s,i) => (
          <div key={i} style={{display:'flex', gap:16, alignItems:'flex-start',
            background:'#fff', borderRadius:'var(--radius-sm)', padding:'18px 20px',
            border:'1px solid #e5e7eb', boxShadow:'var(--shadow-sm)'}}>
            <div style={{width:36, height:36, borderRadius:'50%',
              background:'var(--rose)', color:'#fff', fontWeight:700, fontSize:16,
              display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0}}>
              {s.step}
            </div>
            <div>
              <div style={{fontWeight:700, fontSize:15, marginBottom:4}}>{s.title}</div>
              <div style={{fontSize:13, color:'var(--warm-gray)', lineHeight:1.6}}>{s.desc}</div>
            </div>
          </div>
        ))}
      </div>

      {/* How to train */}
      <div style={{background:'#1c1917', borderRadius:'var(--radius)', padding:28, color:'#fff'}}>
        <h3 style={{fontFamily:'var(--font-display)', fontSize:20, marginBottom:16, color:'#fbcfe8'}}>
          💻 How to Retrain the Model
        </h3>
        <pre style={{background:'#292524', borderRadius:10, padding:20, fontSize:13,
          lineHeight:1.8, overflowX:'auto', color:'#e7e5e4'}}>
{`# 1. Place datasets in correct directories:
GSE2034/GSE2034/GSE2034-Tumor.txt
GSE2034/GSE2034/GSE2034-Normal.txt
BC-TCGA/BC-TCGA/BC-TCGA-Tumor.txt
BC-TCGA/BC-TCGA/BC-TCGA-Normal.txt
SimData/Simulation-Data/Simulation-Data-Tumor.txt
SimData/Simulation-Data/Simulation-Data-Normal.txt

# 2. Install requirements:
pip install pandas scikit-learn numpy joblib flask

# 3. Train models (saves to ml/models/):
python ml/train_model.py

# 4. Start backend server:
python backend/app.py

# 5. Start frontend (in another terminal):
cd frontend && npm install && npm run dev

# App runs at http://localhost:3000`}
        </pre>
      </div>
    </div>
  )
}

function MetricCard({ title, value, subtitle, note, color, icon }) {
  return (
    <div style={{background:'#fff', borderRadius:'var(--radius)', padding:24,
      border:`2px solid ${color}28`, boxShadow:'var(--shadow-sm)'}}>
      <div style={{display:'flex', alignItems:'center', gap:12, marginBottom:12}}>
        <span style={{fontSize:28}}>{icon}</span>
        <h4 style={{fontFamily:'var(--font-display)', fontSize:18, color}}>{title}</h4>
      </div>
      <div style={{fontFamily:'var(--font-display)', fontSize:48, fontWeight:700, color,
        marginBottom:4}}>{value}</div>
      <div style={{fontSize:13, color:'var(--warm-gray)', marginBottom:12}}>{subtitle}</div>
      <div style={{background:`${color}10`, borderRadius:8, padding:'10px 14px',
        fontSize:12, color:'var(--warm-gray)', fontStyle:'italic', lineHeight:1.5}}>
        ℹ️ {note}
      </div>
    </div>
  )
}
