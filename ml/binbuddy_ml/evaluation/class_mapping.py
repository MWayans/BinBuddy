"""Map TrashNet labels to BinBuddy LLM category names for fair comparison."""

from __future__ import annotations

# TrashNet native class names (lowercase)
TRASHNET_CLASSES = [
    "cardboard",
    "glass",
    "metal",
    "paper",
    "plastic",
    "trash",
]

# LLM / BinBuddy category names used during evaluation
EVAL_CATEGORIES = [
    "Cardboard",
    "Glass",
    "Metal",
    "Paper",
    "Plastic",
    "General Waste",
]

TRASHNET_TO_EVAL: dict[str, str] = {
    "cardboard": "Cardboard",
    "glass": "Glass",
    "metal": "Metal",
    "paper": "Paper",
    "plastic": "Plastic",
    "trash": "General Waste",
}

EVAL_TO_TRASHNET: dict[str, str] = {v: k for k, v in TRASHNET_TO_EVAL.items()}

# Accept common LLM variants when normalizing predictions
EVAL_ALIASES: dict[str, str] = {
    "cardboard": "Cardboard",
    "glass": "Glass",
    "metal": "Metal",
    "paper": "Paper",
    "plastic": "Plastic",
    "trash": "General Waste",
    "general waste": "General Waste",
    "general": "General Waste",
    "other": "General Waste",
    "misc": "General Waste",
}


def trashnet_to_eval_label(class_name: str) -> str:
    key = class_name.strip().lower()
    if key not in TRASHNET_TO_EVAL:
        raise ValueError(f"Unknown TrashNet class: {class_name}")
    return TRASHNET_TO_EVAL[key]


def normalize_llm_category(raw: str) -> str | None:
    """Normalize free-form LLM category strings to an eval label."""
    if not raw or not raw.strip():
        return None

    cleaned = raw.strip()
    if cleaned in EVAL_CATEGORIES:
        return cleaned

    lowered = cleaned.lower()
    if lowered in EVAL_ALIASES:
        return EVAL_ALIASES[lowered]

    for category in EVAL_CATEGORIES:
        if category.lower() == lowered:
            return category

    return None


def eval_label_to_index(label: str) -> int:
    return EVAL_CATEGORIES.index(label)
