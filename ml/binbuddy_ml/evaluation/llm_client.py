"""LLM vision client for baseline classification evaluation."""

from __future__ import annotations

import base64
import json
import mimetypes
import os
import time
from pathlib import Path
from typing import Any

from openai import OpenAI

from binbuddy_ml.evaluation.class_mapping import EVAL_CATEGORIES, normalize_llm_category

CLASSIFICATION_PROMPT = """You are evaluating waste material classification.

Look at the image and classify the PRIMARY waste material visible.

Choose exactly ONE category from this list:
- Cardboard
- Glass
- Metal
- Paper
- Plastic
- General Waste

Respond with JSON only:
{"category": "<one of the categories above>", "confidence": "high|medium|low", "reasoning": "<brief 1 sentence>"}

Rules:
- Focus on the dominant material in the image
- General Waste is for non-recyclable mixed or unclassifiable items
- Use the exact category spelling from the list"""


def _load_api_key() -> str:
    key = os.environ.get("VERCEL_AI_GATEWAY_API_KEY") or os.environ.get(
        "AI_GATEWAY_API_KEY"
    )
    if not key:
        raise EnvironmentError(
            "Set VERCEL_AI_GATEWAY_API_KEY or AI_GATEWAY_API_KEY in the environment "
            "or in .env.local at the project root."
        )
    return key


def _encode_image(image_path: Path) -> tuple[str, str]:
    mime, _ = mimetypes.guess_type(image_path)
    if mime is None:
        mime = "image/jpeg"

    with image_path.open("rb") as f:
        encoded = base64.b64encode(f.read()).decode("utf-8")

    return encoded, mime


def _parse_json_response(content: str) -> dict[str, Any]:
    """Parse JSON from model output (may include markdown code fences)."""
    text = content.strip()
    if text.startswith("```"):
        lines = text.splitlines()
        text = "\n".join(lines[1:-1] if lines[-1].strip() == "```" else lines[1:])
    return json.loads(text)


def create_llm_client() -> OpenAI:
    # Python OpenAI client appends /chat/completions — use /v1, not /v1/ai
    base_url = os.environ.get(
        "AI_GATEWAY_BASE_URL", "https://ai-gateway.vercel.sh/v1"
    )
    return OpenAI(api_key=_load_api_key(), base_url=base_url)


def classify_image(
    client: OpenAI,
    image_path: Path,
    model: str,
    max_retries: int = 3,
    retry_delay: float = 2.0,
) -> dict[str, Any]:
    """Classify a single image via the vision LLM."""
    b64_image, mime = _encode_image(image_path)
    data_url = f"data:{mime};base64,{b64_image}"

    last_error: Exception | None = None

    for attempt in range(1, max_retries + 1):
        try:
            response = client.chat.completions.create(
                model=model,
                messages=[
                    {
                        "role": "user",
                        "content": [
                            {"type": "text", "text": CLASSIFICATION_PROMPT},
                            {
                                "type": "image_url",
                                "image_url": {"url": data_url},
                            },
                        ],
                    }
                ],
                temperature=0,
                max_tokens=300,
            )

            content = response.choices[0].message.content or "{}"
            parsed = _parse_json_response(content)
            raw_category = parsed.get("category", "")
            normalized = normalize_llm_category(str(raw_category))

            return {
                "raw_category": raw_category,
                "category": normalized,
                "confidence": parsed.get("confidence"),
                "reasoning": parsed.get("reasoning"),
                "valid": normalized in EVAL_CATEGORIES,
                "usage": {
                    "prompt_tokens": response.usage.prompt_tokens if response.usage else None,
                    "completion_tokens": response.usage.completion_tokens if response.usage else None,
                    "total_tokens": response.usage.total_tokens if response.usage else None,
                },
            }
        except Exception as exc:
            last_error = exc
            if attempt < max_retries:
                time.sleep(retry_delay * attempt)

    raise RuntimeError(
        f"LLM classification failed for {image_path} after {max_retries} attempts: {last_error}"
    )
