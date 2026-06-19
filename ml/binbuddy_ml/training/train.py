"""Train a waste classification model."""

from __future__ import annotations

import argparse
import json
from datetime import datetime, timezone
from pathlib import Path

import torch
import torch.nn as nn
from torch.optim.lr_scheduler import CosineAnnealingLR

from binbuddy_ml.config import get_registry_dir, get_run_dir, load_config, resolve_path
from binbuddy_ml.data.dataset import create_dataloaders, validate_samples
from binbuddy_ml.data.download import download_trashnet
from binbuddy_ml.data.splits import get_or_create_split_manifest
from binbuddy_ml.models.factory import create_model
from binbuddy_ml.reproducibility import set_seed
from binbuddy_ml.training.engine import evaluate_model, train_one_epoch


def _create_optimizer(model: nn.Module, config: dict) -> torch.optim.Optimizer:
    train_cfg = config["training"]
    name = train_cfg.get("optimizer", "adamw").lower()
    lr = train_cfg["learning_rate"]
    weight_decay = train_cfg.get("weight_decay", 0.0)

    if name == "adamw":
        return torch.optim.AdamW(model.parameters(), lr=lr, weight_decay=weight_decay)
    if name == "adam":
        return torch.optim.Adam(model.parameters(), lr=lr, weight_decay=weight_decay)
    raise ValueError(f"Unsupported optimizer: {name}")


def train(config_path: str, download: bool = False) -> Path:
    config = load_config(config_path)
    set_seed(config["experiment"]["seed"])

    if download:
        download_trashnet()

    dataset_path = resolve_path(config["dataset"]["path"])
    if not dataset_path.exists():
        raise FileNotFoundError(
            f"Dataset not found at {dataset_path}. "
            "Run: python -m binbuddy_ml.data.download"
        )

    manifest = get_or_create_split_manifest(config)
    validate_samples(manifest)

    loaders = create_dataloaders(config, manifest)
    class_names = manifest.classes

    device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
    print(f"Using device: {device}")

    model = create_model(config).to(device)
    optimizer = _create_optimizer(model, config)
    scheduler = None
    if config["training"].get("scheduler") == "cosine":
        scheduler = CosineAnnealingLR(
            optimizer, T_max=config["training"]["epochs"]
        )

    label_smoothing = config["training"].get("label_smoothing", 0.0)
    criterion = nn.CrossEntropyLoss(label_smoothing=label_smoothing)

    use_amp = config["training"].get("mixed_precision", False) and device.type == "cuda"
    scaler = torch.cuda.amp.GradScaler() if use_amp else None

    run_dir = get_run_dir(config)
    registry_dir = get_registry_dir(config)
    monitor = config["checkpointing"]["monitor"]
    mode = config["checkpointing"].get("mode", "max")
    patience = config["training"].get("early_stopping_patience", 7)

    best_score = float("-inf") if mode == "max" else float("inf")
    epochs_without_improvement = 0
    history: list[dict] = []

    print(f"Training {config['experiment']['name']} for {config['training']['epochs']} epochs")

    for epoch in range(1, config["training"]["epochs"] + 1):
        train_metrics = train_one_epoch(
            model,
            loaders["train"],
            criterion,
            optimizer,
            device,
            class_names,
            scaler,
        )
        val_metrics = evaluate_model(
            model,
            loaders["val"],
            criterion,
            device,
            class_names,
        )

        if scheduler is not None:
            scheduler.step()

        epoch_record = {
            "epoch": epoch,
            "train_loss": train_metrics["loss"],
            "train_accuracy": train_metrics["accuracy"],
            "train_macro_f1": train_metrics["macro_f1"],
            "val_loss": val_metrics["loss"],
            "val_accuracy": val_metrics["accuracy"],
            "val_macro_f1": val_metrics["macro_f1"],
            "learning_rate": optimizer.param_groups[0]["lr"],
        }
        history.append(epoch_record)

        print(
            f"Epoch {epoch:02d} | "
            f"train loss {train_metrics['loss']:.4f} acc {train_metrics['accuracy']:.4f} | "
            f"val loss {val_metrics['loss']:.4f} acc {val_metrics['accuracy']:.4f} "
            f"macro_f1 {val_metrics['macro_f1']:.4f}"
        )

        metric_key = monitor.replace("val_", "") if monitor.startswith("val_") else monitor
        current_score = val_metrics[metric_key]

        improved = (
            current_score > best_score if mode == "max" else current_score < best_score
        )

        if improved:
            best_score = current_score
            epochs_without_improvement = 0

            checkpoint = {
                "epoch": epoch,
                "model_state_dict": model.state_dict(),
                "optimizer_state_dict": optimizer.state_dict(),
                "val_metrics": {
                    k: v
                    for k, v in val_metrics.items()
                    if k not in {"classification_report"}
                },
                "config": config,
                "class_names": class_names,
            }
            best_path = run_dir / "best_model.pt"
            torch.save(checkpoint, best_path)

            registry_path = registry_dir / f"{config['experiment']['name']}.pt"
            torch.save(checkpoint, registry_path)
            print(f"  Saved best checkpoint to {best_path}")
        else:
            epochs_without_improvement += 1

        if epochs_without_improvement >= patience:
            print(f"Early stopping after {epoch} epochs (patience={patience})")
            break

    metadata = {
        "experiment_name": config["experiment"]["name"],
        "description": config["experiment"].get("description", ""),
        "config_path": config["_config_path"],
        "trained_at": datetime.now(timezone.utc).isoformat(),
        "device": str(device),
        "best_val_score": best_score,
        "monitor": monitor,
        "class_names": class_names,
        "history": history,
        "dataset_path": str(dataset_path),
    }

    with (run_dir / "training_history.json").open("w", encoding="utf-8") as f:
        json.dump(history, f, indent=2)

    with (run_dir / "metadata.json").open("w", encoding="utf-8") as f:
        json.dump(metadata, f, indent=2)

    with (registry_dir / f"{config['experiment']['name']}_metadata.json").open(
        "w", encoding="utf-8"
    ) as f:
        json.dump(metadata, f, indent=2)

    print(f"Training complete. Artifacts saved to {run_dir}")
    return run_dir


def main() -> None:
    parser = argparse.ArgumentParser(description="Train BinBuddy waste classifier")
    parser.add_argument(
        "--config",
        default="configs/trashnet_efficientnet_b0.yaml",
        help="Path to training config (relative to ml/)",
    )
    parser.add_argument(
        "--download",
        action="store_true",
        help="Download TrashNet before training",
    )
    args = parser.parse_args()
    train(args.config, download=args.download)


if __name__ == "__main__":
    main()
