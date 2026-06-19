# BinBuddy 🗑️

BinBuddy is a photo-first waste sorting assistant for Kenya — snap an item, get material labels and practical disposal steps backed by vision AI.

![BinBuddy](public/Hiker%20in%20Vast%20Landscape.png)

## Features

- **Photo Check** – Camera or upload; GPT-4o-mini via Vercel AI Gateway returns a structured sorting card
- **Kenya Context** – Guidance references local streams, drop-off types, and common county practices
- **Hybrid Mode** – EfficientNet-B0 classifies material; the LLM focuses on disposal steps and hazards
- **Ordered Steps** – Numbered actions so you know what to do next
- **Hazard Callouts** – Flags risky items (batteries, chemicals, sharps) before you handle them
- **Recycle Hints** – Notes when an item can stay out of landfill and what to look for nearby
- **Drop-Off Pointers** – Suggests kinds of facilities to search for in your area
- **Streaming UI** – Results appear in a simple chat-style layout as they generate
- **Minimal Green Theme** – Clean, light green palette for a calm, eco-friendly feel

## Tech Stack

- **Framework**: [Next.js 15](https://nextjs.org) (App Router)
- **AI**: [Vercel AI SDK](https://sdk.vercel.ai) with AI Gateway
- **UI**: [shadcn/ui](https://ui.shadcn.com) + [Tailwind CSS](https://tailwindcss.com)
- **Models**: 
  - OpenAI GPT-4o-mini (vision-capable for image analysis)
- **Styling**: Minimal light green palette with soft sage accents

## Getting Started

### Prerequisites

- Node.js 18+ 
- pnpm (recommended) or npm/yarn

### Environment Variables

Create a `.env.local` file in the root directory:

```bash
# Vercel AI Gateway (required for AI features)
VERCEL_AI_GATEWAY_API_KEY=your_vercel_ai_gateway_api_key

# Alternative key name (also works)
AI_GATEWAY_API_KEY=your_ai_gateway_api_key

# Optional: override the vision model (default: openai/gpt-4o-mini)
DISPOSAL_MODEL=openai/gpt-4o-mini

# Hybrid mode (default): CNN classifies material, LLM provides disposal guidance
INFERENCE_MODE=hybrid

# Optional: paths if not using defaults under ml/
# CV_CHECKPOINT_PATH=ml/runs/trashnet_efficientnet_b0_v1/best_model.pt
# CV_PYTHON_PATH=ml/.venv/bin/python
```

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/binbuddy.git
cd binbuddy

# Install dependencies
pnpm install

# Run the development server
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) to see the app.

## Project Structure

```
├── app/
│   ├── (ui)/chat/        # Main disposal scanning interface
│   ├── api/
│   │   ├── ai/           # Structured disposal analysis (streaming)
│   │   └── health/       # Service health check
│   └── page.tsx          # Landing page
├── components/
│   ├── disposal/         # Recommendation card & sidebar
│   ├── Hero.tsx          # Landing page hero section
│   └── ui/               # shadcn/ui components
├── lib/
│   ├── ai/               # Gateway client & system prompt
│   ├── config/           # Environment helpers
│   ├── disposal/         # Chat message utilities
│   ├── parsers/          # Zod-validated response parsing
│   ├── schemas/
│   │   └── recommendations.ts  # Disposal recommendation schema
│   └── types/            # Waste category enums
├── ARCHITECTURE.md       # System design documentation
└── public/               # Static assets
```

> **Note:** The web app uses LLM vision for disposal guidance. A separate **TrashNet training pipeline** lives in `ml/` — see `ml/README.md` for Phase 1 data science workflow.

## Usage

1. **Home**: Tap "Check My Item" to open the sorting desk
2. **Photo**: Use the camera or pick a file from your gallery
3. **Analysis**: Material classification plus assistant-generated disposal steps
4. **Result card** includes:
   - Disposal method (Recycle, Compost, Landfill, etc.)
   - Step-by-step instructions
   - Safety hazards (if any)
   - Recycling availability
   - Kenya-specific location information
   - Environmental impact notes

## Disposal Categories

The app helps with:
- **Plastic** items
- **Electronic** waste
- **Organic** materials
- **Hazardous** substances
- **General Waste**
- And more!

## Deployment

Deploy to Vercel with one click:

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/yourusername/binbuddy)

Make sure to add your environment variables in the Vercel dashboard.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT License - see [LICENSE](LICENSE) for details.

---

Built with 🗑️ for clearer bins in Kenya.
