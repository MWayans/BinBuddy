""" from fastapi import FastAPI, File, UploadFile
from fastapi.middleware.cors import CORSMiddleware
import sys, os

sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))
from binbuddy_ml.inference.classifier import EfficientNetClassifier

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["POST"],
    allow_headers=["*"],
)

MODEL_PATH = os.environ.get(
    "CV_CHECKPOINT_PATH",
    "runs/trashnet_efficientnet_b0_v1/best_model.pt"
)

classifier = EfficientNetClassifier(checkpoint_path=MODEL_PATH)

@app.get("/health")
def health():
    return {"status": "ok", "model": "efficientnet_b0"}

@app.post("/classify")
async def classify(file: UploadFile = File(...)):
    image_bytes = await file.read()
    result = classifier.predict_from_bytes(image_bytes)
    return {
        "category": result["category"],
        "confidence": result["confidence"]
    } """

import sys
import os
import io

# Fix: point to ml/ so binbuddy_ml is importable
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(title="BinBuddy CNN Service")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["POST", "GET"],
    allow_headers=["*"],
)

MODEL_PATH = os.environ.get(
    "CV_CHECKPOINT_PATH",
    os.path.abspath(os.path.join(os.path.dirname(__file__), "..",
                 "runs", "trashnet_efficientnet_b0_v1", "best_model.pt"))
)
CONFIG_PATH = os.environ.get(
    "CV_CONFIG_PATH",
    os.path.abspath(os.path.join(os.path.dirname(__file__), "..",
                 "configs", "trashnet_efficientnet_b0.yaml"))
)

# Import the function directly — no class wrapper needed
from binbuddy_ml.inference.classifier import classify_image_bytes

@app.get("/health")
def health():
    return {
        "status": "ok",
        "model": "efficientnet_b0",
        "checkpoint": MODEL_PATH,
    }

@app.post("/classify")
async def classify(image: UploadFile = File(...)):
    try:
        image_bytes = await image.read()
        result = classify_image_bytes(
            image_bytes,
            config_path=CONFIG_PATH,
            checkpoint_path=MODEL_PATH,
        )
        return result
    except FileNotFoundError as e:
        raise HTTPException(status_code=503, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))