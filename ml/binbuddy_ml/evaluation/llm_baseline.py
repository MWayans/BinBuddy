"""Evaluate GPT-4o-mini vision baseline on the TrashNet test split."""

from __future__ import annotations

import argparse
import json
import os
from datetime import datetime, timezone
from pathlib import Path
from typing import Any

import numpy as np
from dotenv import load_dotenv
from tqdm import tqdm

from binbuddy_ml.config import get_run_dir, load_config, resolve_path
from binbuddy_ml.data.splits import SplitManifest, get_or_create_split_manifest
from binbuddy_ml.evaluation.class_mapping import (
    EVAL_CATEGORIES,
    eval_label_to_index,
    trashnet_to_eval_label,
)
from binbuddy_ml.evaluation.llm_client import classify_image, create_llm_client
from binbuddy_ml.evaluation.plots import plot_confusion_matrix
from binbuddy_ml.training.metrics import compute_metrics

# Load gateway key from project root .env.local if present
_PROJECT_ROOT = Path(__file__).resolve().parents[3]
load_dotenv(_PROJECT_ROOT / ".env.local")
load_dotenv(_PROJECT_ROOT / ".env")


def _load_progress(path: Path) -> dict[str, Any]:
    if not path.exists():
        return {"predictions": []}
    with path.open("r", encoding="utf-8") as f:
        return json.load(f)


def _save_progress(path: Path, data: dict[str, Any]) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    with path.open("w", encoding="utf-8") as f:
        json.dump(data, f, indent=2)


def evaluate_llm_baseline(
    config_path: str,
    limit: int | None = None,
    resume: bool = True,
    model: str | None = None,
) -> dict[str, Any]:
    config = load_config(config_path)
    manifest = get_or_create_split_manifest(config)
    run_dir = get_run_dir(config)

    model_id = model or os.environ.get("DISPOSAL_MODEL", "openai/gpt-4o-mini")
    client = create_llm_client()

    progress_path = run_dir / "llm_baseline_progress.json"
    results_path = run_dir / "llm_baseline_results.json"

    progress = _load_progress(progress_path) if resume else {"predictions": []}
    completed_paths = {
        p["path"]
        for p in progress.get("predictions", [])
        if p.get("error") is None and p.get("valid_prediction")
    }

    test_samples = manifest.test
    if limit is not None:
        test_samples = test_samples[:limit]

    pending = [s for s in test_samples if s["path"] not in completed_paths]

    print(
        f"LLM baseline eval: {len(pending)} images to classify "
        f"({len(completed_paths)} already done, model={model_id})"
    )

    for sample in tqdm(pending, desc="LLM classify"):
        image_path = Path(sample["path"])
        true_eval = trashnet_to_eval_label(sample["class_name"])

        try:
            prediction = classify_image(client, image_path, model=model_id)
            pred_category = prediction.get("category")
            pred_valid = pred_category in EVAL_CATEGORIES

            progress.setdefault("predictions", []).append(
                {
                    "path": sample["path"],
                    "true_trashnet": sample["class_name"],
                    "true_eval": true_eval,
                    "predicted_category": pred_category,
                    "raw_category": prediction.get("raw_category"),
                    "valid_prediction": pred_valid,
                    "confidence": prediction.get("confidence"),
                    "reasoning": prediction.get("reasoning"),
                    "usage": prediction.get("usage"),
                    "error": None,
                }
            )
        except Exception as exc:
            progress.setdefault("predictions", []).append(
                {
                    "path": sample["path"],
                    "true_trashnet": sample["class_name"],
                    "true_eval": true_eval,
                    "predicted_category": None,
                    "raw_category": None,
                    "valid_prediction": False,
                    "confidence": None,
                    "reasoning": None,
                    "usage": None,
                    "error": str(exc),
                }
            )

        _save_progress(progress_path, progress)

    sample_paths = {s["path"] for s in test_samples}
    records = [
        p for p in progress["predictions"] if p["path"] in sample_paths
    ]

    total = len(test_samples)
    valid_records = [r for r in records if r.get("valid_prediction")]
    valid_count = len(valid_records)
    parse_rate = valid_count / total if total else 0.0

    correct = sum(
        1
        for r in records
        if r.get("predicted_category") == r["true_eval"]
    )
    accuracy_all = correct / total if total else 0.0

    # Confusion matrix uses only successfully parsed predictions
    y_true = [eval_label_to_index(r["true_eval"]) for r in valid_records]
    y_pred = [
        eval_label_to_index(r["predicted_category"])  # type: ignore[arg-type]
        for r in valid_records
    ]
    metrics = (
        compute_metrics(y_true, y_pred, EVAL_CATEGORIES)
        if valid_records
        else {
            "accuracy": 0.0,
            "macro_f1": 0.0,
            "weighted_f1": 0.0,
            "per_class": {},
            "confusion_matrix": [],
        }
    )

    results = {
        "experiment_name": config["experiment"]["name"],
        "model": model_id,
        "evaluated_at": datetime.now(timezone.utc).isoformat(),
        "split": "test",
        "num_samples": total,
        "valid_predictions": valid_count,
        "parse_rate": parse_rate,
        "failed_requests": sum(1 for p in progress["predictions"] if p.get("error")),
        "accuracy": accuracy_all,
        "accuracy_valid_only": metrics["accuracy"],
        "macro_f1": metrics["macro_f1"],
        "weighted_f1": metrics["weighted_f1"],
        "per_class": metrics["per_class"],
        "confusion_matrix": metrics["confusion_matrix"],
        "categories": EVAL_CATEGORIES,
        "predictions": records,
    }

    with results_path.open("w", encoding="utf-8") as f:
        json.dump(results, f, indent=2)

    if metrics["confusion_matrix"]:
        plot_confusion_matrix(
            metrics["confusion_matrix"],
            EVAL_CATEGORIES,
            run_dir / "llm_confusion_matrix.png",
            title="LLM Baseline Confusion Matrix (Test Set)",
        )

        np.savetxt(
            run_dir / "llm_confusion_matrix.csv",
            np.array(metrics["confusion_matrix"]),
            delimiter=",",
            fmt="%d",
            header=",".join(EVAL_CATEGORIES),
            comments="",
        )
    else:
        print("  Skipping confusion matrix plot (no valid predictions)")

    # Save misclassifications for error analysis
    misclassified = [
        p for p in results["predictions"]
        if p.get("valid_prediction") and p["predicted_category"] != p["true_eval"]
    ]
    with (run_dir / "llm_misclassified.json").open("w", encoding="utf-8") as f:
        json.dump(misclassified, f, indent=2)

    print("\nLLM baseline results")
    print(f"  Samples:        {total}")
    print(f"  Parse rate:     {parse_rate:.1%}")
    print(f"  Accuracy (all): {results['accuracy']:.4f}")
    print(f"  Accuracy (parsed only): {results['accuracy_valid_only']:.4f}")
    print(f"  Macro F1:       {results['macro_f1']:.4f}")
    print(f"  Results file:   {results_path}")
    print(f"  Confusion matrix: {run_dir / 'llm_confusion_matrix.png'}")

    return results


def main() -> None:
    parser = argparse.ArgumentParser(
        description="Evaluate LLM vision baseline on TrashNet test split"
    )
    parser.add_argument(
        "--config",
        default="configs/trashnet_efficientnet_b0.yaml",
        help="Training config whose test split will be used",
    )
    parser.add_argument(
        "--limit",
        type=int,
        default=None,
        help="Limit number of test images (for cost control)",
    )
    parser.add_argument(
        "--model",
        default=None,
        help="Model ID (default: DISPOSAL_MODEL env or openai/gpt-4o-mini)",
    )
    parser.add_argument(
        "--no-resume",
        action="store_true",
        help="Start fresh instead of resuming partial progress",
    )
    args = parser.parse_args()

    evaluate_llm_baseline(
        config_path=args.config,
        limit=args.limit,
        resume=not args.no_resume,
        model=args.model,
    )


if __name__ == "__main__":
    main()
