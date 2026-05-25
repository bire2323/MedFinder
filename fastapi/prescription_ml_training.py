# ╔══════════════════════════════════════════════════════════════════════════════╗
# ║     MedFinder Ethiopia — Prescription ML Model Training                     ║
# ║     Replaces LLM in /prescription endpoint with local ML models             ║
# ║     Paste this entire file into Google Colab and run cells top to bottom    ║
# ╚══════════════════════════════════════════════════════════════════════════════╝
#
# This notebook trains TWO models that replace the two LLM calls in prescription.py:
#
#   LLM Call 1 → extract_medicines(text)
#   Replaced by: BioBERT fine-tuned NER model (labels medicine tokens in OCR text)
#
#   LLM Call 2 → explain_prescription(text)
#   Replaced by: Medicine category classifier + structured template engine
#                (classifies each medicine → generates safe patient-friendly explanation)
#
# After training, both models are saved and a drop-in prescription.py replacement
# is generated that uses them with zero external API calls.


# ──────────────────────────────────────────────────────────────────────────────
# CELL 1 — Install dependencies
# ──────────────────────────────────────────────────────────────────────────────

# !pip install transformers datasets seqeval torch torchvision scikit-learn \
#              pandas numpy matplotlib seaborn accelerate huggingface_hub \
#              easyocr pillow -q

print("✅ All packages installed")


# ──────────────────────────────────────────────────────────────────────────────
# CELL 2 — Imports
# ──────────────────────────────────────────────────────────────────────────────

import os
import json
import random
import numpy as np
import pandas as pd
import matplotlib.pyplot as plt
import seaborn as sns
from pathlib import Path

import torch
from torch.utils.data import Dataset, DataLoader
from transformers import (
    AutoTokenizer,
    AutoModelForTokenClassification,
    AutoModelForSequenceClassification,
    TrainingArguments,
    Trainer,
    DataCollatorForTokenClassification,
    pipeline,
)
from datasets import Dataset as HFDataset, DatasetDict, ClassLabel, Sequence, Value, Features
from sklearn.model_selection import train_test_split
from sklearn.metrics import classification_report, confusion_matrix
from seqeval.metrics import classification_report as seq_classification_report
import warnings
warnings.filterwarnings("ignore")

# Reproducibility
SEED = 42
random.seed(SEED)
np.random.seed(SEED)
torch.manual_seed(SEED)

DEVICE = "cuda" if torch.cuda.is_available() else "cpu"
print(f"✅ Using device: {DEVICE}")
print(f"✅ PyTorch version: {torch.__version__}")


# ──────────────────────────────────────────────────────────────────────────────
# CELL 3 — Configuration
# ──────────────────────────────────────────────────────────────────────────────

# ── Model choices ──────────────────────────────────────────────────────────────
# NER model: dmis-lab/biobert-base-cased-v1.2 is purpose-built for biomedical NER
# Fallback:  bert-base-uncased (smaller, faster, less accurate)
NER_BASE_MODEL    = "dmis-lab/biobert-base-cased-v1.2"
CLF_BASE_MODEL    = "dmis-lab/biobert-base-cased-v1.2"

# ── Output directories ─────────────────────────────────────────────────────────
OUTPUT_DIR        = Path("medfinder_models")
NER_OUTPUT_DIR    = OUTPUT_DIR / "ner_medicine_extractor"
CLF_OUTPUT_DIR    = OUTPUT_DIR / "medicine_classifier"
OUTPUT_DIR.mkdir(exist_ok=True)

# ── NER label scheme (BIO tagging) ────────────────────────────────────────────
# B-MED  = Beginning of a medicine name token
# I-MED  = Inside (continuation) of a medicine name token
# O      = Outside / not a medicine token
NER_LABELS        = ["O", "B-MED", "I-MED"]
NER_LABEL2ID      = {l: i for i, l in enumerate(NER_LABELS)}
NER_ID2LABEL      = {i: l for l, i in NER_LABEL2ID.items()}

# ── Medicine category labels (for explainer classifier) ───────────────────────
MED_CATEGORIES = [
    "antibiotic",
    "analgesic_antipyretic",   # pain killers / fever reducers
    "antihypertensive",        # blood pressure
    "antidiabetic",
    "antihistamine",
    "antifungal",
    "antiviral",
    "proton_pump_inhibitor",   # stomach / acid
    "vitamin_supplement",
    "corticosteroid",
    "bronchodilator",          # asthma / respiratory
    "antidepressant",
    "antiparasitic",
    "other",
]
CLF_LABEL2ID = {l: i for i, l in enumerate(MED_CATEGORIES)}
CLF_ID2LABEL = {i: l for l, i in CLF_LABEL2ID.items()}

print(f"✅ NER labels:        {NER_LABELS}")
print(f"✅ Medicine categories: {len(MED_CATEGORIES)}")


# ──────────────────────────────────────────────────────────────────────────────
# CELL 4A — NER Synthetic Dataset
#
# IMPORTANT: This synthetic data is for bootstrapping only.
# Replace / augment with real datasets listed in CELL 4B.
# The model will be much more accurate with real prescription data.
# ──────────────────────────────────────────────────────────────────────────────

def build_ner_sample(sentence_tokens, med_spans):
    """
    sentence_tokens: list of word strings
    med_spans: list of (start_idx, end_idx) inclusive tuples marking medicine spans
    Returns: {"tokens": [...], "ner_tags": [...]}  with BIO labels
    """
    labels = ["O"] * len(sentence_tokens)
    for start, end in med_spans:
        labels[start] = "B-MED"
        for i in range(start + 1, end + 1):
            labels[i] = "I-MED"
    return {"tokens": sentence_tokens, "ner_tags": [NER_LABEL2ID[l] for l in labels]}


# ── Real medicine name pool (common in Ethiopia & globally) ───────────────────
MEDICINE_NAMES = [
    ["Amoxicillin"], ["Amoxicillin", "500mg"], ["Amoxicillin", "Clavulanate"],
    ["Paracetamol"], ["Paracetamol", "500mg"],
    ["Ibuprofen"], ["Ibuprofen", "400mg"],
    ["Metformin"], ["Metformin", "850mg"],
    ["Amlodipine"], ["Amlodipine", "5mg"],
    ["Lisinopril"], ["Lisinopril", "10mg"],
    ["Atorvastatin"], ["Atorvastatin", "20mg"],
    ["Omeprazole"], ["Omeprazole", "20mg"],
    ["Ciprofloxacin"], ["Ciprofloxacin", "500mg"],
    ["Azithromycin"], ["Azithromycin", "250mg"],
    ["Doxycycline"], ["Doxycycline", "100mg"],
    ["Metronidazole"], ["Metronidazole", "400mg"],
    ["Diclofenac"], ["Diclofenac", "50mg"],
    ["Cetirizine"], ["Cetirizine", "10mg"],
    ["Loratadine"],
    ["Fluconazole"], ["Fluconazole", "150mg"],
    ["Cotrimoxazole"],
    ["Vitamin", "C"], ["Vitamin", "D"],
    ["Folic", "Acid"],
    ["Ferrous", "Sulfate"],
    ["Salbutamol"],
    ["Prednisolone"], ["Prednisolone", "5mg"],
    ["Chloroquine"],
    ["Artemether", "Lumefantrine"],
    ["Albendazole"], ["Mebendazole"],
    ["Glibenclamide"],
    ["Insulin", "Regular"],
    ["Hydrochlorothiazide"],
    ["Enalapril"], ["Enalapril", "5mg"],
    ["Ceftriaxone"],
    ["Gentamicin"],
    ["Tetracycline"],
    ["Erythromycin"],
    ["Clotrimazole"],
    ["Ranitidine"],
    ["Pantoprazole"],
    ["Sertraline"],
    ["Amitriptyline"],
]

# ── Sentence templates (OCR-like noisy prescription context) ──────────────────
TEMPLATES = [
    # Standard prescription lines
    lambda m: (["Rx:", "Drug:"] + m + ["as", "directed"], [(2, 2 + len(m) - 1)]),
    lambda m: (["1.", "Tab"] + m + ["Once", "daily"], [(2, 2 + len(m) - 1)]),
    lambda m: (["2.", "Cap"] + m + ["BD"], [(2, 2 + len(m) - 1)]),
    lambda m: (["3.", "Syrup"] + m + ["TDS"], [(2, 2 + len(m) - 1)]),
    lambda m: (["Dispense:"] + m + ["x", "14", "tabs"], [(1, len(m))]),
    lambda m: (["Medication:"] + m + ["for", "7", "days"], [(1, len(m))]),
    lambda m: (m + ["prescribed", "as", "needed"], [(0, len(m) - 1)]),
    lambda m: (["Please", "take"] + m + ["with", "food"], [(2, 2 + len(m) - 1)]),
    # OCR noise variants
    lambda m: (["Rx"] + m + ["QD"], [(1, len(m))]),
    lambda m: (["Drug", "Name:"] + m, [(2, 2 + len(m) - 1)]),
    # Two-medicine sentences
    lambda m1_m2: (
        ["Take"] + m1_m2[0] + ["and"] + m1_m2[1] + ["as", "prescribed"],
        [(1, len(m1_m2[0])), (len(m1_m2[0]) + 2, len(m1_m2[0]) + 1 + len(m1_m2[1]))]
    ),
    # Negative / O-only sentences (no medicine)
    lambda _: (["Patient", "name:", "John", "Doe", "Age:", "45"], []),
    lambda _: (["Date:", "2024-01-15", "Dr.", "Smith", "Signature"], []),
    lambda _: (["Instructions:", "Take", "with", "plenty", "of", "water"], []),
    lambda _: (["Follow", "up", "in", "one", "week"], []),
    lambda _: (["Diagnosis:", "Hypertension", "Type", "2"], []),
]

def generate_ner_dataset(n_samples=3000):
    data = []
    for _ in range(n_samples):
        template = random.choice(TEMPLATES)
        if "m1_m2" in template.__code__.co_varnames:
            med1 = random.choice(MEDICINE_NAMES)
            med2 = random.choice(MEDICINE_NAMES)
            tokens, spans = template((med1, med2))
        elif template.__code__.co_varnames[0] == "_":
            tokens, spans = template(None)
        else:
            med = random.choice(MEDICINE_NAMES)
            tokens, spans = template(med)
        data.append(build_ner_sample(tokens, spans))
    return data

print("Generating synthetic NER dataset...")
ner_data_raw = generate_ner_dataset(n_samples=4000)

# Split
ner_train_raw, ner_test_raw = train_test_split(ner_data_raw, test_size=0.15, random_state=SEED)
ner_train_raw, ner_val_raw  = train_test_split(ner_train_raw, test_size=0.12, random_state=SEED)

print(f"✅ NER split — Train: {len(ner_train_raw)}, Val: {len(ner_val_raw)}, Test: {len(ner_test_raw)}")

# Quick label distribution check
all_tags = [tag for sample in ner_data_raw for tag in sample["ner_tags"]]
from collections import Counter
dist = Counter(all_tags)
print(f"   Label distribution: { {NER_ID2LABEL[k]: v for k, v in dist.items()} }")


# ──────────────────────────────────────────────────────────────────────────────
# CELL 4B — Dataset Sources (READ THIS — datasets massively improve accuracy)
# ──────────────────────────────────────────────────────────────────────────────

DATASET_GUIDE = """
╔══════════════════════════════════════════════════════════════════════════════╗
║  RECOMMENDED DATASETS — replace/augment the synthetic data above            ║
╠══════════════════════════════════════════════════════════════════════════════╣
║                                                                              ║
║  MODEL 1: Medicine Name Extraction (NER)                                    ║
║  ─────────────────────────────────────────────────────────────────────────  ║
║  1. NLM-Chem (best choice)                                                  ║
║     • Source: https://huggingface.co/datasets/bigbio/nlmchem                ║
║     • 150k+ chemical/drug NER annotations from PubMed                       ║
║     • Load: datasets.load_dataset("bigbio/nlmchem", "nlmchem_bigbio_ner")   ║
║                                                                              ║
║  2. BC5CDR (Chemical-Disease Relations)                                     ║
║     • Source: https://huggingface.co/datasets/tner/bc5cdr                   ║
║     • Chemical (drug) NER from biomedical literature                        ║
║     • Load: datasets.load_dataset("tner/bc5cdr")                            ║
║                                                                              ║
║  3. MedMentions                                                              ║
║     • Source: https://huggingface.co/datasets/bigbio/med_mentions            ║
║     • Broad biomedical NER (UMLS concepts including drugs)                  ║
║                                                                              ║
║  4. Kaggle: "Medicine Name Recognition" dataset                             ║
║     • https://www.kaggle.com/datasets/nehaprabhavalkar/av-healthcare-analytics║
║     • CSV of prescription records with drug name column                     ║
║                                                                              ║
║  5. OpenFDA Drug Labels                                                     ║
║     • https://open.fda.gov/apis/drug/label/                                 ║
║     • JSON API — drug names, indications, categories (free, no auth)       ║
║     • Use to build your medicine name list + categories                     ║
║                                                                              ║
║  MODEL 2: Medicine Category Classifier                                      ║
║  ─────────────────────────────────────────────────────────────────────────  ║
║  6. DrugBank Vocabulary (open data)                                         ║
║     • https://go.drugbank.com/releases/latest#open-data                     ║
║     • CSV with drug names + pharmacological categories                      ║
║     • Perfect for classifier training labels                                ║
║                                                                              ║
║  7. WHO Essential Medicines List (Ethiopia edition)                         ║
║     • https://www.who.int/groups/expert-committee-on-selection-and-use-of-  ║
║       essential-medicines/essential-medicines-lists                          ║
║     • Categorised list matching your deployment context                     ║
║                                                                              ║
║  8. Kaggle: "Drug Classification"                                           ║
║     • https://www.kaggle.com/datasets/prathamtripathi/drug-classification   ║
║     • 200 drugs with category labels — ideal classifier training data       ║
║                                                                              ║
║  LOADING A REAL DATASET (example with BC5CDR):                             ║
║  ─────────────────────────────────────────────────────────────────────────  ║
║  from datasets import load_dataset                                          ║
║  raw = load_dataset("tner/bc5cdr")                                          ║
║  # Map their label scheme to {"O":0, "B-MED":1, "I-MED":2}               ║
║  # Then replace ner_train_raw / ner_val_raw / ner_test_raw below           ║
╚══════════════════════════════════════════════════════════════════════════════╝
"""
print(DATASET_GUIDE)


# ──────────────────────────────────────────────────────────────────────────────
# CELL 4C — (Optional) Load BC5CDR from HuggingFace instead of synthetic data
# Uncomment this cell if you want real data for the NER model
# ──────────────────────────────────────────────────────────────────────────────

# from datasets import load_dataset
#
# raw_bc5 = load_dataset("tner/bc5cdr")
#
# BC5CDR_LABEL_MAP = {
#     "O": "O", "B-Chemical": "B-MED", "I-Chemical": "I-MED",
#     "B-Disease": "O", "I-Disease": "O",   # we only care about drugs
# }
#
# def convert_bc5cdr_sample(example):
#     tokens = example["tokens"]
#     orig_tags = [example["tags"][i] for i in range(len(tokens))]
#     # bc5cdr uses integer labels — map back via their label list
#     bc5_label_list = raw_bc5["train"].features["tags"].feature.names
#     str_tags = [bc5_label_list[t] for t in orig_tags]
#     mapped = [BC5CDR_LABEL_MAP.get(t, "O") for t in str_tags]
#     return {"tokens": tokens, "ner_tags": [NER_LABEL2ID[l] for l in mapped]}
#
# ner_train_raw = [convert_bc5cdr_sample(ex) for ex in raw_bc5["train"]]
# ner_val_raw   = [convert_bc5cdr_sample(ex) for ex in raw_bc5["validation"]]
# ner_test_raw  = [convert_bc5cdr_sample(ex) for ex in raw_bc5["test"]]
# print(f"✅ Loaded BC5CDR — Train: {len(ner_train_raw)}, Val: {len(ner_val_raw)}, Test: {len(ner_test_raw)}")


# ──────────────────────────────────────────────────────────────────────────────
# CELL 5 — NER Tokenization & Dataset Preparation
# ──────────────────────────────────────────────────────────────────────────────

print(f"Loading NER tokenizer: {NER_BASE_MODEL}")
ner_tokenizer = AutoTokenizer.from_pretrained(NER_BASE_MODEL)

def tokenize_and_align_labels(examples):
    """
    BioBERT uses WordPiece: one word → multiple subword tokens.
    We assign the label of the first subword to the full word,
    and use -100 (ignored by CrossEntropyLoss) for continuation subwords.
    """
    tokenized = ner_tokenizer(
        examples["tokens"],
        is_split_into_words=True,
        truncation=True,
        max_length=128,
        padding="max_length",
    )
    all_labels = []
    for i, labels in enumerate(examples["ner_tags"]):
        word_ids = tokenized.word_ids(batch_index=i)
        label_ids = []
        prev_word_id = None
        for word_id in word_ids:
            if word_id is None:
                label_ids.append(-100)          # [CLS] / [SEP] / [PAD]
            elif word_id != prev_word_id:
                label_ids.append(labels[word_id])  # first subword → real label
            else:
                label_ids.append(-100)          # continuation subword → ignore
            prev_word_id = word_id
        all_labels.append(label_ids)
    tokenized["labels"] = all_labels
    return tokenized


def raw_to_hf_dataset(raw_list):
    df = pd.DataFrame(raw_list)
    return HFDataset.from_pandas(df)


print("Tokenising NER splits...")
ner_train_hf = raw_to_hf_dataset(ner_train_raw).map(
    tokenize_and_align_labels, batched=True,
    remove_columns=["tokens", "ner_tags"]
)
ner_val_hf = raw_to_hf_dataset(ner_val_raw).map(
    tokenize_and_align_labels, batched=True,
    remove_columns=["tokens", "ner_tags"]
)
ner_test_hf = raw_to_hf_dataset(ner_test_raw).map(
    tokenize_and_align_labels, batched=True,
    remove_columns=["tokens", "ner_tags"]
)

ner_dataset = DatasetDict({
    "train": ner_train_hf,
    "validation": ner_val_hf,
    "test": ner_test_hf,
})
print(f"✅ NER dataset ready: {ner_dataset}")


# ──────────────────────────────────────────────────────────────────────────────
# CELL 6 — NER Model: Build & Train
# ──────────────────────────────────────────────────────────────────────────────

from seqeval.metrics import f1_score as seq_f1_score, precision_score as seq_precision, recall_score as seq_recall

ner_model = AutoModelForTokenClassification.from_pretrained(
    NER_BASE_MODEL,
    num_labels=len(NER_LABELS),
    id2label=NER_ID2LABEL,
    label2id=NER_LABEL2ID,
)

def compute_ner_metrics(eval_pred):
    logits, labels = eval_pred
    predictions = np.argmax(logits, axis=-1)
    true_labels, true_preds = [], []
    for pred_seq, label_seq in zip(predictions, labels):
        true_seq_labels, true_seq_preds = [], []
        for p, l in zip(pred_seq, label_seq):
            if l != -100:
                true_seq_labels.append(NER_ID2LABEL[l])
                true_seq_preds.append(NER_ID2LABEL[p])
        true_labels.append(true_seq_labels)
        true_preds.append(true_seq_preds)
    return {
        "f1":        seq_f1_score(true_labels, true_preds),
        "precision": seq_precision(true_labels, true_preds),
        "recall":    seq_recall(true_labels, true_preds),
    }

data_collator = DataCollatorForTokenClassification(ner_tokenizer)

ner_training_args = TrainingArguments(
    output_dir=str(NER_OUTPUT_DIR),
    num_train_epochs=5,
    per_device_train_batch_size=16,
    per_device_eval_batch_size=32,
    learning_rate=3e-5,
    weight_decay=0.01,
    warmup_ratio=0.1,
    evaluation_strategy="epoch",
    save_strategy="epoch",
    load_best_model_at_end=True,
    metric_for_best_model="f1",
    greater_is_better=True,
    logging_dir=str(OUTPUT_DIR / "ner_logs"),
    logging_steps=50,
    fp16=(DEVICE == "cuda"),   # Mixed precision on GPU for speed
    seed=SEED,
    report_to="none",          # Disable W&B / mlflow
)

ner_trainer = Trainer(
    model=ner_model,
    args=ner_training_args,
    train_dataset=ner_dataset["train"],
    eval_dataset=ner_dataset["validation"],
    tokenizer=ner_tokenizer,
    data_collator=data_collator,
    compute_metrics=compute_ner_metrics,
)

print("🚀 Training NER model...")
ner_trainer.train()
print("✅ NER training complete")

# Evaluate on test set
ner_test_results = ner_trainer.evaluate(ner_dataset["test"])
print(f"\n📊 NER Test Results:")
for k, v in ner_test_results.items():
    print(f"   {k}: {v:.4f}" if isinstance(v, float) else f"   {k}: {v}")


# ──────────────────────────────────────────────────────────────────────────────
# CELL 7 — NER Training Curves
# ──────────────────────────────────────────────────────────────────────────────

history = ner_trainer.state.log_history
train_loss = [(h["step"], h["loss"]) for h in history if "loss" in h and "eval_loss" not in h]
eval_metrics = [(h["epoch"], h.get("eval_f1", 0), h.get("eval_loss", 0))
                for h in history if "eval_f1" in h]

fig, axes = plt.subplots(1, 2, figsize=(14, 5))

if train_loss:
    steps, losses = zip(*train_loss)
    axes[0].plot(steps, losses, color="#2196F3", linewidth=2)
    axes[0].set_title("NER Training Loss", fontsize=14, fontweight="bold")
    axes[0].set_xlabel("Step"); axes[0].set_ylabel("Loss")
    axes[0].grid(alpha=0.3)

if eval_metrics:
    epochs, f1s, eval_losses = zip(*eval_metrics)
    ax2 = axes[1]
    ax2.plot(epochs, f1s, color="#4CAF50", linewidth=2, marker="o", label="F1")
    ax2.set_title("NER Validation F1 Score", fontsize=14, fontweight="bold")
    ax2.set_xlabel("Epoch"); ax2.set_ylabel("F1 Score")
    ax2.set_ylim(0, 1.0); ax2.grid(alpha=0.3); ax2.legend()

plt.tight_layout()
plt.savefig(str(OUTPUT_DIR / "ner_training_curves.png"), dpi=150)
plt.show()
print("✅ NER curves saved")


# ──────────────────────────────────────────────────────────────────────────────
# CELL 8 — Save NER Model
# ──────────────────────────────────────────────────────────────────────────────

ner_trainer.save_model(str(NER_OUTPUT_DIR))
ner_tokenizer.save_pretrained(str(NER_OUTPUT_DIR))

# Save label maps for inference
with open(NER_OUTPUT_DIR / "label_maps.json", "w") as f:
    json.dump({"id2label": NER_ID2LABEL, "label2id": NER_LABEL2ID}, f, indent=2)

print(f"✅ NER model saved → {NER_OUTPUT_DIR}")
print(f"   Files: {list(NER_OUTPUT_DIR.iterdir())}")


# ──────────────────────────────────────────────────────────────────────────────
# CELL 9A — Medicine Category Classifier: Synthetic Dataset
# ──────────────────────────────────────────────────────────────────────────────
# Each sample is a medicine name → category label
# Replace with DrugBank CSV or Kaggle Drug Classification dataset (see CELL 4B)

MEDICINE_CATEGORY_MAP = {
    # Antibiotics
    "Amoxicillin": "antibiotic", "Amoxicillin Clavulanate": "antibiotic",
    "Ciprofloxacin": "antibiotic", "Azithromycin": "antibiotic",
    "Doxycycline": "antibiotic", "Metronidazole": "antibiotic",
    "Cotrimoxazole": "antibiotic", "Ceftriaxone": "antibiotic",
    "Erythromycin": "antibiotic", "Gentamicin": "antibiotic",
    "Tetracycline": "antibiotic", "Cloxacillin": "antibiotic",
    "Ampicillin": "antibiotic", "Penicillin": "antibiotic",

    # Analgesic/Antipyretic
    "Paracetamol": "analgesic_antipyretic", "Acetaminophen": "analgesic_antipyretic",
    "Ibuprofen": "analgesic_antipyretic", "Diclofenac": "analgesic_antipyretic",
    "Aspirin": "analgesic_antipyretic", "Naproxen": "analgesic_antipyretic",
    "Tramadol": "analgesic_antipyretic", "Morphine": "analgesic_antipyretic",
    "Codeine": "analgesic_antipyretic",

    # Antihypertensive
    "Amlodipine": "antihypertensive", "Lisinopril": "antihypertensive",
    "Enalapril": "antihypertensive", "Atenolol": "antihypertensive",
    "Hydrochlorothiazide": "antihypertensive", "Losartan": "antihypertensive",
    "Nifedipine": "antihypertensive", "Furosemide": "antihypertensive",
    "Methyldopa": "antihypertensive",

    # Antidiabetic
    "Metformin": "antidiabetic", "Glibenclamide": "antidiabetic",
    "Insulin": "antidiabetic", "Insulin Regular": "antidiabetic",
    "Insulin NPH": "antidiabetic", "Glimepiride": "antidiabetic",
    "Pioglitazone": "antidiabetic",

    # Antihistamine
    "Cetirizine": "antihistamine", "Loratadine": "antihistamine",
    "Chlorpheniramine": "antihistamine", "Diphenhydramine": "antihistamine",
    "Fexofenadine": "antihistamine", "Promethazine": "antihistamine",

    # Antifungal
    "Fluconazole": "antifungal", "Clotrimazole": "antifungal",
    "Ketoconazole": "antifungal", "Nystatin": "antifungal",
    "Griseofulvin": "antifungal", "Miconazole": "antifungal",

    # Antiviral
    "Acyclovir": "antiviral", "Zidovudine": "antiviral",
    "Lamivudine": "antiviral", "Efavirenz": "antiviral",
    "Tenofovir": "antiviral", "Oseltamivir": "antiviral",

    # Proton pump inhibitor
    "Omeprazole": "proton_pump_inhibitor", "Pantoprazole": "proton_pump_inhibitor",
    "Ranitidine": "proton_pump_inhibitor", "Esomeprazole": "proton_pump_inhibitor",
    "Lansoprazole": "proton_pump_inhibitor",

    # Vitamins / Supplements
    "Vitamin C": "vitamin_supplement", "Vitamin D": "vitamin_supplement",
    "Folic Acid": "vitamin_supplement", "Ferrous Sulfate": "vitamin_supplement",
    "Zinc": "vitamin_supplement", "Vitamin B12": "vitamin_supplement",
    "Multivitamin": "vitamin_supplement", "Calcium": "vitamin_supplement",
    "Iron": "vitamin_supplement",

    # Corticosteroid
    "Prednisolone": "corticosteroid", "Dexamethasone": "corticosteroid",
    "Hydrocortisone": "corticosteroid", "Betamethasone": "corticosteroid",
    "Methylprednisolone": "corticosteroid",

    # Bronchodilator
    "Salbutamol": "bronchodilator", "Albuterol": "bronchodilator",
    "Theophylline": "bronchodilator", "Ipratropium": "bronchodilator",
    "Beclomethasone": "bronchodilator",

    # Antidepressant
    "Sertraline": "antidepressant", "Amitriptyline": "antidepressant",
    "Fluoxetine": "antidepressant", "Diazepam": "antidepressant",
    "Haloperidol": "antidepressant",

    # Antiparasitic
    "Chloroquine": "antiparasitic", "Artemether Lumefantrine": "antiparasitic",
    "Albendazole": "antiparasitic", "Mebendazole": "antiparasitic",
    "Primaquine": "antiparasitic", "Ivermectin": "antiparasitic",
    "Praziquantel": "antiparasitic",

    # Other
    "Atorvastatin": "other", "Simvastatin": "other",
    "Digoxin": "other", "Warfarin": "other",
    "Heparin": "other", "Oxytocin": "other",
}

# Augment with dosage variants (common in OCR output)
DOSAGE_SUFFIXES = [
    "", " 500mg", " 250mg", " 100mg", " 50mg", " 5mg", " 10mg",
    " 20mg", " 400mg", " 200mg", " tablet", " capsule", " syrup",
    " injection", " 1g", " 2g",
]

def build_clf_dataset():
    samples = []
    for med, cat in MEDICINE_CATEGORY_MAP.items():
        for suffix in DOSAGE_SUFFIXES:
            text = (med + suffix).strip()
            samples.append({"text": text, "label": CLF_LABEL2ID[cat]})
        # Add OCR-noise variants (lowercase, typos)
        samples.append({"text": med.lower(), "label": CLF_LABEL2ID[cat]})
        samples.append({"text": med.upper(), "label": CLF_LABEL2ID[cat]})
    return samples

clf_data_raw = build_clf_dataset()
clf_df = pd.DataFrame(clf_data_raw)

# Balance classes — upsample minority
from sklearn.utils import resample
max_count = clf_df["label"].value_counts().max()
balanced_dfs = []
for label_id in clf_df["label"].unique():
    subset = clf_df[clf_df["label"] == label_id]
    if len(subset) < max_count:
        subset = resample(subset, replace=True, n_samples=max_count, random_state=SEED)
    balanced_dfs.append(subset)
clf_df = pd.concat(balanced_dfs).sample(frac=1, random_state=SEED).reset_index(drop=True)

clf_train_df, clf_test_df = train_test_split(clf_df, test_size=0.15, random_state=SEED)
clf_train_df, clf_val_df  = train_test_split(clf_train_df, test_size=0.12, random_state=SEED)
print(f"✅ Classifier split — Train: {len(clf_train_df)}, Val: {len(clf_val_df)}, Test: {len(clf_test_df)}")
print(f"   Label distribution:\n{clf_df['label'].value_counts().to_string()}")


# ──────────────────────────────────────────────────────────────────────────────
# CELL 9B — (Optional) Load DrugBank CSV if you have it
# ──────────────────────────────────────────────────────────────────────────────

# from google.colab import files
# uploaded = files.upload()  # Upload drugbank_vocabulary.csv
#
# import pandas as pd
# db = pd.read_csv("drugbank_vocabulary.csv")
# # DrugBank columns: "Common name", "Drug Groups" (e.g. "approved; antihypertensive")
# # Map "Drug Groups" → your MED_CATEGORIES, then build clf_df same way as above.


# ──────────────────────────────────────────────────────────────────────────────
# CELL 10 — Classifier Tokenization & Training
# ──────────────────────────────────────────────────────────────────────────────

print(f"Loading classifier tokenizer: {CLF_BASE_MODEL}")
clf_tokenizer = AutoTokenizer.from_pretrained(CLF_BASE_MODEL)

def tokenize_clf(examples):
    return clf_tokenizer(
        examples["text"],
        truncation=True,
        max_length=64,       # Medicine names are short
        padding="max_length",
    )

clf_train_hf = HFDataset.from_pandas(clf_train_df[["text", "label"]]).map(tokenize_clf, batched=True)
clf_val_hf   = HFDataset.from_pandas(clf_val_df[["text", "label"]]).map(tokenize_clf, batched=True)
clf_test_hf  = HFDataset.from_pandas(clf_test_df[["text", "label"]]).map(tokenize_clf, batched=True)

clf_dataset = DatasetDict({"train": clf_train_hf, "validation": clf_val_hf, "test": clf_test_hf})

clf_model = AutoModelForSequenceClassification.from_pretrained(
    CLF_BASE_MODEL,
    num_labels=len(MED_CATEGORIES),
    id2label=CLF_ID2LABEL,
    label2id=CLF_LABEL2ID,
)

from sklearn.metrics import accuracy_score, f1_score

def compute_clf_metrics(eval_pred):
    logits, labels = eval_pred
    preds = np.argmax(logits, axis=-1)
    return {
        "accuracy": accuracy_score(labels, preds),
        "f1_macro": f1_score(labels, preds, average="macro"),
    }

clf_training_args = TrainingArguments(
    output_dir=str(CLF_OUTPUT_DIR),
    num_train_epochs=6,
    per_device_train_batch_size=32,
    per_device_eval_batch_size=64,
    learning_rate=2e-5,
    weight_decay=0.01,
    warmup_ratio=0.1,
    evaluation_strategy="epoch",
    save_strategy="epoch",
    load_best_model_at_end=True,
    metric_for_best_model="f1_macro",
    greater_is_better=True,
    logging_dir=str(OUTPUT_DIR / "clf_logs"),
    logging_steps=20,
    fp16=(DEVICE == "cuda"),
    seed=SEED,
    report_to="none",
)

clf_trainer = Trainer(
    model=clf_model,
    args=clf_training_args,
    train_dataset=clf_dataset["train"],
    eval_dataset=clf_dataset["validation"],
    tokenizer=clf_tokenizer,
    compute_metrics=compute_clf_metrics,
)

print("🚀 Training medicine category classifier...")
clf_trainer.train()
print("✅ Classifier training complete")

clf_test_results = clf_trainer.evaluate(clf_dataset["test"])
print(f"\n📊 Classifier Test Results:")
for k, v in clf_test_results.items():
    print(f"   {k}: {v:.4f}" if isinstance(v, float) else f"   {k}: {v}")


# ──────────────────────────────────────────────────────────────────────────────
# CELL 11 — Classifier Confusion Matrix & Report
# ──────────────────────────────────────────────────────────────────────────────

clf_test_logits = clf_trainer.predict(clf_dataset["test"])
clf_preds = np.argmax(clf_test_logits.predictions, axis=-1)
clf_true  = clf_test_logits.label_ids

# Full classification report
report = classification_report(
    clf_true, clf_preds,
    target_names=MED_CATEGORIES,
    zero_division=0
)
print("\n📊 Per-Category Classification Report:")
print(report)

# Confusion matrix
cm = confusion_matrix(clf_true, clf_preds)
fig, ax = plt.subplots(figsize=(14, 12))
sns.heatmap(
    cm, annot=True, fmt="d", cmap="Blues",
    xticklabels=MED_CATEGORIES, yticklabels=MED_CATEGORIES,
    ax=ax, linewidths=0.5
)
ax.set_title("Medicine Category Confusion Matrix", fontsize=14, fontweight="bold")
ax.set_xlabel("Predicted"); ax.set_ylabel("True")
plt.xticks(rotation=45, ha="right"); plt.yticks(rotation=0)
plt.tight_layout()
plt.savefig(str(OUTPUT_DIR / "clf_confusion_matrix.png"), dpi=150)
plt.show()
print("✅ Confusion matrix saved")


# ──────────────────────────────────────────────────────────────────────────────
# CELL 12 — Save Classifier Model
# ──────────────────────────────────────────────────────────────────────────────

clf_trainer.save_model(str(CLF_OUTPUT_DIR))
clf_tokenizer.save_pretrained(str(CLF_OUTPUT_DIR))

with open(CLF_OUTPUT_DIR / "label_maps.json", "w") as f:
    json.dump({"id2label": CLF_ID2LABEL, "label2id": CLF_LABEL2ID,
               "categories": MED_CATEGORIES}, f, indent=2)

print(f"✅ Classifier model saved → {CLF_OUTPUT_DIR}")


# ──────────────────────────────────────────────────────────────────────────────
# CELL 13 — Patient-Friendly Explanation Templates
#
# These replace the LLM's free-text generation with structured, safe explanations.
# Covers all 14 categories. Each template deliberately avoids dosage, diagnosis,
# or treatment instructions — matching the RULES in your original system prompt.
# ──────────────────────────────────────────────────────────────────────────────

EXPLANATION_TEMPLATES = {
    "antibiotic": (
        "{med} is an antibiotic — a medicine that helps the body fight certain types of bacterial infections. "
        "It works by stopping bacteria from growing or by killing them directly. "
        "It is commonly used when a doctor determines that a bacterial infection needs to be treated."
    ),
    "analgesic_antipyretic": (
        "{med} is a pain-relieving and fever-reducing medicine. "
        "It is commonly used to help manage discomfort such as headaches, muscle pains, toothaches, or high body temperature. "
        "It belongs to the group of medicines known as analgesics and antipyretics."
    ),
    "antihypertensive": (
        "{med} is a medicine used to help manage blood pressure. "
        "It belongs to a group of medicines that support the cardiovascular system by helping to keep blood pressure "
        "within a healthy range. It is typically taken regularly as directed by a doctor."
    ),
    "antidiabetic": (
        "{med} is a medicine used to help manage blood sugar levels. "
        "It belongs to a group of medicines that support the body in controlling glucose, "
        "and is typically prescribed for people whose blood sugar needs medical management."
    ),
    "antihistamine": (
        "{med} is an antihistamine — a medicine that helps reduce allergic reactions. "
        "It is commonly used for symptoms like runny nose, sneezing, skin itching, or watery eyes "
        "that may result from allergies."
    ),
    "antifungal": (
        "{med} is an antifungal medicine. "
        "It is used to treat infections caused by fungi, which can affect the skin, nails, mouth, or other parts of the body. "
        "It works by targeting the fungi responsible for the infection."
    ),
    "antiviral": (
        "{med} is an antiviral medicine. "
        "It is used to help the body fight certain types of viral infections. "
        "It works by slowing the growth or spread of the virus inside the body."
    ),
    "proton_pump_inhibitor": (
        "{med} is a medicine that helps reduce the amount of acid produced in the stomach. "
        "It is commonly used for conditions related to excess stomach acid, such as heartburn, "
        "acid reflux, or stomach ulcers. It belongs to a group called proton pump inhibitors."
    ),
    "vitamin_supplement": (
        "{med} is a nutritional supplement. "
        "It is used to provide the body with vitamins or minerals that may be needed to support general health, "
        "correct a deficiency, or meet increased nutritional needs."
    ),
    "corticosteroid": (
        "{med} is a corticosteroid medicine. "
        "It is used to help reduce inflammation and suppress certain immune responses in the body. "
        "It may be used for a variety of conditions where inflammation is involved."
    ),
    "bronchodilator": (
        "{med} is a bronchodilator — a medicine that helps open up the airways in the lungs. "
        "It is commonly used to make breathing easier for people with conditions that cause airway tightness "
        "or obstruction, such as asthma or chronic respiratory conditions."
    ),
    "antidepressant": (
        "{med} is a medicine that can help support mental health and mood regulation. "
        "It belongs to a group of medicines used under medical supervision to help manage certain "
        "conditions affecting mood, emotions, or the nervous system."
    ),
    "antiparasitic": (
        "{med} is an antiparasitic medicine. "
        "It is used to help the body fight infections caused by parasites, "
        "which can affect different organs or systems depending on the type of parasite."
    ),
    "other": (
        "{med} is a prescription medicine. "
        "For a clear explanation of what this medicine is used for in your specific situation, "
        "please speak with your doctor or pharmacist."
    ),
}

DISCLAIMER = (
    "\n\n⚠️ This information is for support and education only. "
    "It is not a medical diagnosis or treatment recommendation. "
    "Always follow your doctor's or pharmacist's instructions."
)

def explain_medicine(medicine_name: str, category: str) -> str:
    template = EXPLANATION_TEMPLATES.get(category, EXPLANATION_TEMPLATES["other"])
    return template.format(med=medicine_name)

# Quick test
print("📝 Template test:")
print(explain_medicine("Amoxicillin", "antibiotic"))
print(explain_medicine("Metformin", "antidiabetic"))
print(explain_medicine("Paracetamol", "analgesic_antipyretic"))

# Save templates to JSON for use at inference time
with open(OUTPUT_DIR / "explanation_templates.json", "w") as f:
    json.dump(EXPLANATION_TEMPLATES, f, indent=2)
print(f"\n✅ Templates saved → {OUTPUT_DIR}/explanation_templates.json")


# ──────────────────────────────────────────────────────────────────────────────
# CELL 14 — End-to-End Inference Test
# ──────────────────────────────────────────────────────────────────────────────

print("\n" + "="*70)
print("END-TO-END INFERENCE TEST (simulating /prescription endpoint)")
print("="*70)

# Load models into HuggingFace pipelines (how they'll be used in FastAPI)
ner_pipeline = pipeline(
    "token-classification",
    model=str(NER_OUTPUT_DIR),
    tokenizer=str(NER_OUTPUT_DIR),
    aggregation_strategy="simple",   # merges B-/I- tokens into full spans
    device=0 if DEVICE == "cuda" else -1,
)

clf_pipeline = pipeline(
    "text-classification",
    model=str(CLF_OUTPUT_DIR),
    tokenizer=str(CLF_OUTPUT_DIR),
    device=0 if DEVICE == "cuda" else -1,
)

def extract_medicines_ml(ocr_text: str) -> list[str]:
    """Drop-in replacement for extract_medicines() in prescription.py"""
    entities = ner_pipeline(ocr_text)
    medicines = []
    for ent in entities:
        if ent["entity_group"] == "MED" and ent["score"] > 0.70:
            name = ent["word"].strip().title()
            if name not in medicines:
                medicines.append(name)
    return medicines

def explain_prescription_ml(ocr_text: str) -> str:
    """Drop-in replacement for explain_prescription() in prescription.py"""
    medicines = extract_medicines_ml(ocr_text)
    if not medicines:
        return (
            "No specific medicines were detected in the prescription text. "
            "Please consult your pharmacist to clarify the prescription."
            + DISCLAIMER
        )
    explanations = []
    for med in medicines:
        result = clf_pipeline(med)[0]
        category = result["label"]
        confidence = result["score"]
        explanation = explain_medicine(med, category)
        explanations.append(f"**{med}** (confidence: {confidence:.0%})\n{explanation}")
    full_response = "\n\n".join(explanations) + DISCLAIMER
    return full_response

# Test OCR texts
TEST_TEXTS = [
    "Rx: Tab Amoxicillin 500mg BD x 7 days. Tab Paracetamol 500mg TDS PRN. Tab Metronidazole 400mg TDS x 5 days.",
    "1. Metformin 850mg twice daily 2. Amlodipine 5mg once daily 3. Atorvastatin 20mg at night",
    "Patient: Age 32 F. Drug: Azithromycin 250mg OD x 3. Drug: Cetirizine 10mg OD.",
    "Date: 15/01/2024 Diagnosis: URI Treatment: Amoxicillin Cap 250mg TDS",
    "Pred 5mg Tab OD - 1 week. Salbutamol Inhaler PRN.",
]

for i, text in enumerate(TEST_TEXTS, 1):
    print(f"\n{'─'*60}")
    print(f"Test {i}: {text[:60]}...")
    meds = extract_medicines_ml(text)
    print(f"  → Extracted medicines: {meds}")
    explanation = explain_prescription_ml(text)
    print(f"  → Explanation preview: {explanation[:200]}...")

print("\n✅ End-to-end inference test complete")


# ──────────────────────────────────────────────────────────────────────────────
# CELL 15 — Generate Drop-in prescription.py Replacement
# ──────────────────────────────────────────────────────────────────────────────

PRESCRIPTION_PY_REPLACEMENT = '''"""
prescription.py — ML-powered version (no external LLM API required)

Drop-in replacement for the original prescription.py in your FastAPI microservice.
Replaces:
  - extract_medicines()    → BioBERT NER model
  - explain_prescription() → BioBERT classifier + structured templates

Usage:
  1. Copy your trained model folders next to this file:
       medfinder_models/ner_medicine_extractor/
       medfinder_models/medicine_classifier/
       medfinder_models/explanation_templates.json
  2. pip install transformers torch easyocr httpx
  3. Replace the old prescription.py with this file — no other changes needed.
"""

import os
import json
import httpx
import easyocr
from pathlib import Path
from transformers import pipeline

# ── Config ─────────────────────────────────────────────────────────────────────
MODEL_DIR        = Path(__file__).parent / "medfinder_models"
NER_MODEL_PATH   = MODEL_DIR / "ner_medicine_extractor"
CLF_MODEL_PATH   = MODEL_DIR / "medicine_classifier"
TEMPLATES_PATH   = MODEL_DIR / "explanation_templates.json"

from config import DISCLAIMER, LARAVEL_API_URL

# ── Load models once at startup (expensive; done at import time) ───────────────
print("[prescription_ml] Loading NER model...")
_ner_pipeline = pipeline(
    "token-classification",
    model=str(NER_MODEL_PATH),
    tokenizer=str(NER_MODEL_PATH),
    aggregation_strategy="simple",
    device=-1,   # CPU; set to 0 for GPU
)

print("[prescription_ml] Loading classifier model...")
_clf_pipeline = pipeline(
    "text-classification",
    model=str(CLF_MODEL_PATH),
    tokenizer=str(CLF_MODEL_PATH),
    device=-1,
)

print("[prescription_ml] Loading explanation templates...")
with open(TEMPLATES_PATH) as f:
    _TEMPLATES = json.load(f)

# ── EasyOCR ────────────────────────────────────────────────────────────────────
_ocr_reader = easyocr.Reader(["en"], gpu=False)

print("[prescription_ml] ✅ All models loaded")


def extract_prescription_text(image_path: str) -> str:
    """Extract text from prescription image using EasyOCR. Unchanged."""
    results = _ocr_reader.readtext(image_path, detail=0, paragraph=True)
    return " ".join(results).strip()


def extract_medicines(text: str) -> list[str]:
    """
    Extract medicine names from OCR text using fine-tuned BioBERT NER.
    Replaces the LLM call in the original extract_medicines().
    """
    if not text or not text.strip():
        return []
    try:
        entities = _ner_pipeline(text)
        medicines = []
        for ent in entities:
            if ent["entity_group"] == "MED" and ent["score"] > 0.70:
                name = ent["word"].strip().title()
                if name and name not in medicines:
                    medicines.append(name)
        return medicines
    except Exception as e:
        print(f"[extract_medicines] NER error: {e}")
        return []


def _explain_medicine(medicine_name: str, category: str) -> str:
    template = _TEMPLATES.get(category, _TEMPLATES["other"])
    return template.format(med=medicine_name)


def explain_prescription(text: str) -> str:
    """
    Explain prescription medicines in patient-friendly language.
    Replaces the LLM call in the original explain_prescription().
    """
    medicines = extract_medicines(text)

    if not medicines:
        return (
            "No specific medicines were detected in the prescription text. "
            "Please consult your pharmacist to clarify the contents of this prescription."
            + "\\n\\n" + DISCLAIMER
        )

    explanations = []
    for med in medicines:
        try:
            result = _clf_pipeline(med)[0]
            category = result["label"]
        except Exception as e:
            print(f"[explain_prescription] Classifier error for {med}: {e}")
            category = "other"
        explanations.append(f"**{med}**\\n{_explain_medicine(med, category)}")

    return "\\n\\n".join(explanations) + "\\n\\n" + DISCLAIMER


async def search_nearby_pharmacies(
    medicines: list[str],
    lat: float = None,
    lng: float = None,
    request_cookies: dict = None,
) -> list[dict]:
    """Query Laravel backend for nearby pharmacies. Unchanged from original."""
    if not medicines:
        return [{"message": "No medicines detected in prescription."}]

    headers = {"Accept": "application/json"}
    pharmacies = []
    seen = set()

    try:
        async with httpx.AsyncClient() as http:
            for medicine in medicines[:3]:
                if not medicine:
                    continue
                response = await http.get(
                    f"{LARAVEL_API_URL}/bot/search-drug",
                    params={"name": medicine},
                    headers=headers,
                    cookies=request_cookies,
                    timeout=15.0,
                )
                response.raise_for_status()
                data = response.json()
                if not isinstance(data, list):
                    continue
                for item in data:
                    key = f"{item.get(\'pharmacy\', \'\')}|{item.get(\'drug\', \'\')}|{item.get(\'location\', \'\')}"
                    if key in seen:
                        continue
                    seen.add(key)
                    normalized = {
                        **item,
                        "name": item.get("name") or item.get("pharmacy"),
                        "address": item.get("address") or item.get("location"),
                        "note": item.get("note") or (item.get("drug") and f"Drug: {item.get(\'drug\')}") or None,
                    }
                    pharmacies.append(normalized)
        return pharmacies if pharmacies else [{"message": "No nearby pharmacies found."}]
    except httpx.HTTPStatusError as e:
        return [{"error": f"Pharmacy API returned {e.response.status_code}"}]
    except Exception as e:
        print(f"[pharmacy search] Failed: {e}")
        return [{"error": "Could not connect to pharmacy database"}]
'''

replacement_path = OUTPUT_DIR / "prescription_ml.py"
with open(replacement_path, "w") as f:
    f.write(PRESCRIPTION_PY_REPLACEMENT)

print(f"✅ Drop-in replacement saved → {replacement_path}")
print("\nTo deploy:")
print("  1. Copy medfinder_models/ folder to your FastAPI server")
print("  2. Replace prescription.py with prescription_ml.py (rename it)")
print("  3. No changes needed in app.py or any other file")
print("  4. Remove 'openai' and 'python-dotenv' from requirements.txt")
print("  5. Add 'transformers' and 'torch' to requirements.txt")


# ──────────────────────────────────────────────────────────────────────────────
# CELL 16 — Download All Model Files from Colab
# ──────────────────────────────────────────────────────────────────────────────

import shutil

# Zip the entire models directory
zip_path = "medfinder_prescription_models"
shutil.make_archive(zip_path, "zip", ".", str(OUTPUT_DIR))
print(f"✅ Models zipped → {zip_path}.zip")

# Auto-download in Colab
try:
    from google.colab import files
    files.download(f"{zip_path}.zip")
    files.download(str(replacement_path))
    print("✅ Download started — check your browser downloads folder")
except ImportError:
    print("ℹ️  Not in Colab — find your files at:")
    print(f"   {zip_path}.zip")
    print(f"   {replacement_path}")

print("\n🎉 Training complete! Summary:")
print(f"   NER F1:         {ner_test_results.get('eval_f1', 'N/A'):.4f}")
print(f"   CLF Accuracy:   {clf_test_results.get('eval_accuracy', 'N/A'):.4f}")
print(f"   CLF F1 Macro:   {clf_test_results.get('eval_f1_macro', 'N/A'):.4f}")
