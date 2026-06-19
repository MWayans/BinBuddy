"""Load checkpoint and classify a single waste image."""

from __future__ import annotations

import json
from functools import lru_cache
from pathlib import Path
from typing import Any

import torch
import torch.nn.functional as F
from PIL import Image

from binbuddy_ml.config import load_config, resolve_path
from binbuddy_ml.data.transforms import build_transforms
from binbuddy_ml.evaluation.class_mapping import TRASHNET_TO_EVAL
from binbuddy_ml.models.factory import create_model

_DEFAULT_CONFIG = "configs/trashnet_efficientnet_b0.yaml"
_DEFAULT_CHECKPOINT = "runs/trashnet_efficientnet_b0_v1/best_model.pt"


@lru_cache(maxsize=1)
def _load_runtime(
    config_path: str,
    checkpoint_path: str,
) -> tuple[dict[str, Any], torch.nn.Module, Any, list[str], torch.device]:
    config = load_config(config_path)
    checkpoint_file = resolve_path(checkpoint_path)
    if not checkpoint_file.exists():
        raise FileNotFoundError(f"Checkpoint not found: {checkpoint_file}")

    device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
    checkpoint = torch.load(checkpoint_file, map_location=device)

    class_names = checkpoint.get("class_names", config["dataset"]["classes"])
    model = create_model(config).to(device)
    model.load_state_dict(checkpoint["model_state_dict"])
    model.eval()

    transform = build_transforms(config, "val")
    return config, model, transform, class_names, device


def classify_image_file(
    image_path: str | Path,
    config_path: str = _DEFAULT_CONFIG,
    checkpoint_path: str = _DEFAULT_CHECKPOINT,
) -> dict[str, Any]:
    """Return TrashNet class, BinBuddy category, confidence, and top-3 probs."""
    image_path = Path(image_path)
    if not image_path.exists():
        raise FileNotFoundError(f"Image not found: {image_path}")

    _, model, transform, class_names, device = _load_runtime(
        config_path, checkpoint_path
    )

    with Image.open(image_path) as img:
        tensor = transform(img.convert("RGB")).unsqueeze(0).to(device)

    with torch.no_grad():
        logits = model(tensor)
        probs = F.softmax(logits, dim=1)[0]

    confidence, pred_idx = torch.max(probs, dim=0)
    trashnet_class = class_names[int(pred_idx)]
    category = TRASHNET_TO_EVAL.get(trashnet_class, trashnet_class.title())

    top_k = min(3, len(class_names))
    top_probs, top_idx = torch.topk(probs, k=top_k)
    alternatives = [
        {
            "trashnet_class": class_names[int(idx)],
            "category": TRASHNET_TO_EVAL.get(class_names[int(idx)], class_names[int(idx)]),
            "confidence": float(prob),
        }
        for prob, idx in zip(top_probs.tolist(), top_idx.tolist())
    ]

    return {
        "trashnet_class": trashnet_class,
        "category": category,
        "confidence": float(confidence),
        "model": "efficientnet_b0",
        "checkpoint": str(resolve_path(checkpoint_path)),
        "alternatives": alternatives,
    }


def classify_image_bytes(
    image_bytes: bytes,
    config_path: str = _DEFAULT_CONFIG,
    checkpoint_path: str = _DEFAULT_CHECKPOINT,
) -> dict[str, Any]:
    """Classify from raw image bytes (JPEG/PNG)."""
    import io

    _, model, transform, class_names, device = _load_runtime(
        config_path, checkpoint_path
    )

    with Image.open(io.BytesIO(image_bytes)) as img:
        tensor = transform(img.convert("RGB")).unsqueeze(0).to(device)

    with torch.no_grad():
        logits = model(tensor)
        probs = F.softmax(logits, dim=1)[0]

    confidence, pred_idx = torch.max(probs, dim=0)
    trashnet_class = class_names[int(pred_idx)]
    category = TRASHNET_TO_EVAL.get(trashnet_class, trashnet_class.title())

    top_k = min(3, len(class_names))
    top_probs, top_idx = torch.topk(probs, k=top_k)
    alternatives = [
        {
            "trashnet_class": class_names[int(idx)],
            "category": TRASHNET_TO_EVAL.get(class_names[int(idx)], class_names[int(idx)]),
            "confidence": float(prob),
        }
        for prob, idx in zip(top_probs.tolist(), top_idx.tolist())
    ]

    return {
        "trashnet_class": trashnet_class,
        "category": category,
        "confidence": float(confidence),
        "model": "efficientnet_b0",
        "checkpoint": str(resolve_path(checkpoint_path)),
        "alternatives": alternatives,
    }


def result_to_json(result: dict[str, Any]) -> str:
    return json.dumps(result, indent=2)
