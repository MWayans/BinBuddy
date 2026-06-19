"""Compare CNN and LLM baseline metrics on the same test split."""

from __future__ import annotations

import argparse
import json
from pathlib import Path

from binbuddy_ml.config import get_run_dir, load_config


def compare_baselines(config_path: str) -> dict:
    config = load_config(config_path)
    run_dir = get_run_dir(config)

    cnn_path = run_dir / "test_results.json"
    llm_path = run_dir / "llm_baseline_results.json"

    if not cnn_path.exists():
        raise FileNotFoundError(
            f"CNN results not found at {cnn_path}. Run training evaluation first."
        )
    if not llm_path.exists():
        raise FileNotFoundError(
            f"LLM results not found at {llm_path}. Run llm_baseline first."
        )

    with cnn_path.open("r", encoding="utf-8") as f:
        cnn = json.load(f)
    with llm_path.open("r", encoding="utf-8") as f:
        llm = json.load(f)

    # Map CNN TrashNet class names to eval labels for display consistency
    from binbuddy_ml.evaluation.class_mapping import TRASHNET_TO_EVAL

    cnn_per_class = {}
    for trashnet_name, stats in cnn.get("per_class", {}).items():
        eval_name = TRASHNET_TO_EVAL.get(trashnet_name, trashnet_name)
        cnn_per_class[eval_name] = stats

    comparison = {
        "experiment_name": config["experiment"]["name"],
        "test_samples": {
            "cnn": cnn.get("num_samples"),
            "llm": llm.get("num_samples"),
        },
        "summary": {
            "cnn": {
                "accuracy": cnn.get("accuracy"),
                "macro_f1": cnn.get("macro_f1"),
                "weighted_f1": cnn.get("weighted_f1"),
            },
            "llm": {
                "accuracy": llm.get("accuracy"),
                "accuracy_valid_only": llm.get("accuracy_valid_only"),
                "macro_f1": llm.get("macro_f1"),
                "weighted_f1": llm.get("weighted_f1"),
                "parse_rate": llm.get("parse_rate"),
                "model": llm.get("model"),
            },
            "delta": {
                "accuracy": (cnn.get("accuracy") or 0) - (llm.get("accuracy") or 0),
                "macro_f1": (cnn.get("macro_f1") or 0) - (llm.get("macro_f1") or 0),
            },
        },
        "per_class_f1": {},
    }

    all_classes = sorted(
        set(cnn_per_class.keys()) | set(llm.get("per_class", {}).keys())
    )
    for class_name in all_classes:
        comparison["per_class_f1"][class_name] = {
            "cnn": cnn_per_class.get(class_name, {}).get("f1-score"),
            "llm": llm.get("per_class", {}).get(class_name, {}).get("f1-score"),
        }

    winner = "cnn" if comparison["summary"]["delta"]["macro_f1"] > 0 else "llm"
    if abs(comparison["summary"]["delta"]["macro_f1"]) < 0.01:
        winner = "tie"
    comparison["winner_macro_f1"] = winner

    output_path = run_dir / "baseline_comparison.json"
    with output_path.open("w", encoding="utf-8") as f:
        json.dump(comparison, f, indent=2)

    print("Baseline comparison (CNN vs LLM)")
    print(f"  CNN accuracy:  {comparison['summary']['cnn']['accuracy']:.4f}")
    print(f"  LLM accuracy:  {comparison['summary']['llm']['accuracy']:.4f}")
    print(f"  CNN macro F1:  {comparison['summary']['cnn']['macro_f1']:.4f}")
    print(f"  LLM macro F1:  {comparison['summary']['llm']['macro_f1']:.4f}")
    print(f"  Delta (CNN-LLM) macro F1: {comparison['summary']['delta']['macro_f1']:+.4f}")
    print(f"  Winner (macro F1): {winner}")
    print(f"  Saved to: {output_path}")

    return comparison


def main() -> None:
    parser = argparse.ArgumentParser(description="Compare CNN vs LLM baselines")
    parser.add_argument(
        "--config",
        default="configs/trashnet_efficientnet_b0.yaml",
    )
    args = parser.parse_args()
    compare_baselines(args.config)


if __name__ == "__main__":
    main()
