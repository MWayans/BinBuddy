"""Evaluate a trained model on the test split."""

from __future__ import annotations

import argparse
import json
from pathlib import Path

import matplotlib.pyplot as plt
import numpy as np
import seaborn as sns
import torch
import torch.nn as nn

from ecoscan_ml.config import get_run_dir, load_config, resolve_path
from ecoscan_ml.data.dataset import WasteImageDataset, validate_samples
from ecoscan_ml.data.splits import get_or_create_split_manifest
from ecoscan_ml.data.transforms import build_transforms
from ecoscan_ml.models.factory import create_model
from ecoscan_ml.training.engine import evaluate_model
from torch.utils.data import DataLoader


def _plot_confusion_matrix(
    cm: list[list[int]],
    class_names: list[str],
    output_path: Path,
) -> None:
    cm_array = np.array(cm)
    plt.figure(figsize=(8, 6))
    sns.heatmap(
        cm_array,
        annot=True,
        fmt="d",
        cmap="Blues",
        xticklabels=class_names,
        yticklabels=class_names,
    )
    plt.xlabel("Predicted")
    plt.ylabel("True")
    plt.title("Confusion Matrix (Test Set)")
    plt.tight_layout()
    plt.savefig(output_path, dpi=150)
    plt.close()


def evaluate(
    config_path: str,
    checkpoint_path: str | None = None,
) -> dict:
    config = load_config(config_path)
    run_dir = get_run_dir(config)
    manifest = get_or_create_split_manifest(config)
    validate_samples(manifest)

    if checkpoint_path is None:
        checkpoint_path = str(run_dir / "best_model.pt")
    checkpoint_path = resolve_path(checkpoint_path)

    if not Path(checkpoint_path).exists():
        raise FileNotFoundError(
            f"Checkpoint not found: {checkpoint_path}. Train the model first."
        )

    device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
    checkpoint = torch.load(checkpoint_path, map_location=device)

    class_names = checkpoint.get("class_names", manifest.classes)
    model = create_model(config).to(device)
    model.load_state_dict(checkpoint["model_state_dict"])
    model.eval()

    test_dataset = WasteImageDataset(
        samples=manifest.test,
        transform=build_transforms(config, "val"),
    )
    test_loader = DataLoader(
        test_dataset,
        batch_size=config["training"]["batch_size"],
        shuffle=False,
        num_workers=config["dataset"].get("num_workers", 2),
    )

    criterion = nn.CrossEntropyLoss()
    test_metrics = evaluate_model(
        model, test_loader, criterion, device, class_names
    )

    results = {
        "experiment_name": config["experiment"]["name"],
        "checkpoint": str(checkpoint_path),
        "split": "test",
        "num_samples": len(manifest.test),
        "accuracy": test_metrics["accuracy"],
        "macro_f1": test_metrics["macro_f1"],
        "weighted_f1": test_metrics["weighted_f1"],
        "per_class": test_metrics["per_class"],
        "confusion_matrix": test_metrics["confusion_matrix"],
    }

    results_path = run_dir / "test_results.json"
    with results_path.open("w", encoding="utf-8") as f:
        json.dump(results, f, indent=2)

    cm_path = run_dir / "confusion_matrix.png"
    _plot_confusion_matrix(
        test_metrics["confusion_matrix"],
        class_names,
        cm_path,
    )

    cm_csv_path = run_dir / "confusion_matrix.csv"
    np.savetxt(
        cm_csv_path,
        np.array(test_metrics["confusion_matrix"]),
        delimiter=",",
        fmt="%d",
        header=",".join(class_names),
        comments="",
    )

    print("Test set evaluation")
    print(f"  Accuracy:   {results['accuracy']:.4f}")
    print(f"  Macro F1:   {results['macro_f1']:.4f}")
    print(f"  Weighted F1:{results['weighted_f1']:.4f}")
    print(f"  Results:    {results_path}")
    print(f"  Confusion:  {cm_path}")

    for class_name in class_names:
        stats = results["per_class"][class_name]
        print(
            f"  {class_name:10s} "
            f"P={stats['precision']:.3f} "
            f"R={stats['recall']:.3f} "
            f"F1={stats['f1-score']:.3f} "
            f"(n={int(stats['support'])})"
        )

    return results


def main() -> None:
    parser = argparse.ArgumentParser(description="Evaluate BinBuddy waste classifier")
    parser.add_argument(
        "--config",
        default="configs/trashnet_efficientnet_b0.yaml",
    )
    parser.add_argument(
        "--checkpoint",
        default=None,
        help="Optional checkpoint path (default: runs/<experiment>/best_model.pt)",
    )
    args = parser.parse_args()
    evaluate(args.config, args.checkpoint)


if __name__ == "__main__":
    main()
