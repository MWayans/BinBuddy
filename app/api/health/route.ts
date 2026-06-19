import {
  getDisposalModel,
  getInferenceMode,
  getCvCheckpointPath,
  isAiConfigured,
} from "@/lib/config/env";
import { isCvModelAvailable } from "@/lib/classify/runner";

export const runtime = "nodejs";

export async function GET() {
  const aiConfigured = isAiConfigured();
  const inferenceMode = getInferenceMode();
  const cvAvailable = isCvModelAvailable();

  return Response.json({
    status: "ok",
    service: "binbuddy",
    version: process.env.npm_package_version ?? "0.1.0",
    inference: {
      mode: inferenceMode,
      model: getDisposalModel(),
      configured: aiConfigured,
      cv: {
        available: cvAvailable,
        checkpoint: getCvCheckpointPath(),
        active: inferenceMode === "hybrid" && cvAvailable,
      },
    },
    timestamp: new Date().toISOString(),
  });
}
