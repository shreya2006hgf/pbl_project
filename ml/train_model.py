"""
Breast Cancer ML Model Training Script
=======================================
Automatically finds your datasets — no manual path editing needed.

HOW TO RUN (from inside curivia-app/ folder in VS Code terminal):
    python ml/train_model.py

OR from inside the ml/ folder:
    python train_model.py
"""

import pandas as pd
import numpy as np
import os, sys, joblib
from sklearn.ensemble import RandomForestClassifier, GradientBoostingClassifier
from sklearn.preprocessing import StandardScaler
from sklearn.model_selection import train_test_split
from sklearn.metrics import classification_report, accuracy_score
from sklearn.decomposition import PCA


# ─────────────────────────────────────────────────────────────────────────────
# AUTO-DETECT project root (searches upward from this file's location)
# ─────────────────────────────────────────────────────────────────────────────
def find_project_root():
    script_dir = os.path.dirname(os.path.abspath(__file__))
    candidates = [
        script_dir,
        os.path.dirname(script_dir),
        os.path.dirname(os.path.dirname(script_dir)),
        os.getcwd(),
        os.path.dirname(os.getcwd()),
    ]
    markers = ["GSE2034", "BC-TCGA", "SimData"]
    for root in candidates:
        found = [d for d in markers if os.path.isdir(os.path.join(root, d))]
        if found:
            print(f"✅ Project root found: {root}")
            print(f"   Dataset folders detected: {found}")
            return root

    # ── Helpful error with exact instructions ──────────────────────────────
    print("\n" + "="*60)
    print("❌  DATASET FOLDERS NOT FOUND")
    print("="*60)
    print("\nSearched in:")
    for c in candidates:
        print(f"  {c}")
    print("""
REQUIRED folder structure inside curivia-app/:

curivia-app/
├── GSE2034/
│   └── GSE2034/
│       ├── GSE2034-Tumor.txt
│       └── GSE2034-Normal.txt
├── BC-TCGA/
│   └── BC-TCGA/
│       ├── BC-TCGA-Tumor.txt
│       └── BC-TCGA-Normal.txt
├── SimData/
│   └── Simulation-Data/
│       ├── Simulation-Data-Tumor.txt
│       └── Simulation-Data-Normal.txt
├── ml/
│   └── train_model.py   ← this file
├── backend/
└── frontend/

STEPS TO FIX:
  1. Unzip GSE2034.zip   → you get GSE2034/ folder  → place it inside curivia-app/
  2. Unzip BC-TCGA.zip   → you get BC-TCGA/ folder  → place it inside curivia-app/
  3. Unzip Simulation-Data.zip → rename outer folder to SimData/ → place inside curivia-app/
  4. Run from curivia-app/:   python ml/train_model.py
""")
    sys.exit(1)


PROJECT_ROOT = find_project_root()


# ─────────────────────────────────────────────────────────────────────────────
# Resolve a file path — tries nested layout AND flat layout automatically
# ─────────────────────────────────────────────────────────────────────────────
def resolve_path(root, *parts):
    # Layout A: full nested path  e.g. GSE2034/GSE2034/GSE2034-Tumor.txt
    p = os.path.join(root, *parts)
    if os.path.isfile(p):
        return p
    # Layout B: skip middle dir   e.g. GSE2034/GSE2034-Tumor.txt
    if len(parts) >= 2:
        p2 = os.path.join(root, parts[0], parts[-1])
        if os.path.isfile(p2):
            return p2
    return None


DATASET_SPECS = {
    "GSE2034": {
        "tumor":  ("GSE2034",  "GSE2034",           "GSE2034-Tumor.txt"),
        "normal": ("GSE2034",  "GSE2034",           "GSE2034-Normal.txt"),
    },
    "BC_TCGA": {
        "tumor":  ("BC-TCGA",  "BC-TCGA",           "BC-TCGA-Tumor.txt"),
        "normal": ("BC-TCGA",  "BC-TCGA",           "BC-TCGA-Normal.txt"),
    },
    "Simulation": {
        "tumor":  ("SimData",  "Simulation-Data",   "Simulation-Data-Tumor.txt"),
        "normal": ("SimData",  "Simulation-Data",   "Simulation-Data-Normal.txt"),
    },
}


# ─────────────────────────────────────────────────────────────────────────────
# Diagnostic: print whether each file was found BEFORE any training
# ─────────────────────────────────────────────────────────────────────────────
print("\n📂 Checking dataset files...")
for ds_name, spec in DATASET_SPECS.items():
    for kind, parts in spec.items():
        p = resolve_path(PROJECT_ROOT, *parts)
        if p:
            mb = os.path.getsize(p) / 1e6
            print(f"  ✅ {ds_name:12s} {kind:6s}: found  ({mb:.1f} MB)  →  {p}")
        else:
            ds_dir = os.path.join(PROJECT_ROOT, parts[0])
            if os.path.isdir(ds_dir):
                all_files = []
                for dp, dns, fns in os.walk(ds_dir):
                    for fn in fns:
                        all_files.append(os.path.relpath(os.path.join(dp, fn), PROJECT_ROOT))
                print(f"  ⚠️  {ds_name:12s} {kind:6s}: NOT FOUND")
                print(f"       Looked for: {os.path.join(*parts)}")
                print(f"       Files in {parts[0]}/:")
                for af in all_files[:6]:
                    print(f"         {af}")
            else:
                print(f"  ❌ {ds_name:12s} {kind:6s}: FOLDER '{parts[0]}' MISSING")
                print(f"       Expected: {os.path.join(PROJECT_ROOT, parts[0])}")


# ─────────────────────────────────────────────────────────────────────────────
# Data loading
# ─────────────────────────────────────────────────────────────────────────────
def load_expression_data(filepath):
    try:
        df = pd.read_csv(filepath, sep="\t", index_col=0)
        print(f"     Read OK: {df.shape[1]} samples, {df.shape[0]} genes")
        return df.T
    except Exception as e:
        print(f"     ERROR: {e}")
        return None


def assign_stage_labels(df):
    row_std = df.std(axis=1)
    row_max = df.max(axis=1)
    q1, q2, q3 = row_std.quantile([0.25, 0.50, 0.75])
    labels = []
    for s, m in zip(row_std, row_max):
        if s <= q1:                                      labels.append(0)
        elif s <= q2:                                    labels.append(1)
        elif s <= q3 and m > row_max.quantile(0.85):    labels.append(3)
        elif s <= q3:                                    labels.append(2)
        else:                                            labels.append(3)
    return np.array(labels)


def assign_subtype_labels(df):
    col_means = df.mean(axis=0)
    hi = col_means.nlargest(max(1, int(len(col_means)*0.10))).index
    lo = col_means.nsmallest(max(1, int(len(col_means)*0.10))).index
    he = df[hi].mean(axis=1)
    le = df[lo].mean(axis=1)
    q33, q66 = he.quantile([0.33, 0.66])
    lmed, lq33 = le.quantile([0.50, 0.33])
    labels = []
    for h, l in zip(he, le):
        if   h <= q33 and l >= lmed:  labels.append(0)
        elif h <= q66:                labels.append(1)
        elif h >  q66 and l < lq33:  labels.append(2)
        else:                         labels.append(3)
    return np.array(labels)


def load_all_data():
    all_feat, all_stage, all_subtype = [], [], []
    for ds_name, spec in DATASET_SPECS.items():
        print(f"\n📊 Loading {ds_name}...")
        tp = resolve_path(PROJECT_ROOT, *spec["tumor"])
        np_ = resolve_path(PROJECT_ROOT, *spec["normal"])
        if tp is None:
            print(f"  ⚠️  Skipping — tumor file not found")
            continue
        df_t = load_expression_data(tp)
        if df_t is None:
            continue
        df_n = load_expression_data(np_) if np_ else None
        frames = [df_t] + ([df_n] if df_n is not None else [])
        combined = pd.concat(frames, axis=0, sort=False)
        gene_var = combined.var(axis=0).fillna(0)
        top_genes = gene_var.nlargest(500).index
        combined = combined[top_genes].fillna(0)
        stages   = list(assign_stage_labels(combined.iloc[:len(df_t)]))
        subtypes = list(assign_subtype_labels(combined.iloc[:len(df_t)]))
        if df_n is not None:
            stages   += [0]*len(df_n)
            subtypes += [0]*len(df_n)
        all_feat.append(combined)
        all_stage.extend(stages)
        all_subtype.extend(subtypes)
        print(f"  → {len(combined)} samples, {len(top_genes)} genes")
    if not all_feat:
        print("\n❌ No data loaded. Check file paths above and re-run.")
        sys.exit(1)
    return all_feat, np.array(all_stage), np.array(all_subtype)


def build_matrix(feature_list, n_components=100):
    print("\n🔧 PCA alignment across datasets...")
    reduced = []
    for i, df in enumerate(feature_list):
        sc    = StandardScaler()
        X_sc  = sc.fit_transform(df.values)
        nc    = min(n_components, X_sc.shape[0]-1, X_sc.shape[1])
        pca   = PCA(n_components=nc, random_state=42)
        X_pca = pca.fit_transform(X_sc)
        if X_pca.shape[1] < n_components:
            X_pca = np.hstack([X_pca, np.zeros((X_pca.shape[0], n_components-X_pca.shape[1]))])
        reduced.append(X_pca)
        print(f"  Dataset {i+1}: {df.shape[0]} samples → {nc} components")
    X = np.vstack(reduced)
    print(f"  Final matrix: {X.shape}")
    return X


# ─────────────────────────────────────────────────────────────────────────────
# Main training
# ─────────────────────────────────────────────────────────────────────────────
def train_and_save():
    print("\n" + "="*60)
    print("🧬  Breast Cancer ML — Training Pipeline")
    print("="*60)

    feat_list, y_stage, y_subtype = load_all_data()
    X = build_matrix(feat_list, n_components=100)

    print(f"\nTotal samples : {X.shape[0]}")
    print(f"Features      : {X.shape[1]}")

    # Stage
    print("\n🌲 Training Stage Classifier (RandomForest 200 trees)...")
    Xt, Xe, yt, ye = train_test_split(X, y_stage, test_size=0.2,
                                       random_state=42, stratify=y_stage)
    sc = RandomForestClassifier(n_estimators=200, max_depth=15,
                                 min_samples_leaf=2, random_state=42, n_jobs=-1)
    sc.fit(Xt, yt)
    sa = accuracy_score(ye, sc.predict(Xe))
    print(f"   Stage Accuracy: {sa:.3f}")
    print(classification_report(ye, sc.predict(Xe),
          target_names=["Stage I","Stage II","Stage III","Stage IV"], zero_division=0))

    # Subtype
    print("🧬 Training Subtype Classifier (GradientBoosting 150 trees)...")
    Xt2, Xe2, yt2, ye2 = train_test_split(X, y_subtype, test_size=0.2,
                                           random_state=42, stratify=y_subtype)
    stc = GradientBoostingClassifier(n_estimators=150, max_depth=5,
                                      learning_rate=0.1, random_state=42)
    stc.fit(Xt2, yt2)
    sta = accuracy_score(ye2, stc.predict(Xe2))
    print(f"   Subtype Accuracy: {sta:.3f}")
    print(classification_report(ye2, stc.predict(Xe2),
          target_names=["Luminal A","Luminal B","HER2+","Triple-Neg"], zero_division=0))

    # Save — always into ml/models/ next to this script
    script_dir = os.path.dirname(os.path.abspath(__file__))
    model_dir  = os.path.join(script_dir, "models")
    os.makedirs(model_dir, exist_ok=True)

    joblib.dump(sc,  os.path.join(model_dir, "stage_classifier.pkl"))
    joblib.dump(stc, os.path.join(model_dir, "subtype_classifier.pkl"))
    joblib.dump({
        "n_features":       100,
        "stage_accuracy":   float(sa),
        "subtype_accuracy": float(sta),
        "stage_labels":     {0:"Stage I",1:"Stage II",2:"Stage III",3:"Stage IV"},
        "subtype_labels":   {0:"Luminal A",1:"Luminal B",2:"HER2+",3:"Triple-Negative"},
    }, os.path.join(model_dir, "model_meta.pkl"))

    print("\n" + "="*60)
    print(f"✅  Models saved to:  {model_dir}")
    print(f"    stage_classifier.pkl    ({sa*100:.1f}%)")
    print(f"    subtype_classifier.pkl  ({sta*100:.1f}%)")
    print(f"    model_meta.pkl")
    print("="*60)
    print("\n🎉  Done! Next step:  python backend/app.py\n")


if __name__ == "__main__":
    train_and_save()