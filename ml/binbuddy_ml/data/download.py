"""Download and prepare the TrashNet dataset."""

from __future__ import annotations

import shutil
import urllib.request
import zipfile
from pathlib import Path

from ecoscan_ml.config import ML_ROOT, resolve_path

TRASHNET_ARCHIVE_URL = (
    "https://github.com/garythung/trashnet/archive/refs/heads/master.zip"
)
DEFAULT_DATASET_REL = "data/raw/trashnet/dataset-resized"
EXPECTED_CLASSES = ["cardboard", "glass", "metal", "paper", "plastic", "trash"]


def _validate_dataset(dataset_dir: Path) -> dict[str, int]:
    if not dataset_dir.exists():
        raise FileNotFoundError(f"Dataset directory not found: {dataset_dir}")

    counts: dict[str, int] = {}
    for class_name in EXPECTED_CLASSES:
        class_dir = dataset_dir / class_name
        if not class_dir.is_dir():
            raise FileNotFoundError(f"Missing class folder: {class_dir}")

        images = [
            p
            for p in class_dir.iterdir()
            if p.is_file() and p.suffix.lower() in {".jpg", ".jpeg", ".png"}
        ]
        counts[class_name] = len(images)
        if counts[class_name] == 0:
            raise ValueError(f"No images found in {class_dir}")

    return counts


def download_trashnet(
    target_dir: str | Path | None = None,
    force: bool = False,
) -> Path:
    """
    Download TrashNet from GitHub and extract the resized image folders.

    Returns the path to dataset-resized/.
    """
    dataset_dir = resolve_path(target_dir or DEFAULT_DATASET_REL)
    archive_path = dataset_dir.parent / "trashnet-master.zip"
    extract_root = dataset_dir.parent / "trashnet-master"

    if dataset_dir.exists() and not force:
        counts = _validate_dataset(dataset_dir)
        total = sum(counts.values())
        print(f"TrashNet already present at {dataset_dir} ({total} images)")
        return dataset_dir

    dataset_dir.parent.mkdir(parents=True, exist_ok=True)

    if not archive_path.exists() or force:
        print(f"Downloading TrashNet from {TRASHNET_ARCHIVE_URL} ...")
        urllib.request.urlretrieve(TRASHNET_ARCHIVE_URL, archive_path)
        print(f"Saved archive to {archive_path}")

    if extract_root.exists():
        shutil.rmtree(extract_root)

    print("Extracting archive...")
    with zipfile.ZipFile(archive_path, "r") as zf:
        zf.extractall(dataset_dir.parent)

    source_dataset = extract_root / "data" / "dataset-resized"
    resized_zip = extract_root / "data" / "dataset-resized.zip"

    if source_dataset.exists():
        if dataset_dir.exists():
            shutil.rmtree(dataset_dir)
        shutil.move(str(source_dataset), str(dataset_dir))
    elif resized_zip.exists():
        print(f"Extracting {resized_zip.name} ...")
        with zipfile.ZipFile(resized_zip, "r") as zf:
            zf.extractall(extract_root / "data")

        # Zip may extract as dataset-resized/ or flat class folders
        if source_dataset.exists():
            if dataset_dir.exists():
                shutil.rmtree(dataset_dir)
            shutil.move(str(source_dataset), str(dataset_dir))
        else:
            raise FileNotFoundError(
                f"Could not find dataset-resized after extracting {resized_zip}"
            )
    else:
        raise FileNotFoundError(
            f"Expected TrashNet dataset at {source_dataset} or {resized_zip}"
        )

    counts = _validate_dataset(dataset_dir)
    total = sum(counts.values())
    print(f"TrashNet ready: {total} images at {dataset_dir}")
    for class_name, count in counts.items():
        print(f"  {class_name}: {count}")

    return dataset_dir


def main() -> None:
    import argparse

    parser = argparse.ArgumentParser(description="Download TrashNet dataset")
    parser.add_argument(
        "--target",
        default=DEFAULT_DATASET_REL,
        help="Target path relative to ml/ (default: data/raw/trashnet/dataset-resized)",
    )
    parser.add_argument(
        "--force",
        action="store_true",
        help="Re-download even if dataset exists",
    )
    args = parser.parse_args()

    download_trashnet(target_dir=args.target, force=args.force)
    print(f"ML root: {ML_ROOT}")


if __name__ == "__main__":
    main()
