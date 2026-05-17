"""Hugging Face image classification — no API key for small local runs."""
from pathlib import Path

from PIL import Image
from transformers import pipeline

_classifier = None


def get_classifier():
    global _classifier
    if _classifier is None:
        _classifier = pipeline(
            "image-classification",
            model="google/vit-base-patch16-224",
        )
    return _classifier


def classify_image(image_path: str | Path, top_k: int = 5) -> list[dict]:
    image = Image.open(image_path).convert("RGB")
    results = get_classifier()(image)
    return sorted(results, key=lambda x: x["score"], reverse=True)[:top_k]
