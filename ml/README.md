# BinBuddy ML Pipeline

Train and evaluate waste image classifiers on **TrashNet**, then compare against the **GPT-4o-mini vision LLM** baseline on the same test split. This is the data science core of BinBuddy, separate from the LLM disposal app in the Next.js frontend.

## What this delivers

- TrashNet download and validation
- Stratified train/val/test splits (reproducible, saved to JSON)
- EDA plots (class distribution, sample images)
- EfficientNet-B0 training with checkpointing
- Test-set evaluation with **accuracy, macro F1, per-class metrics, confusion matrix**

## Prerequisites

- Python 3.10+
- ~2 GB disk space for TrashNet
- Optional: CUDA GPU (CPU training works, slower)

## Setup

```bash
cd ml
python3 -m venv .venv
source .venv/bin/activate   # Windows: .venv\Scripts\activate
pip install -r requirements.txt
```

## Phase 1 workflow

Run these commands from the `ml/` directory:

### 1. Download TrashNet

```bash
python -m ecoscan_ml.data.download
```

Downloads the [TrashNet](https://github.com/garythung/trashnet) resized dataset (~2,527 images, 6 classes).

### 2. Exploratory data analysis

```bash
python -m ecoscan_ml.scripts.eda
```

Outputs to `runs/trashnet_efficientnet_b0_v1/eda/`:
- `eda_summary.json`
- `class_distribution.png`
- `split_distribution.png`
- `sample_images.png`

### 3. Train EfficientNet-B0

```bash
python -m ecoscan_ml.training.train --download
```

Or without re-download if data already exists:

```bash
python -m ecoscan_ml.training.train
```

Artifacts:
- `runs/trashnet_efficientnet_b0_v1/best_model.pt`
- `runs/trashnet_efficientnet_b0_v1/training_history.json`
- `runs/trashnet_efficientnet_b0_v1/metadata.json`
- `registry/trashnet_efficientnet_b0_v1.pt`

### 4. Evaluate on test set

```bash
python -m ecoscan_ml.training.evaluate
```

Outputs:
- `runs/trashnet_efficientnet_b0_v1/test_results.json`
- `runs/trashnet_efficientnet_b0_v1/confusion_matrix.png`
- `runs/trashnet_efficientnet_b0_v1/confusion_matrix.csv`

## Quick smoke test (2 epochs)

Verify the pipeline works before a full training run:

```bash
python -m ecoscan_ml.training.train --config configs/trashnet_smoke.yaml
python -m ecoscan_ml.training.evaluate --config configs/trashnet_smoke.yaml
```

## One-shot script (full training)

```bash
python -m ecoscan_ml.data.download && \
python -m ecoscan_ml.scripts.eda && \
python -m ecoscan_ml.training.train && \
python -m ecoscan_ml.training.evaluate
```

## Configuration

Edit `configs/trashnet_efficientnet_b0.yaml` to change:
- Architecture (`efficientnet_b0`, `resnet18`, `mobilenet_v3_small`)
- Epochs, batch size, learning rate
- Split ratios
- Augmentation settings

Override data location:

```bash
export DATA_ROOT=/path/to/your/data
```

## TrashNet classes

| TrashNet class | BinBuddy category (hybrid) |
|--------------|-----------------------------------|
| cardboard    | Cardboard                         |
| glass        | Glass                             |
| metal        | Metal                             |
| paper        | Paper                             |
| plastic      | Plastic                           |
| trash        | General Waste                     |

## Reproducibility

- Fixed seed: `42` (configurable in YAML)
- Split manifest saved to `data/splits/<experiment_name>.json`
- Training metadata includes config path, timestamps, and per-epoch history

## Google Colab

TrashNet is small enough for Colab free tier. Upload the `ml/` folder or clone the repo, then:

```python
%cd ml
!pip install -r requirements.txt
!python -m ecoscan_ml.data.download
!python -m ecoscan_ml.scripts.eda
!python -m ecoscan_ml.training.train
!python -m ecoscan_ml.training.evaluate
```

## Project structure

```
ml/
├── configs/                  # Training configs
├── ecoscan_ml/
│   ├── data/                 # Download, splits, datasets, transforms
│   ├── models/               # Model factory
│   ├── training/             # Train, evaluate, metrics
│   ├── evaluation/           # LLM baseline, CNN comparison
│   └── scripts/              # EDA
├── data/
│   ├── raw/trashnet/         # Downloaded images (gitignored)
│   └── splits/               # Split manifests (gitignored)
├── runs/                     # Per-experiment outputs (gitignored)
├── registry/                 # Best model copies (gitignored)
└── requirements.txt
```

## Phase 2: LLM baseline evaluation

Evaluate GPT-4o-mini on the **same test split** as the CNN for a fair comparison.

### Prerequisites

- `VERCEL_AI_GATEWAY_API_KEY` or `AI_GATEWAY_API_KEY` in `.env.local` at project root
- Phase 1 split manifest generated (`data/splits/trashnet_efficientnet_b0_v1.json`)

### Run LLM eval

Cheap smoke test (5 images):

```bash
python -m ecoscan_ml.evaluation.llm_baseline --limit 5
```

Full test set (384 images, ~$2–5 API cost):

```bash
python -m ecoscan_ml.evaluation.llm_baseline
```

Resume interrupted runs automatically via `llm_baseline_progress.json`.

Outputs:
- `runs/trashnet_efficientnet_b0_v1/llm_baseline_results.json`
- `runs/trashnet_efficientnet_b0_v1/llm_confusion_matrix.png`
- `runs/trashnet_efficientnet_b0_v1/llm_misclassified.json`

### Compare CNN vs LLM

Requires both `test_results.json` (CNN) and `llm_baseline_results.json`:

```bash
python -m ecoscan_ml.evaluation.compare
```

Outputs `runs/trashnet_efficientnet_b0_v1/baseline_comparison.json`.

### Metrics explained

| Metric | CNN | LLM |
|--------|-----|-----|
| `accuracy` | Standard top-1 accuracy | Correct / all test images (invalid = wrong) |
| `accuracy_valid_only` | — | Accuracy among parseable LLM responses only |
| `parse_rate` | — | % of images where LLM returned a valid category |
| `macro_f1` | Per-class F1 averaged | Same, on parsed predictions only |

## Phase 3: Hybrid inference (app integration)

The Next.js app can run the trained CNN before LLM disposal guidance.

### Classify a single image (CLI)

```bash
python -m ecoscan_ml.inference.predict --image path/to/image.jpg
```

### App setup

From project root, set in `.env.local`:

```bash
INFERENCE_MODE=hybrid
VERCEL_AI_GATEWAY_API_KEY=your_key
```

Ensure `ml/runs/trashnet_efficientnet_b0_v1/best_model.pt` exists and `ml/.venv` is installed.

Run the app:

```bash
pnpm dev
```

Flow: `POST /api/classify` (CNN) → `POST /api/ai` (LLM enrichment with CV-aware prompt).

Set `INFERENCE_MODE=llm` to disable CNN and use vision-only LLM mode.

## Next phases

- **Phase 4:** User feedback loop and retraining

## Troubleshooting

- **NumPy / PyTorch error:** Use `numpy>=1.24,<2` as pinned in `requirements.txt`
- **TrashNet download:** The upstream repo ships `dataset-resized.zip`; the downloader extracts it automatically
- **Slow on CPU:** Use Google Colab GPU or reduce epochs via `configs/trashnet_smoke.yaml` for testing

## Important

Metrics in `test_results.json` are **real** outputs from your trained model on the held-out test split. Do not cite metrics until you have run training and evaluation locally. A 2-epoch smoke test is for pipeline verification only — use the full 25-epoch config for reportable results.
