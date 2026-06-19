"""Model factory for waste classification."""

from __future__ import annotations

from typing import Any

import torch.nn as nn
from torchvision import models


SUPPORTED_ARCHITECTURES = {
    "efficientnet_b0",
    "resnet18",
    "mobilenet_v3_small",
}


def create_model(config: dict[str, Any]) -> nn.Module:
    architecture = config["model"]["architecture"]
    num_classes = config["model"]["num_classes"]
    pretrained = config["model"].get("pretrained", True)
    dropout = config["model"].get("dropout", 0.0)

    if architecture not in SUPPORTED_ARCHITECTURES:
        raise ValueError(
            f"Unsupported architecture '{architecture}'. "
            f"Choose from: {sorted(SUPPORTED_ARCHITECTURES)}"
        )

    weights = "DEFAULT" if pretrained else None

    if architecture == "efficientnet_b0":
        model = models.efficientnet_b0(weights=weights)
        in_features = model.classifier[1].in_features
        model.classifier = nn.Sequential(
            nn.Dropout(p=dropout, inplace=True),
            nn.Linear(in_features, num_classes),
        )
    elif architecture == "resnet18":
        model = models.resnet18(weights=weights)
        in_features = model.fc.in_features
        model.fc = nn.Sequential(
            nn.Dropout(p=dropout),
            nn.Linear(in_features, num_classes),
        )
    elif architecture == "mobilenet_v3_small":
        model = models.mobilenet_v3_small(weights=weights)
        in_features = model.classifier[3].in_features
        model.classifier[3] = nn.Linear(in_features, num_classes)

    return model
