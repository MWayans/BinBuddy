"""Stratified train/validation/test split generation."""

from __future__ import annotations

import json
from dataclasses import dataclass
from pathlib import Path
from typing import Any

import numpy as np

from ecoscan_ml.config import resolve_path


@dataclass
class SplitManifest:
    train: list[dict[str, Any]]
    val: list[dict[str, Any]]
    test: list[dict[str, Any]]
    classes: list[str]
    seed: int

    def to_dict(self) -> dict[str, Any]:
        return {
            "seed": self.seed,
            "classes": self.classes,
            "counts": {
                "train": len(self.train),
                "val": len(self.val),
                "test": len(self.test),
            },
            "train": self.train,
            "val": self.val,
            "test": self.test,
        }

    def save(self, path: Path) -> None:
        path.parent.mkdir(parents=True, exist_ok=True)
        with path.open("w", encoding="utf-8") as f:
            json.dump(self.to_dict(), f, indent=2)

    @classmethod
    def load(cls, path: Path) -> SplitManifest:
        with path.open("r", encoding="utf-8") as f:
            data = json.load(f)
        return cls(
            train=data["train"],
            val=data["val"],
            test=data["test"],
            classes=data["classes"],
            seed=data["seed"],
        )


def _collect_samples(dataset_dir: Path, classes: list[str]) -> list[dict[str, Any]]:
    samples: list[dict[str, Any]] = []
    for label_idx, class_name in enumerate(classes):
        class_dir = dataset_dir / class_name
        if not class_dir.is_dir():
            raise FileNotFoundError(f"Missing class directory: {class_dir}")

        for image_path in sorted(class_dir.iterdir()):
            if image_path.suffix.lower() not in {".jpg", ".jpeg", ".png"}:
                continue
            samples.append(
                {
                    "path": str(image_path.resolve()),
                    "label": label_idx,
                    "class_name": class_name,
                }
            )
    return samples


def create_stratified_split(
    dataset_dir: Path,
    classes: list[str],
    train_ratio: float,
    val_ratio: float,
    test_ratio: float,
    seed: int,
) -> SplitManifest:
    if abs(train_ratio + val_ratio + test_ratio - 1.0) > 1e-6:
        raise ValueError("Split ratios must sum to 1.0")

    rng = np.random.default_rng(seed)
    samples = _collect_samples(dataset_dir, classes)

    train_samples: list[dict[str, Any]] = []
    val_samples: list[dict[str, Any]] = []
    test_samples: list[dict[str, Any]] = []

    for class_name in classes:
        class_samples = [s for s in samples if s["class_name"] == class_name]
        rng.shuffle(class_samples)

        n = len(class_samples)
        n_train = int(n * train_ratio)
        n_val = int(n * val_ratio)
        n_test = n - n_train - n_val

        train_samples.extend(class_samples[:n_train])
        val_samples.extend(class_samples[n_train : n_train + n_val])
        test_samples.extend(class_samples[n_train + n_val :])

        if n_test <= 0:
            raise ValueError(
                f"Not enough samples in class '{class_name}' for requested split"
            )

    rng.shuffle(train_samples)
    rng.shuffle(val_samples)
    rng.shuffle(test_samples)

    return SplitManifest(
        train=train_samples,
        val=val_samples,
        test=test_samples,
        classes=classes,
        seed=seed,
    )


def get_or_create_split_manifest(
    config: dict[str, Any],
    splits_path: str | Path | None = None,
) -> SplitManifest:
    dataset_path = resolve_path(config["dataset"]["path"])
    classes = config["dataset"]["classes"]
    seed = config["experiment"]["seed"]
    split_cfg = config["dataset"]["split"]

    if splits_path is None:
        splits_path = resolve_path(
            f"data/splits/{config['experiment']['name']}.json"
        )
    else:
        splits_path = resolve_path(splits_path)

    if splits_path.exists():
        return SplitManifest.load(splits_path)

    manifest = create_stratified_split(
        dataset_dir=dataset_path,
        classes=classes,
        train_ratio=split_cfg["train"],
        val_ratio=split_cfg["val"],
        test_ratio=split_cfg["test"],
        seed=seed,
    )
    manifest.save(splits_path)
    print(f"Saved split manifest to {splits_path}")
    return manifest
