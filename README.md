# 🎗️ Curivia — Breast Cancer Intelligence Platform

**AI-powered breast cancer stage prediction, molecular subtyping, and personalized dietary guidance.**

Built using gene expression data from **GSE2034**, **BC-TCGA**, and **Simulation** datasets.  
Developed for PBL Project — School of Computer Science, Manipal University.

---

## 🗂 Project Structure

```
curivia/
├── ml/
│   ├── train_model.py          ← ML training script (run once)
│   └── models/                 ← Auto-generated after training
│       ├── stage_classifier.pkl
│       ├── subtype_classifier.pkl
│       └── model_meta.pkl
│
├── backend/
│   └── app.py                  ← Flask REST API (port 5000)
│
├── frontend/
│   ├── index.html
│   ├── vite.config.js
│   ├── package.json
│   └── src/
│       ├── main.jsx
│       ├── App.jsx             ← Main app + routing + header/footer
│       ├── index.css           ← Global styles
│       └── components/
│           ├── PatientForm.jsx ← Clinical input form
│           ├── ResultsPanel.jsx← Stage/subtype results + charts
│           ├── DietaryGuide.jsx← AI dietary recommendations
│           ├── StageInfo.jsx   ← Stage & subtype education page
│           └── DatasetInfo.jsx ← Dataset stats & model info
│
├── requirements.txt
└── README.md
```

---

## ⚙️ Setup Instructions (VS Code)

### 1. Dataset Setup

Place the extracted datasets in your project root (same level as `ml/`, `backend/`, `frontend/`):

```
GSE2034/
  GSE2034/
    GSE2034-Tumor.txt
    GSE2034-Normal.txt
BC-TCGA/
  BC-TCGA/
    BC-TCGA-Tumor.txt
    BC-TCGA-Normal.txt
SimData/
  Simulation-Data/
    Simulation-Data-Tumor.txt
    Simulation-Data-Normal.txt
```

### 2. Python Environment

```bash
# Create virtual environment (recommended)
python -m venv venv
source venv/bin/activate       # macOS/Linux
venv\Scripts\activate          # Windows

# Install dependencies
pip install -r requirements.txt
```

### 3. Train the ML Model (Run Once)

```bash
python ml/train_model.py
```

Expected output:
```
Loading GSE2034... → 286 samples, 500 genes
Loading BC_TCGA... → 590 samples, 500 genes
Loading Simulation... → 200 samples, 500 genes
Unified matrix: (1076, 100)
Training STAGE classifier...   Stage accuracy: 0.477
Training SUBTYPE classifier... Subtype accuracy: 0.579
Models saved to ml/models/
```

> **Note on accuracy:** Labels are assigned via heuristic methods (no ground-truth clinical staging is embedded in the raw expression files). In a clinical deployment, you would use actual TNM staging labels from clinical metadata.

### 4. Start the Backend

```bash
# Terminal 1
python backend/app.py
```

Backend runs at: `http://localhost:5000`

Test it: `http://localhost:5000/api/health`

### 5. Start the Frontend

```bash
# Terminal 2
cd frontend
npm install
npm run dev
```

Frontend runs at: `http://localhost:3000`

---

## 🌐 API Endpoints

| Method | Endpoint             | Description                        |
|--------|---------------------|------------------------------------|
| GET    | `/api/health`        | Check server and model status      |
| POST   | `/api/predict`       | Predict stage, subtype, diet plan  |
| POST   | `/api/dietary_guide` | Get diet plan by stage+subtype     |
| GET    | `/api/stage_info`    | All stage and subtype info         |
| GET    | `/api/datasets_info` | Dataset statistics + model accuracy|

### `/api/predict` — Request Body

```json
{
  "age": 52,
  "tumor_size_mm": 22,
  "lymph_nodes": 2,
  "er_positive": true,
  "pr_positive": true,
  "her2_positive": false,
  "ki67_percent": 18,
  "grade": 2,
  "metastasis": false,
  "patient_name": "Jane Doe"
}
```

### `/api/predict` — Response

```json
{
  "stage": "Stage II",
  "subtype": "Luminal B",
  "stage_info": {
    "description": "...",
    "5yr_survival": "86%",
    "treatment": ["Surgery", "Chemotherapy", "..."],
    "color": "#f59e0b",
    "severity": 2
  },
  "subtype_info": { "description": "...", "receptor": "ER+/PR+ with HER2+ or high Ki-67", "..." },
  "stage_probs":   { "Stage I": 0.12, "Stage II": 0.62, "Stage III": 0.18, "Stage IV": 0.08 },
  "subtype_probs": { "Luminal A": 0.08, "Luminal B": 0.70, "HER2+": 0.11, "Triple-Negative": 0.11 },
  "dietary_plan": {
    "summary": "...",
    "recommended": [{ "food": "...", "reason": "..." }],
    "avoid": [...],
    "meal_plan": ["Breakfast: ...", "Lunch: ...", "Dinner: ...", "Snack: ..."],
    "calorie_goal": "2000-2200 kcal/day"
  },
  "disclaimer": "This tool is for educational purposes only..."
}
```

---

## 🧬 ML Model Architecture

### Datasets Used
| Dataset    | Source | Samples | Description |
|------------|--------|---------|-------------|
| GSE2034    | GEO    | ~286    | Microarray — lymph-node-negative patients |
| BC-TCGA    | TCGA   | ~590    | RNA-seq — TCGA breast cancer cohort |
| Simulation | Synthetic | ~200 | Simulated expression profiles |

### Training Pipeline
1. **Load & Transpose** — gene expression matrices (genes × samples → samples × genes)
2. **Feature Selection** — Top 500 genes by variance
3. **Label Heuristics** — Stage from expression variance; Subtype from receptor-proxy genes
4. **PCA** — 100 components per dataset, aligned into a unified 1076×100 matrix
5. **Stage Classifier** — RandomForest(200 trees, max_depth=15)
6. **Subtype Classifier** — GradientBoosting(150 trees, lr=0.1, max_depth=5)
7. **Inference** — Clinical input → TNM-based rules + ML probabilities

### Molecular Subtypes (PAM50 Proxy)
| Subtype       | ER | PR | HER2 | Ki-67 | Prognosis |
|---------------|----|----|------|-------|-----------|
| Luminal A     | +  | +  | −    | Low   | Best      |
| Luminal B     | +  | +  | ±    | High  | Good      |
| HER2+         | −  | −  | +    | High  | Good with targeted Tx |
| Triple-Negative| − | −  | −    | High  | Aggressive |

---

## 🥗 Dietary Recommendations

The system provides **evidence-based dietary guidance** specific to each combination of stage (I–IV) and subtype (Luminal A, Luminal B, HER2+, Triple-Negative) — 16 unique plans total.

Each plan includes:
- Strategic summary tailored to the cancer's biology
- ✅ Recommended foods with mechanism-based explanations
- 🚫 Foods to avoid with clinical reasoning
- 🍽️ Sample daily meal plan
- 📊 Daily calorie goal adjusted by treatment intensity

---

## ⚕️ Medical Disclaimer

> Curivia is an **educational and research tool**. It does not replace professional medical advice, diagnosis, or treatment. Always consult a qualified oncologist for clinical decisions. The dietary recommendations are based on published research but are not a substitute for personalized clinical nutrition counseling.

---

## 🚀 VS Code Recommended Extensions

- Python
- Pylance
- ES7+ React/Redux/React-Native snippets
- Thunder Client (API testing)
- GitLens
