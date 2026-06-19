"""Image transforms for training and evaluation."""

from __future__ import annotations

from typing import Any

from torchvision import transforms


def build_transforms(config: dict[str, Any], split: str) -> transforms.Compose:
    image_size = config["dataset"]["image_size"]
    aug = config.get("augmentation", {})

    normalize = transforms.Normalize(
        mean=[0.485, 0.456, 0.406],
        std=[0.229, 0.224, 0.225],
    )

    if split == "train":
        train_aug = aug.get("train", {})
        transform_list: list[Any] = []

        if train_aug.get("random_resized_crop", True):
            transform_list.append(
                transforms.RandomResizedCrop(image_size, scale=(0.8, 1.0))
            )
        else:
            transform_list.extend(
                [
                    transforms.Resize(256),
                    transforms.CenterCrop(image_size),
                ]
            )

        if train_aug.get("horizontal_flip", True):
            transform_list.append(transforms.RandomHorizontalFlip())

        rotation = train_aug.get("rotation_degrees", 0)
        if rotation:
            transform_list.append(transforms.RandomRotation(rotation))

        jitter = train_aug.get("color_jitter")
        if jitter:
            transform_list.append(
                transforms.ColorJitter(
                    brightness=jitter.get("brightness", 0),
                    contrast=jitter.get("contrast", 0),
                    saturation=jitter.get("saturation", 0),
                    hue=jitter.get("hue", 0),
                )
            )

        transform_list.extend(
            [
                transforms.ToTensor(),
                normalize,
            ]
        )
        return transforms.Compose(transform_list)

    val_aug = aug.get("val", {})
    resize = val_aug.get("resize", 256)
    crop = val_aug.get("center_crop", image_size)

    return transforms.Compose(
        [
            transforms.Resize(resize),
            transforms.CenterCrop(crop),
            transforms.ToTensor(),
            normalize,
        ]
    )
