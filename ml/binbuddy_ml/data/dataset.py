"""PyTorch dataset and dataloader factories."""

from __future__ import annotations

from pathlib import Path
from typing import Any

from PIL import Image
from torch.utils.data import DataLoader, Dataset

from binbuddy_ml.data.splits import SplitManifest
from binbuddy_ml.data.transforms import build_transforms


class WasteImageDataset(Dataset):
    def __init__(
        self,
        samples: list[dict[str, Any]],
        transform,
    ) -> None:
        self.samples = samples
        self.transform = transform

    def __len__(self) -> int:
        return len(self.samples)

    def __getitem__(self, index: int):
        sample = self.samples[index]
        image = Image.open(sample["path"]).convert("RGB")
        if self.transform is not None:
            image = self.transform(image)
        return image, int(sample["label"])


def create_dataloaders(
    config: dict[str, Any],
    manifest: SplitManifest,
) -> dict[str, DataLoader]:
    batch_size = config["training"]["batch_size"]
    num_workers = config["dataset"].get("num_workers", 2)

    loaders = {}
    for split_name, samples in [
        ("train", manifest.train),
        ("val", manifest.val),
        ("test", manifest.test),
    ]:
        dataset = WasteImageDataset(
            samples=samples,
            transform=build_transforms(config, split_name),
        )
        loaders[split_name] = DataLoader(
            dataset,
            batch_size=batch_size,
            shuffle=split_name == "train",
            num_workers=num_workers,
            pin_memory=True,
        )

    return loaders


def validate_samples(manifest: SplitManifest) -> None:
    """Detect missing or corrupt image paths before training."""
    corrupt: list[str] = []
    for split_name in ("train", "val", "test"):
        samples = getattr(manifest, split_name)
        for sample in samples:
            path = Path(sample["path"])
            if not path.exists():
                corrupt.append(f"[missing] {path}")
                continue
            try:
                with Image.open(path) as img:
                    img.verify()
            except Exception as exc:
                corrupt.append(f"[corrupt] {path}: {exc}")

    if corrupt:
        details = "\n".join(corrupt[:20])
        raise ValueError(
            f"Found {len(corrupt)} corrupt or missing images.\n{details}"
        )
