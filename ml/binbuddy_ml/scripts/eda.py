"""Exploratory data analysis for TrashNet."""

from __future__ import annotations

import argparse
import json
from collections import Counter
from pathlib import Path

import matplotlib.pyplot as plt
import pandas as pd
import seaborn as sns
from PIL import Image

from ecoscan_ml.config import load_config, resolve_path
from ecoscan_ml.data.download import download_trashnet
from ecoscan_ml.data.splits import get_or_create_split_manifest


def run_eda(config_path: str, download: bool = False) -> Path:
    config = load_config(config_path)

    if download:
        download_trashnet()

    dataset_path = resolve_path(config["dataset"]["path"])
    manifest = get_or_create_split_manifest(config)
    run_dir = resolve_path(config["output"]["runs_dir"]) / config["experiment"]["name"]
    eda_dir = run_dir / "eda"
    eda_dir.mkdir(parents=True, exist_ok=True)

    all_samples = manifest.train + manifest.val + manifest.test
    records = []
    widths = []
    heights = []

    for sample in all_samples:
        path = Path(sample["path"])
        with Image.open(path) as img:
            w, h = img.size
        widths.append(w)
        heights.append(h)
        records.append(
            {
                "path": str(path),
                "class_name": sample["class_name"],
                "width": w,
                "height": h,
            }
        )

    df = pd.DataFrame(records)

    class_counts = Counter(s["class_name"] for s in all_samples)
    split_counts = {
        "train": Counter(s["class_name"] for s in manifest.train),
        "val": Counter(s["class_name"] for s in manifest.val),
        "test": Counter(s["class_name"] for s in manifest.test),
    }

    summary = {
        "dataset_path": str(dataset_path),
        "total_images": len(all_samples),
        "class_distribution": dict(class_counts),
        "split_distribution": {
            split: dict(counts) for split, counts in split_counts.items()
        },
        "image_width": {
            "min": int(min(widths)),
            "max": int(max(widths)),
            "mean": float(sum(widths) / len(widths)),
        },
        "image_height": {
            "min": int(min(heights)),
            "max": int(max(heights)),
            "mean": float(sum(heights) / len(heights)),
        },
    }

    with (eda_dir / "eda_summary.json").open("w", encoding="utf-8") as f:
        json.dump(summary, f, indent=2)

    # Class distribution plot
    plt.figure(figsize=(8, 5))
    sns.barplot(
        x=list(class_counts.keys()),
        y=list(class_counts.values()),
        hue=list(class_counts.keys()),
        palette="muted",
        legend=False,
    )
    plt.title("TrashNet Class Distribution")
    plt.xlabel("Class")
    plt.ylabel("Count")
    plt.tight_layout()
    plt.savefig(eda_dir / "class_distribution.png", dpi=150)
    plt.close()

    # Split distribution plot
    split_df = []
    for split_name, counts in split_counts.items():
        for class_name, count in counts.items():
            split_df.append(
                {"split": split_name, "class_name": class_name, "count": count}
            )
    split_df = pd.DataFrame(split_df)

    plt.figure(figsize=(9, 5))
    sns.barplot(data=split_df, x="class_name", y="count", hue="split")
    plt.title("TrashNet Split Distribution by Class")
    plt.tight_layout()
    plt.savefig(eda_dir / "split_distribution.png", dpi=150)
    plt.close()

    # Sample image grid
    fig, axes = plt.subplots(2, 3, figsize=(10, 7))
    for ax, class_name in zip(axes.flatten(), config["dataset"]["classes"]):
        sample_path = next(
            Path(s["path"])
            for s in all_samples
            if s["class_name"] == class_name
        )
        img = Image.open(sample_path)
        ax.imshow(img)
        ax.set_title(class_name)
        ax.axis("off")
    plt.suptitle("Sample Images per Class")
    plt.tight_layout()
    plt.savefig(eda_dir / "sample_images.png", dpi=150)
    plt.close()

    print(f"EDA complete. Outputs saved to {eda_dir}")
    print(json.dumps(summary, indent=2))
    return eda_dir


def main() -> None:
    parser = argparse.ArgumentParser(description="Run TrashNet EDA")
    parser.add_argument(
        "--config",
        default="configs/trashnet_efficientnet_b0.yaml",
    )
    parser.add_argument("--download", action="store_true")
    args = parser.parse_args()
    run_eda(args.config, download=args.download)


if __name__ == "__main__":
    main()
