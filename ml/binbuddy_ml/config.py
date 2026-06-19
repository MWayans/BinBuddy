"""Configuration loading and path resolution."""

from __future__ import annotations

import os
from pathlib import Path
from typing import Any

import yaml

ML_ROOT = Path(__file__).resolve().parent.parent


def resolve_path(path: str | Path, base: Path | None = None) -> Path:
    """Resolve a path relative to ml/ or DATA_ROOT."""
    path = Path(path)
    if path.is_absolute():
        return path

    data_root = os.environ.get("DATA_ROOT")
    if data_root and str(path).startswith("data/"):
        return Path(data_root) / Path(path).relative_to("data")

    root = base or ML_ROOT
    return root / path


def load_config(config_path: str | Path) -> dict[str, Any]:
    config_path = Path(config_path)
    if not config_path.is_absolute():
        config_path = ML_ROOT / config_path

    with config_path.open("r", encoding="utf-8") as f:
        config = yaml.safe_load(f)

    config["_config_path"] = str(config_path)
    config["_ml_root"] = str(ML_ROOT)
    return config


def get_run_dir(config: dict[str, Any]) -> Path:
    runs_dir = resolve_path(config["output"]["runs_dir"])
    run_dir = runs_dir / config["experiment"]["name"]
    run_dir.mkdir(parents=True, exist_ok=True)
    return run_dir


def get_registry_dir(config: dict[str, Any]) -> Path:
    registry_dir = resolve_path(config["output"]["registry_dir"])
    registry_dir.mkdir(parents=True, exist_ok=True)
    return registry_dir
