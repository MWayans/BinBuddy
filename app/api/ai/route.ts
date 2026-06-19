import { streamText, convertToModelMessages, Output, type UIMessage } from "ai";
import { DisposalRecommendationSchema } from "@/lib/schemas/recommendations";
import { DISPOSAL_SYSTEM_PROMPT } from "@/lib/ai/system-prompt";
import { buildHybridSystemPrompt } from "@/lib/ai/hybrid-prompt";
import { createAiGateway, getDisposalModelId } from "@/lib/ai/gateway";
import type { CvClassification } from "@/lib/classify/types";
import { extractImageBufferFromMessages } from "@/lib/classify/extract-image";
import {
  classifyImageBuffer,
  isCvModelAvailable,
} from "@/lib/classify/runner";
import {
  getInferenceMode,
  isAiConfigured,
} from "@/lib/config/env";

export const runtime = "nodejs";
export const maxDuration = 60;

async function resolveCvClassification(
  messages: UIMessage[],
  provided?: CvClassification | null
): Promise<CvClassification | null> {
  if (provided?.category) {
    return provided;
  }

  if (getInferenceMode() !== "hybrid" || !isCvModelAvailable()) {
    return null;
  }

  const imageBuffer = extractImageBufferFromMessages(messages);
  if (!imageBuffer) {
    return null;
  }

  try {
    return await classifyImageBuffer(imageBuffer);
  } catch (error) {
    console.warn("Server-side CV classification failed:", error);
    return null;
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { messages, cvClassification: clientCv } = body as {
      messages?: UIMessage[];
      cvClassification?: CvClassification | null;
    };

    if (!messages || !Array.isArray(messages)) {
      return new Response(
        JSON.stringify({ error: "Messages array is required" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    if (!isAiConfigured()) {
      return new Response(
        JSON.stringify({ error: "Vercel AI Gateway API key not configured" }),
        {
          status: 500,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    const cvClassification = await resolveCvClassification(
      messages,
      clientCv
    );

    const systemPrompt = cvClassification
      ? buildHybridSystemPrompt(cvClassification)
      : DISPOSAL_SYSTEM_PROMPT;

    const gateway = createAiGateway();
    const modelMessages = await convertToModelMessages(messages);

    const result = streamText({
      model: gateway(getDisposalModelId()),
      system: systemPrompt,
      messages: modelMessages,
      output: Output.object({
        name: "DisposalRecommendation",
        description:
          "Structured waste disposal recommendation for an item identified in Kenya",
        schema: DisposalRecommendationSchema,
      }),
      onError({ error }: { error: unknown }) {
        console.error("Disposal stream error:", error);
      },
    });

    const headers = new Headers();
    if (cvClassification) {
      headers.set("X-CV-Classification", JSON.stringify(cvClassification));
    }
    headers.set(
      "X-Inference-Mode",
      cvClassification ? "hybrid" : getInferenceMode()
    );

    return result.toUIMessageStreamResponse({ headers });
  } catch (error) {
    console.error("API route error:", error);
    return new Response(
      JSON.stringify({
        error:
          error instanceof Error ? error.message : "An unknown error occurred",
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}
