/**
 * Centralized environment variable access for server-side code.
 */

import path from "path";

export type InferenceMode = "llm" | "hybrid";

export function getGatewayApiKey(): string | undefined {
  return (
    process.env.VERCEL_AI_GATEWAY_API_KEY ?? process.env.AI_GATEWAY_API_KEY
  );
}

export function isAiConfigured(): boolean {
  return Boolean(getGatewayApiKey());
}

export function getGatewayBaseUrl(): string {
  return (
    process.env.AI_GATEWAY_BASE_URL ?? "https://ai-gateway.vercel.sh/v1/ai"
  );
}

export function getDisposalModel(): string {
  return process.env.DISPOSAL_MODEL ?? "openai/gpt-4o-mini";
}

export function getInferenceMode(): InferenceMode {
  const mode = process.env.INFERENCE_MODE?.toLowerCase();
  if (mode === "hybrid" || mode === "llm") {
    return mode;
  }
  return "hybrid";
}

export function getProjectRoot(): string {
  return process.cwd();
}

export function getMlRoot(): string {
  return process.env.ML_ROOT ?? path.join(getProjectRoot(), "ml");
}

export function getCvCheckpointPath(): string {
  const relative =
    process.env.CV_CHECKPOINT_PATH ??
    "runs/trashnet_efficientnet_b0_v1/best_model.pt";
  return path.isAbsolute(relative)
    ? relative
    : path.join(getMlRoot(), relative);
}

export function getCvConfigPath(): string {
  const relative =
    process.env.CV_CONFIG_PATH ?? "configs/trashnet_efficientnet_b0.yaml";
  return path.isAbsolute(relative)
    ? relative
    : path.join(getMlRoot(), relative);
}

export function getCvPythonPath(): string {
  const configured = process.env.CV_PYTHON_PATH;
  if (configured) {
    return configured;
  }
  return path.join(getMlRoot(), ".venv", "bin", "python");
}

export function getCvConfidenceThreshold(): number {
  const raw = process.env.CV_CONFIDENCE_THRESHOLD;
  if (!raw) return 0.7;
  const parsed = Number.parseFloat(raw);
  return Number.isFinite(parsed) ? parsed : 0.7;
}
