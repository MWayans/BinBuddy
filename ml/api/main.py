""" from fastapi import FastAPI, File, UploadFile
from fastapi.middleware.cors import CORSMiddleware
import sys, os

sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))
from ecoscan_ml.inference.classifier import EfficientNetClassifier

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
import base64
import json

# Make the ml/ package importable
sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))

from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from PIL import Image
import io

app = FastAPI(title="BinBuddy CNN Service")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["POST", "GET"],
    allow_headers=["*"],
)

# ── Load model once at startup ──────────────────────────────────────────────
MODEL_PATH = os.environ.get(
    "CV_CHECKPOINT_PATH",
    os.path.join(os.path.dirname(__file__), "..", "runs",
                 "trashnet_efficientnet_b0_v1", "best_model.pt")
)
CONFIG_PATH = os.environ.get(
    "CV_CONFIG_PATH",
    os.path.join(os.path.dirname(__file__), "..",
                 "configs", "trashnet_efficientnet_b0.yaml")
)

classifier = None

@app.on_event("startup")
def load_model():
    global classifier
    # Import here so startup error is obvious in Railway logs
    from ecoscan_ml.inference.classifier import EfficientNetClassifier
    classifier = EfficientNetClassifier(
        checkpoint_path=MODEL_PATH,
        config_path=CONFIG_PATH,
    )
    print(f"✅ Model loaded from {MODEL_PATH}")


# ── Health check (mirrors your /api/health) ─────────────────────────────────
@app.get("/health")
def health():
    return {
        "status": "ok",
        "model": "efficientnet_b0",
        "checkpoint": MODEL_PATH,
    }


# ── Classification endpoint ─────────────────────────────────────────────────
@app.post("/classify")
async def classify(image: UploadFile = File(...)):
    """
    Accepts multipart/form-data with field name `image`
    (matches what your route.ts already sends).
    Returns the same JSON shape your app expects:
    { trashnet_class, category, confidence, model, alternatives }
    """
    if classifier is None:
        raise HTTPException(status_code=503, detail="Model not loaded")

    try:
        image_bytes = await image.read()
        pil_image = Image.open(io.BytesIO(image_bytes)).convert("RGB")
        result = classifier.predict(pil_image)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))