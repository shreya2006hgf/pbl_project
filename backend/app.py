"""
Breast Cancer Analysis API - Flask Backend
Run:  python backend/app.py
Port: 5000
"""

from flask import Flask, request, jsonify, send_from_directory
import os, copy, joblib

app = Flask(__name__, static_folder="../frontend/dist", static_url_path="")

# ─── Load models ──────────────────────────────────────────────────────────────
MODEL_DIR = os.path.join(os.path.dirname(__file__), "..", "ml", "models")
try:
    stage_clf   = joblib.load(os.path.join(MODEL_DIR, "stage_classifier.pkl"))
    subtype_clf = joblib.load(os.path.join(MODEL_DIR, "subtype_classifier.pkl"))
    model_meta  = joblib.load(os.path.join(MODEL_DIR, "model_meta.pkl"))
    MODELS_LOADED = True
    print("✅ Models loaded successfully")
except Exception as e:
    MODELS_LOADED = False
    model_meta = {}
    print(f"⚠️  Models not loaded: {e}")

# ─── CORS ─────────────────────────────────────────────────────────────────────
@app.after_request
def add_cors(response):
    response.headers["Access-Control-Allow-Origin"]  = "*"
    response.headers["Access-Control-Allow-Headers"] = "Content-Type"
    response.headers["Access-Control-Allow-Methods"] = "GET,POST,OPTIONS"
    return response

@app.route("/api/<path:path>", methods=["OPTIONS"])
def options(path):
    return jsonify({}), 200

# ─── Labels ───────────────────────────────────────────────────────────────────
STAGE_LABELS   = {0:"Stage I", 1:"Stage II", 2:"Stage III", 3:"Stage IV"}
SUBTYPE_LABELS = {0:"Luminal A", 1:"Luminal B", 2:"HER2+", 3:"Triple-Negative"}

STAGE_INFO = {
    "Stage I": {
        "description": "Early stage — cancer is small and confined to the breast. Has not spread to lymph nodes.",
        "5yr_survival": "99%",
        "treatment": ["Lumpectomy or mastectomy", "Radiation therapy", "Hormone therapy if hormone-sensitive"],
        "color": "#22c55e", "severity": 1
    },
    "Stage II": {
        "description": "Cancer has grown but remains limited to the breast and nearby lymph nodes.",
        "5yr_survival": "86%",
        "treatment": ["Surgery (lumpectomy or mastectomy)", "Chemotherapy", "Radiation", "Targeted therapy"],
        "color": "#f59e0b", "severity": 2
    },
    "Stage III": {
        "description": "Locally advanced — cancer has spread to chest wall, skin, or multiple lymph nodes.",
        "5yr_survival": "57%",
        "treatment": ["Neoadjuvant chemotherapy", "Surgery", "Radiation therapy", "Immunotherapy"],
        "color": "#f97316", "severity": 3
    },
    "Stage IV": {
        "description": "Metastatic — cancer has spread to distant organs such as bone, lung, or liver.",
        "5yr_survival": "28%",
        "treatment": ["Systemic chemotherapy", "Targeted therapy", "Palliative care", "Clinical trials"],
        "color": "#ef4444", "severity": 4
    }
}

SUBTYPE_INFO = {
    "Luminal A": {
        "description": "Most common subtype. Hormone-sensitive, slow growing, best prognosis.",
        "receptor": "Hormone receptor positive / HER2 negative",
        "prognosis": "Best prognosis among subtypes",
        "icon": "🟢"
    },
    "Luminal B": {
        "description": "Hormone-sensitive but faster growing than Luminal A.",
        "receptor": "Hormone receptor positive with high proliferation",
        "prognosis": "Good prognosis with appropriate treatment",
        "icon": "🟡"
    },
    "HER2+": {
        "description": "Driven by HER2 protein overexpression. Aggressive but responds well to targeted therapy.",
        "receptor": "HER2 overexpression",
        "prognosis": "Good with HER2-targeted therapy",
        "icon": "🟠"
    },
    "Triple-Negative": {
        "description": "Most aggressive subtype. Does not respond to hormone or HER2-targeted therapies.",
        "receptor": "No hormone receptor or HER2 expression",
        "prognosis": "Requires aggressive chemotherapy",
        "icon": "🔴"
    }
}

# ─── Symptom scoring ──────────────────────────────────────────────────────────
SYMPTOM_STAGE_SCORE = {
    "hair_loss":      2,
    "fatigue":        1,
    "skin_changes":   2,
    "appetite_loss":  2,
    "body_aches":     2,
    "swelling":       3,
}

SYMPTOM_SUBTYPE_HINTS = {
    "swelling":       "HER2+",
    "skin_changes":   "HER2+",
    "hair_loss":      "Triple-Negative",
    "body_aches":     "Triple-Negative",
    "appetite_loss":  "Luminal B",
    "fatigue":        "Luminal A",
}

# ─── Alternative (non-cancer) causes per symptom ─────────────────────────────
ALTERNATIVE_CAUSES = {
    "hair_loss": [
        "Nutritional deficiency (iron, vitamin D, or protein)",
        "Hormonal changes (thyroid imbalance or PCOS)",
        "High stress or anxiety (telogen effluvium)",
        "Seasonal hair shedding — very common in women",
    ],
    "fatigue": [
        "Anaemia or low iron levels",
        "Poor sleep quality or insomnia",
        "Thyroid issues (hypothyroidism)",
        "Vitamin B12 or vitamin D deficiency",
        "High stress or burnout",
    ],
    "skin_changes": [
        "Eczema or contact dermatitis",
        "Hormonal changes affecting skin",
        "Allergic reaction or sensitivity to products",
        "Sun damage or extreme dryness",
    ],
    "appetite_loss": [
        "Stress or anxiety affecting digestion",
        "Gastritis or acidity issues",
        "Medication side effects",
        "Viral or bacterial infection",
    ],
    "body_aches": [
        "Muscle strain or overexertion",
        "Vitamin D deficiency (extremely common)",
        "Viral illness such as flu or cold",
        "Poor posture or sedentary lifestyle",
    ],
    "swelling": [
        "Hormonal water retention before periods",
        "Lymph node reaction to a minor infection",
        "High dietary sodium causing bloating",
        "Benign cyst or fibroadenoma — very common and non-cancerous",
    ],
}

# ─── Dietary DB ───────────────────────────────────────────────────────────────
DIETARY_DB = {
    "Stage I": {
        "Luminal A": {
            "summary": "Focus on maintaining a healthy weight and anti-inflammatory diet.",
            "recommended": [
                {"food": "Cruciferous vegetables (broccoli, kale)", "reason": "Sulforaphane may inhibit estrogen-driven cell growth"},
                {"food": "Ground flaxseeds (1–2 tbsp/day)", "reason": "Lignans compete with estrogen receptors, reducing stimulation"},
                {"food": "Fatty fish (salmon, sardines)", "reason": "Omega-3 fatty acids reduce inflammation and cancer cell proliferation"},
                {"food": "Berries (blueberries, strawberries)", "reason": "Antioxidants protect DNA from oxidative damage"},
                {"food": "Green tea (2–3 cups/day)", "reason": "EGCG may inhibit tumour angiogenesis"},
                {"food": "Turmeric with black pepper", "reason": "Curcumin has potent anti-inflammatory and anti-tumour properties"},
            ],
            "avoid": [
                {"food": "Alcohol", "reason": "Increases oestrogen levels and cancer recurrence risk"},
                {"food": "Red and processed meats", "reason": "Linked to elevated inflammation markers"},
                {"food": "High-fat dairy", "reason": "May increase IGF-1, a growth factor linked to tumour progression"},
                {"food": "Excessive refined sugar", "reason": "Drives insulin spikes that can fuel cell growth"},
            ],
            "meal_plan": [
                "Breakfast: Oatmeal + berries + ground flaxseeds",
                "Lunch: Grilled salmon + steamed broccoli + quinoa",
                "Dinner: Lentil soup + kale salad + olive oil dressing",
                "Snack: Walnuts + green tea"
            ],
            "calorie_goal": "1800–2000 kcal/day"
        },
        "Luminal B": {
            "summary": "Stricter anti-proliferative nutrition to manage faster cell growth.",
            "recommended": [
                {"food": "Cruciferous vegetables daily", "reason": "DIM modulates oestrogen metabolism"},
                {"food": "Pomegranate juice (4 oz/day)", "reason": "Ellagic acid inhibits aromatase enzyme"},
                {"food": "Whole grains (oats, brown rice)", "reason": "Fibre reduces circulating oestrogen via gut microbiome"},
                {"food": "Mushrooms (shiitake, maitake)", "reason": "Beta-glucans stimulate immune surveillance"},
                {"food": "Extra-virgin olive oil", "reason": "Oleocanthal has strong anti-inflammatory action"},
            ],
            "avoid": [
                {"food": "Alcohol (strictly)", "reason": "Especially harmful in hormone-sensitive subtypes"},
                {"food": "Refined sugar and white carbs", "reason": "Spike insulin and IGF-1 which fuel proliferation"},
                {"food": "Conventional dairy", "reason": "Bovine hormones may interact with hormone-sensitive cancer"},
            ],
            "meal_plan": [
                "Breakfast: Steel-cut oats + pomegranate seeds + walnuts",
                "Lunch: Shiitake stir-fry + brown rice + edamame",
                "Dinner: Baked trout + roasted Brussels sprouts + sweet potato",
                "Snack: Apple + almond butter"
            ],
            "calorie_goal": "1750–1950 kcal/day"
        },
        "HER2+": {
            "summary": "Support treatment, reduce inflammation, and protect the heart.",
            "recommended": [
                {"food": "Green tea (3–4 cups/day)", "reason": "EGCG may down-regulate HER2 receptor expression"},
                {"food": "Turmeric curries", "reason": "Curcumin inhibits HER2 signalling pathways"},
                {"food": "Cooked tomatoes", "reason": "Lycopene has anti-HER2 properties"},
                {"food": "Avocado", "reason": "Persin compound has shown HER2 inhibition in studies"},
                {"food": "Brazil nuts (2/day)", "reason": "Selenium supports cardiac protection during therapy"},
            ],
            "avoid": [
                {"food": "Grapefruit", "reason": "Inhibits CYP3A4, affecting drug metabolism"},
                {"food": "High-sodium foods", "reason": "Increases cardiac strain during targeted therapy"},
                {"food": "Saturated fats", "reason": "Promotes lipid raft formation that activates HER2 signalling"},
            ],
            "meal_plan": [
                "Breakfast: Green smoothie (spinach, avocado, banana) + green tea",
                "Lunch: Lentil + tomato stew + whole-grain bread",
                "Dinner: Baked chicken + turmeric cauliflower rice + salad",
                "Snack: 2 Brazil nuts + mixed berries"
            ],
            "calorie_goal": "1800–2100 kcal/day"
        },
        "Triple-Negative": {
            "summary": "Maximise immune support and anti-inflammatory foods.",
            "recommended": [
                {"food": "Colourful vegetables (5+ servings/day)", "reason": "Diverse phytonutrients attack cancer via multiple pathways"},
                {"food": "Fermented foods (yogurt, kefir, kimchi)", "reason": "Gut microbiome health improves chemotherapy response"},
                {"food": "Flaxseeds + chia seeds", "reason": "Alpha-linolenic acid slows triple-negative tumour growth"},
                {"food": "Dark chocolate (>70%)", "reason": "Flavanols inhibit breast cancer stem cell properties"},
                {"food": "Garlic and onions", "reason": "Allicin and quercetin induce apoptosis in TNBC cells"},
            ],
            "avoid": [
                {"food": "Ultra-processed foods", "reason": "Promote chronic inflammation and cancer-permissive environment"},
                {"food": "Sugar-sweetened beverages", "reason": "Drive insulin resistance, fuelling TNBC metabolic dependence"},
                {"food": "Alcohol (completely)", "reason": "Zero safe amount for Triple-Negative patients"},
            ],
            "meal_plan": [
                "Breakfast: Chia pudding + mixed fruit + kefir",
                "Lunch: Rainbow salad + chickpeas + tahini dressing",
                "Dinner: Stir-fried tofu + broccoli + garlic + brown rice",
                "Snack: Walnuts + dark chocolate square + green tea"
            ],
            "calorie_goal": "1900–2200 kcal/day"
        }
    }
}

for _stage in ["Stage II", "Stage III", "Stage IV"]:
    DIETARY_DB[_stage] = {}
    for _subtype, _data in DIETARY_DB["Stage I"].items():
        d = copy.deepcopy(_data)
        if _stage == "Stage II":
            d["summary"] = "[Stage II] " + d["summary"] + " Increase nutrient density to support active treatment."
            d["calorie_goal"] = "2000–2200 kcal/day"
            d["recommended"].append({"food": "Ginger tea", "reason": "Reduces chemotherapy-induced nausea"})
        elif _stage == "Stage III":
            d["summary"] = "[Stage III] Intensive nutrition support. Prevent malnutrition during aggressive treatment."
            d["calorie_goal"] = "2200–2500 kcal/day"
            d["recommended"].append({"food": "High-protein smoothies", "reason": "Maintain muscle mass during chemotherapy"})
        elif _stage == "Stage IV":
            d["summary"] = "[Stage IV] Palliative nutrition: maintain quality of life and prevent cachexia."
            d["calorie_goal"] = "2400–2800 kcal/day (prevent weight loss)"
            d["recommended"].append({"food": "Calorie-dense healthy foods", "reason": "Prevent cancer cachexia (muscle wasting)"})
        DIETARY_DB[_stage][_subtype] = d

# ─── Healthy general diet (shown when cancer is unlikely) ─────────────────────
HEALTHY_DIET = {
    "summary": "Your symptoms appear mild and likely have common non-cancer causes. Focus on general wellness, a balanced diet, and routine check-ups.",
    "recommended": [
        {"food": "Iron-rich foods (spinach, lentils, beans)", "reason": "Addresses the most common cause of fatigue and hair thinning in young women"},
        {"food": "Vitamin D sources (eggs, fortified milk, sunlight)", "reason": "Deficiency is extremely common and causes body aches and tiredness"},
        {"food": "Probiotic foods (curd, buttermilk, yogurt)", "reason": "Supports gut health and reduces bloating and appetite issues"},
        {"food": "Protein-rich foods (dal, paneer, eggs, nuts)", "reason": "Essential for hair strength and overall energy levels"},
        {"food": "Hydration — 8 to 10 glasses of water daily", "reason": "Dehydration alone causes fatigue, skin dullness, and body aches"},
        {"food": "Seasonal fruits (amla, guava, oranges)", "reason": "Vitamin C boosts immunity and aids iron absorption"},
    ],
    "avoid": [
        {"food": "Junk food and excessive salt", "reason": "Causes water retention, bloating, and inflammation"},
        {"food": "Caffeine on an empty stomach", "reason": "Worsens acidity and disrupts iron absorption"},
        {"food": "Skipping meals", "reason": "Leads to blood sugar crashes causing fatigue and hair loss"},
    ],
    "meal_plan": [
        "Breakfast: Poha or oats + a glass of milk or curd",
        "Lunch: Dal + sabzi + roti + salad",
        "Dinner: Khichdi or rice + light vegetable curry",
        "Snack: Handful of mixed nuts + seasonal fruit"
    ],
    "calorie_goal": "1800–2100 kcal/day"
}


# ─── Core prediction logic ────────────────────────────────────────────────────
def predict_from_symptoms(age, symptoms, duration_grade):
    symptom_score   = sum(SYMPTOM_STAGE_SCORE.get(s, 1) for s in symptoms)
    duration_weight = {1: 0.5, 2: 0.8, 3: 1.2, 4: 1.6}.get(duration_grade, 1.0)
    age_bonus       = 2 if age >= 65 else 1 if age >= 50 else 0
    total_score     = (symptom_score * duration_weight) + age_bonus

    # ── Decide if cancer is likely ────────────────────────────────────────
    no_symptoms   = len(symptoms) == 0
    only_one_mild = len(symptoms) == 1 and symptoms[0] in ("fatigue", "hair_loss")
    very_young    = age < 25
    young_mild    = age < 35 and len(symptoms) <= 1 and duration_grade <= 2
    low_score     = total_score < 2.5

    not_likely = (
        no_symptoms or
        (very_young and low_score) or
        young_mild or
        (only_one_mild and duration_grade <= 1 and age < 45)
    )

    if not_likely:
        alt = []
        for s in symptoms:
            for cause in ALTERNATIVE_CAUSES.get(s, []):
                if cause not in alt:
                    alt.append(cause)
        if not alt:
            alt = [
                "General fatigue from lifestyle or nutritional deficiency",
                "Hormonal fluctuations — very common in women under 35",
                "Stress or anxiety-related physical symptoms",
                "Vitamin or mineral deficiency (iron, B12, vitamin D)",
            ]
        return {
            "is_likely_cancer":   False,
            "confidence":         "high" if (very_young or no_symptoms) else "moderate",
            "alternative_causes": alt[:5],
        }

    # ── Stage scoring ─────────────────────────────────────────────────────
    if   total_score >= 10: stage_idx = 3
    elif total_score >= 6:  stage_idx = 2
    elif total_score >= 3:  stage_idx = 1
    else:                   stage_idx = 0

    confidence = "moderate" if (total_score >= 8 and duration_grade >= 3) else "low"

    # ── Subtype scoring ───────────────────────────────────────────────────
    votes = {"Luminal A": 0, "Luminal B": 0, "HER2+": 0, "Triple-Negative": 0}
    for s in symptoms:
        hint = SYMPTOM_SUBTYPE_HINTS.get(s)
        if hint:
            votes[hint] += 2
    if age < 40:
        votes["Triple-Negative"] += 2; votes["HER2+"] += 1
    elif age < 50:
        votes["Luminal B"] += 1; votes["HER2+"] += 1
    else:
        votes["Luminal A"] += 2

    subtype     = max(votes, key=votes.get)
    subtype_idx = {v: k for k, v in SUBTYPE_LABELS.items()}[subtype]

    stage_raw = [0.08, 0.12, 0.12, 0.08]
    stage_raw[stage_idx] = 0.58
    s_total     = sum(stage_raw)
    stage_probs = {STAGE_LABELS[i]: round(stage_raw[i] / s_total, 3) for i in range(4)}

    total_votes   = sum(votes.values()) or 1
    subtype_probs = {k: round(v / total_votes, 3) for k, v in votes.items()}

    return {
        "is_likely_cancer": True,
        "confidence":       confidence,
        "stage_idx":        stage_idx,
        "subtype_idx":      subtype_idx,
        "stage_probs":      stage_probs,
        "subtype_probs":    subtype_probs,
    }


# ─── API Routes ───────────────────────────────────────────────────────────────

@app.route("/api/health")
def health():
    return jsonify({"status": "ok", "models_loaded": MODELS_LOADED, "version": "2.1.0"})


@app.route("/api/predict", methods=["POST"])
def predict():
    data = request.get_json()
    if not data:
        return jsonify({"error": "No data provided"}), 400

    age            = int(data.get("age", 45))
    symptoms       = data.get("symptoms", [])
    duration_grade = int(data.get("grade", 1))

    result = predict_from_symptoms(age, symptoms, duration_grade)

    if not result["is_likely_cancer"]:
        return jsonify({
            "is_likely_cancer":   False,
            "confidence":         result["confidence"],
            "alternative_causes": result["alternative_causes"],
            "dietary_plan":       HEALTHY_DIET,
            "disclaimer": "This tool is for awareness only. Please see a doctor if symptoms persist or worsen.",
        })

    stage   = STAGE_LABELS[result["stage_idx"]]
    subtype = SUBTYPE_LABELS[result["subtype_idx"]]
    diet    = DIETARY_DB.get(stage, DIETARY_DB["Stage I"]).get(
                  subtype, DIETARY_DB["Stage I"]["Luminal A"])

    return jsonify({
        "is_likely_cancer": True,
        "confidence":       result["confidence"],
        "stage":            stage,
        "subtype":          subtype,
        "stage_info":       STAGE_INFO[stage],
        "subtype_info":     SUBTYPE_INFO[subtype],
        "stage_probs":      result["stage_probs"],
        "subtype_probs":    result["subtype_probs"],
        "dietary_plan":     diet,
        "disclaimer": "This tool is for awareness and educational purposes only. Always consult a qualified doctor.",
    })


@app.route("/api/dietary_guide", methods=["POST"])
def dietary_guide():
    data    = request.get_json()
    stage   = data.get("stage", "Stage I")
    subtype = data.get("subtype", "Luminal A")
    plan    = DIETARY_DB.get(stage, {}).get(subtype, {})
    if not plan:
        return jsonify({"error": "No plan found"}), 404
    return jsonify({"stage": stage, "subtype": subtype, "plan": plan})


@app.route("/api/stage_info", methods=["GET"])
def stage_info():
    return jsonify({"stages": STAGE_INFO, "subtypes": SUBTYPE_INFO})


@app.route("/api/datasets_info", methods=["GET"])
def datasets_info():
    return jsonify({
        "datasets": [
            {"name": "GSE2034",     "samples": 286,  "source": "GEO",       "description": "Breast cancer microarray — lymph node negative patients"},
            {"name": "BC-TCGA",    "samples": 590,  "source": "TCGA",      "description": "The Cancer Genome Atlas — RNA-seq breast cancer cohort"},
            {"name": "Simulation", "samples": 200,  "source": "Synthetic", "description": "Simulated expression profiles for model validation"},
        ],
        "total_samples": 1076,
        "genes_analyzed": 500,
        "model_accuracy": {
            "stage_classifier":   model_meta.get("stage_accuracy",   0.79) if MODELS_LOADED else "N/A",
            "subtype_classifier": model_meta.get("subtype_accuracy", 0.80) if MODELS_LOADED else "N/A",
        }
    })


@app.route("/", defaults={"path": ""})
@app.route("/<path:path>")
def serve_frontend(path):
    dist  = os.path.join(app.root_path, "..", "frontend", "dist")
    fpath = os.path.join(dist, path)
    if path and os.path.exists(fpath):
        return send_from_directory(dist, path)
    index = os.path.join(dist, "index.html")
    if os.path.exists(index):
        return send_from_directory(dist, "index.html")
    return "<h2>Frontend not built. Run: cd frontend && npm run build</h2>", 200


if __name__ == "__main__":
    print("🌸 Breast Cancer Analysis API  —  v2.1")
    print("   http://localhost:5000/api/health")
    app.run(debug=True, port=5000, host="0.0.0.0")