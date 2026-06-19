"""CLI for single-image waste classification."""

from __future__ import annotations

import argparse
import base64
import sys
from pathlib import Path

from binbuddy_ml.inference.classifier import (
    classify_image_bytes,
    classify_image_file,
    result_to_json,
)


def main() -> None:
    parser = argparse.ArgumentParser(description="Classify a waste image with BinBuddy CNN")
    parser.add_argument("--image", type=str, help="Path to image file")
    parser.add_argument(
        "--stdin-base64",
        action="store_true",
        help="Read base64-encoded image bytes from stdin",
    )
    parser.add_argument(
        "--config",
        default="configs/trashnet_efficientnet_b0.yaml",
        help="Training config path (relative to ml/)",
    )
    parser.add_argument(
        "--checkpoint",
        default="runs/trashnet_efficientnet_b0_v1/best_model.pt",
        help="Model checkpoint path (relative to ml/)",
    )
    args = parser.parse_args()

    try:
        if args.stdin_base64:
            encoded = sys.stdin.read().strip()
            image_bytes = base64.b64decode(encoded)
            result = classify_image_bytes(
                image_bytes,
                config_path=args.config,
                checkpoint_path=args.checkpoint,
            )
        elif args.image:
            result = classify_image_file(
                Path(args.image),
                config_path=args.config,
                checkpoint_path=args.checkpoint,
            )
        else:
            parser.error("Provide --image or --stdin-base64")
    except Exception as exc:
        print(result_to_json({"error": str(exc)}), file=sys.stdout)
        sys.exit(1)

    print(result_to_json(result))


if __name__ == "__main__":
    main()
