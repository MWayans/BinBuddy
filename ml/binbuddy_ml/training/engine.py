"""Training and evaluation loops."""

from __future__ import annotations

from typing import Any

import torch
import torch.nn as nn
from torch.utils.data import DataLoader
from tqdm import tqdm

from ecoscan_ml.training.metrics import compute_metrics


def _run_epoch(
    model: nn.Module,
    loader: DataLoader,
    criterion: nn.Module,
    optimizer: torch.optim.Optimizer | None,
    device: torch.device,
    scaler: torch.cuda.amp.GradScaler | None,
    train: bool,
) -> tuple[float, list[int], list[int]]:
    if train:
        model.train()
    else:
        model.eval()

    total_loss = 0.0
    all_labels: list[int] = []
    all_preds: list[int] = []

    context = torch.enable_grad() if train else torch.no_grad()

    with context:
        for images, labels in tqdm(loader, leave=False):
            images = images.to(device, non_blocking=True)
            labels = labels.to(device, non_blocking=True)

            if train and scaler is not None:
                with torch.cuda.amp.autocast():
                    outputs = model(images)
                    loss = criterion(outputs, labels)
                optimizer.zero_grad(set_to_none=True)  # type: ignore[union-attr]
                scaler.scale(loss).backward()
                scaler.step(optimizer)  # type: ignore[arg-type]
                scaler.update()
            else:
                outputs = model(images)
                loss = criterion(outputs, labels)
                if train and optimizer is not None:
                    optimizer.zero_grad(set_to_none=True)
                    loss.backward()
                    optimizer.step()

            total_loss += loss.item() * images.size(0)
            preds = outputs.argmax(dim=1)
            all_labels.extend(labels.cpu().tolist())
            all_preds.extend(preds.cpu().tolist())

    avg_loss = total_loss / len(loader.dataset)
    return avg_loss, all_labels, all_preds


def train_one_epoch(
    model: nn.Module,
    loader: DataLoader,
    criterion: nn.Module,
    optimizer: torch.optim.Optimizer,
    device: torch.device,
    class_names: list[str],
    scaler: torch.cuda.amp.GradScaler | None = None,
) -> dict[str, Any]:
    loss, labels, preds = _run_epoch(
        model, loader, criterion, optimizer, device, scaler, train=True
    )
    metrics = compute_metrics(labels, preds, class_names)
    return {"loss": loss, **metrics}


def evaluate_model(
    model: nn.Module,
    loader: DataLoader,
    criterion: nn.Module,
    device: torch.device,
    class_names: list[str],
) -> dict[str, Any]:
    loss, labels, preds = _run_epoch(
        model, loader, criterion, None, device, None, train=False
    )
    metrics = compute_metrics(labels, preds, class_names)
    return {"loss": loss, **metrics}
