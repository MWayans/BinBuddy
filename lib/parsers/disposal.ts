import {
  DisposalRecommendationSchema,
  type DisposalRecommendation,
} from "@/lib/schemas/recommendations";

export type ParseResult =
  | { success: true; data: DisposalRecommendation }
  | { success: false; error: string };

/**
 * Extract a JSON object from LLM text (markdown code block or raw JSON).
 */
function extractJsonObject(text: string): Record<string, unknown> | null {
  const jsonMatch = text.match(/```(?:json)?\s*(\{[\s\S]*\})\s*```/);
  if (jsonMatch) {
    try {
      return JSON.parse(jsonMatch[1]) as Record<string, unknown>;
    } catch {
      return null;
    }
  }

  const jsonStart = text.indexOf("{");
  if (jsonStart < 0) return null;

  let braceCount = 0;
  let jsonEnd = jsonStart;
  for (let i = jsonStart; i < text.length; i++) {
    if (text[i] === "{") braceCount++;
    if (text[i] === "}") braceCount--;
    if (braceCount === 0) {
      jsonEnd = i + 1;
      break;
    }
  }

  try {
    return JSON.parse(text.substring(jsonStart, jsonEnd)) as Record<
      string,
      unknown
    >;
  } catch {
    return null;
  }
}

/**
 * Validate and normalize a disposal recommendation with Zod.
 */
export function validateDisposalRecommendation(
  input: unknown
): ParseResult {
  const result = DisposalRecommendationSchema.safeParse(input);
  if (result.success) {
    return { success: true, data: result.data };
  }
  return {
    success: false,
    error: result.error.issues.map((i) => i.message).join("; "),
  };
}

/**
 * Parse disposal recommendation from streamed or complete LLM text.
 * Supports legacy markdown-JSON responses and raw structured output.
 */
export function parseDisposalRecommendation(
  text: string
): DisposalRecommendation | null {
  const trimmed = text.trim();

  // Structured output may stream the object directly as JSON text
  if (trimmed.startsWith("{")) {
    try {
      const parsed = extractJsonObject(trimmed) ?? JSON.parse(trimmed);
      const validated = validateDisposalRecommendation(parsed);
      if (validated.success) return validated.data;
    } catch {
      // Fall through to legacy extraction
    }
  }

  const extracted = extractJsonObject(text);
  if (!extracted) return null;

  const validated = validateDisposalRecommendation(extracted);
  return validated.success ? validated.data : null;
}

/**
 * Parse a partial recommendation during streaming (best-effort, no strict validation).
 */
export function parsePartialDisposalRecommendation(
  text: string
): Partial<DisposalRecommendation> | null {
  const extracted = extractJsonObject(text);
  if (!extracted || typeof extracted.item !== "string") return null;
  return extracted as Partial<DisposalRecommendation>;
}

/**
 * Remove JSON blocks from text so only the intro/narrative is shown.
 */
export function stripJsonFromText(text: string): string {
  let cleaned = text
    .replace(/```(?:json)?\s*\{[\s\S]*?\}\s*```/g, "")
    .trim();

  const jsonStart = cleaned.indexOf("{");
  if (jsonStart >= 0) {
    let braceCount = 0;
    let jsonEnd = jsonStart;
    for (let i = jsonStart; i < cleaned.length; i++) {
      if (cleaned[i] === "{") braceCount++;
      if (cleaned[i] === "}") braceCount--;
      if (braceCount === 0) {
        jsonEnd = i + 1;
        break;
      }
    }
    if (jsonEnd > jsonStart) {
      cleaned =
        cleaned.substring(0, jsonStart) + cleaned.substring(jsonEnd);
    }
  }

  return cleaned.trim();
}

/**
 * Get display intro: prefer schema intro field, fall back to stripped narrative text.
 */
export function getDisplayIntro(
  recommendation: DisposalRecommendation | Partial<DisposalRecommendation>,
  rawText: string
): string | null {
  if (recommendation.intro?.trim()) {
    return recommendation.intro.trim();
  }
  const stripped = stripJsonFromText(rawText);
  return stripped || null;
}
