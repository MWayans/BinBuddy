# BinBuddy Architecture

BinBuddy is a hybrid waste-sorting app for Kenya. Users share photos; a CNN classifies material, then a vision LLM returns structured disposal steps and local notes.

## Current Architecture (LLM Prototype)

```
┌─────────────┐     POST /api/ai      ┌──────────────────┐     ┌─────────────────┐
│  Next.js    │ ────────────────────► │  streamText +    │ ──► │ Vercel AI       │
│  Chat UI    │ ◄── UI message stream │  Output.object   │     │ Gateway         │
└─────────────┘                       └──────────────────┘     │ (GPT-4o-mini)   │
                                                               └─────────────────┘
```

### Inference mode

| Property | Value |
|----------|-------|
| Mode | `hybrid` (default) or `llm` via `INFERENCE_MODE` |
| CV model | EfficientNet-B0 (`best_model.pt`) |
| LLM | `openai/gpt-4o-mini` (configurable via `DISPOSAL_MODEL`) |
| Output | Zod-validated structured object + optional CNN badge in UI |
| Training pipeline | **Phase 1** in `ml/` (TrashNet + PyTorch) |
| Baseline comparison | **Phase 2** (CNN vs LLM on same test split) |

**Hybrid flow (Phase 3):** user image → `POST /api/classify` (PyTorch CNN) → category + confidence → `POST /api/ai` (LLM enrichment with hybrid system prompt) → disposal recommendation.

## Repository layout

```
app/
  (ui)/chat/          # Scan & chat interface
  api/ai/             # Disposal analysis (hybrid or LLM-only streaming output)
  api/classify/       # CNN material classification (hybrid mode)
  api/health/         # Service health check
lib/
  ai/                 # Gateway client, system prompt
  config/             # Environment helpers
  disposal/           # Message extraction utilities
  parsers/            # Zod-validated response parsing
  schemas/            # DisposalRecommendation schema
  types/              # Waste category & method enums
components/disposal/  # Recommendation card, sidebar
```

## API

### `POST /api/classify`

Runs EfficientNet-B0 on an uploaded image (hybrid mode only).

**Request:** `multipart/form-data` with `image` file

**Response:** `{ trashnet_class, category, confidence, model, alternatives }`

### `POST /api/ai`

Streams a structured `DisposalRecommendation` using the Vercel AI SDK `Output.object()` pattern.

**Request:** `{ messages: UIMessage[], cvClassification?: CvClassification }`

In hybrid mode, the route uses a CV-aware system prompt when `cvClassification` is provided (or classifies server-side from the image).

**Response:** UI message stream compatible with `@ai-sdk/react` `useChat`

### `GET /api/health`

Returns service status, inference mode, CV model availability, and AI gateway configuration.

## Data model

`DisposalRecommendation` fields:

| Field | Type | Description |
|-------|------|-------------|
| `intro` | string | Friendly opening message |
| `item` | string | Identified item |
| `material` | string | Primary material(s) |
| `category` | enum | Waste category |
| `disposal_method` | enum | Recycle, Compost, Landfill, etc. |
| `disposal_steps` | string[] | Step-by-step instructions |
| `recycling_available` | boolean | Recycling availability |
| `hazards` | string[]? | Safety concerns |
| `local_notes` | string | Kenya-specific guidance |
| `location_info` | string? | Disposal facilities |
| `environmental_impact` | string? | Environmental note |

Categories: Plastic, Paper, Metal, Glass, Cardboard, Electronic, Organic, Hazardous, General Waste.

## Environment variables

| Variable | Required | Default | Purpose |
|----------|----------|---------|---------|
| `VERCEL_AI_GATEWAY_API_KEY` | Yes* | — | AI Gateway authentication |
| `AI_GATEWAY_API_KEY` | Yes* | — | Alternative key name |
| `DISPOSAL_MODEL` | No | `openai/gpt-4o-mini` | Model ID |
| `AI_GATEWAY_BASE_URL` | No | Vercel gateway URL | Gateway endpoint |
| `INFERENCE_MODE` | No | `hybrid` | `hybrid` (CNN + LLM) or `llm` |
| `CV_CHECKPOINT_PATH` | No | `ml/runs/.../best_model.pt` | CNN weights |
| `CV_PYTHON_PATH` | No | `ml/.venv/bin/python` | Python for subprocess classify |

\*One of the two API key variables is required.

## Future evolution

The LLM prototype is designed to support a later **hybrid** architecture:

1. **CV classifier** (PyTorch, trained on TrashNet etc.) for deterministic material class + confidence
2. **LLM enrichment** for disposal steps, hazards, and Kenya-specific guidance
3. **PostgreSQL** for prediction logging, feedback, and retraining triggers

### ML training (Phase 1 — implemented)

```
TrashNet images → stratified split → EfficientNet-B0 → test eval + confusion matrix
```

See [`ml/README.md`](ml/README.md) for setup and reproduction steps.

### LLM baseline evaluation (Phase 2 — implemented)

```
Same TrashNet test split → GPT-4o-mini vision → category accuracy vs CNN
```

Run from `ml/`: `python -m ecoscan_ml.evaluation.llm_baseline`

### Hybrid inference (Phase 3 — implemented)

```
User image → POST /api/classify (EfficientNet-B0) → POST /api/ai (GPT-4o-mini guidance)
```

See `ml/ecoscan_ml/inference/` and `lib/classify/`.

### Planned next

1. PostgreSQL prediction logging and feedback loop (Phase 4)

## Deployment

- **Platform:** Vercel (recommended)
- **Runtime:** Node.js (`maxDuration: 60` on `/api/ai`)
- **Secrets:** Set gateway API key in Vercel dashboard

```bash
pnpm install
pnpm dev        # http://localhost:3000
pnpm build && pnpm start
```

## Legacy code

`lib/tools/weather.ts` and `lib/tools/location.ts` are unused legacy tools from an earlier app variant. They are not wired into the disposal flow.
