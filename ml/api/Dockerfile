FROM python:3.10-slim

WORKDIR /app

# Copy ML package
COPY ../ecoscan_ml ./ecoscan_ml
COPY ../configs ./configs
COPY api/requirements.txt .

RUN pip install --no-cache-dir -r requirements.txt

# Copy model weights
COPY ../runs/trashnet_efficientnet_b0_v1/best_model.pt \
     ./runs/trashnet_efficientnet_b0_v1/best_model.pt

COPY api/main.py .

EXPOSE 8000

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]