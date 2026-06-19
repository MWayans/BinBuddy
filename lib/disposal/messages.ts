import type { UIMessage } from "ai";
import {
  parseDisposalRecommendation,
  parsePartialDisposalRecommendation,
  getDisplayIntro,
} from "@/lib/parsers/disposal";
import type { DisposalRecommendation } from "@/lib/schemas/recommendations";

export function getTextFromMessage(message: UIMessage): string {
  return message.parts
    .filter((part) => part.type === "text")
    .map((part) => (part as { text: string }).text)
    .join("");
}

export function getLastDisposalRecommendation(
  messages: UIMessage[]
): DisposalRecommendation | null {
  for (let i = messages.length - 1; i >= 0; i--) {
    const message = messages[i];
    if (message.role !== "assistant") continue;

    const text = getTextFromMessage(message);
    const parsed = parseDisposalRecommendation(text);
    if (parsed) return parsed;
  }
  return null;
}

export function getDisposalFromAssistantMessage(message: UIMessage): {
  recommendation: DisposalRecommendation | Partial<DisposalRecommendation> | null;
  intro: string | null;
  isComplete: boolean;
} {
  const text = getTextFromMessage(message);
  const complete = parseDisposalRecommendation(text);
  if (complete) {
    return {
      recommendation: complete,
      intro: getDisplayIntro(complete, text),
      isComplete: true,
    };
  }

  const partial = parsePartialDisposalRecommendation(text);
  if (partial) {
    return {
      recommendation: partial,
      intro: getDisplayIntro(partial, text),
      isComplete: false,
    };
  }

  return { recommendation: null, intro: null, isComplete: false };
}
