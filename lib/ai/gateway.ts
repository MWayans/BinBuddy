import { createGateway } from "@ai-sdk/gateway";
import {
  getGatewayApiKey,
  getGatewayBaseUrl,
  getDisposalModel,
} from "@/lib/config/env";

export function createAiGateway() {
  const apiKey = getGatewayApiKey();
  if (!apiKey) {
    throw new Error("Vercel AI Gateway API key not configured");
  }

  return createGateway({
    apiKey,
    baseURL: getGatewayBaseUrl(),
  });
}

export function getDisposalModelId(): string {
  return getDisposalModel();
}
