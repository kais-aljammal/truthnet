"""Streamlit + image upload + HF classifier."""
import sys
from pathlib import Path

import streamlit as st

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT))

from models.image_classifier import classify_image

st.set_page_config(page_title="Image AI", layout="wide")
st.title("🖼️ Image Classifier")

uploaded = st.file_uploader("Upload an image", type=["jpg", "jpeg", "png"])
if uploaded:
    st.image(uploaded, width=400)
    path = ROOT / "data" / "_upload.jpg"
    path.parent.mkdir(exist_ok=True)
    path.write_bytes(uploaded.getvalue())

    if st.button("Classify"):
        with st.spinner("Running model (first run downloads weights)..."):
            results = classify_image(path)
            for r in results:
                st.progress(min(r["score"], 1.0), text=f"{r['label']}: {r['score']:.1%}")
