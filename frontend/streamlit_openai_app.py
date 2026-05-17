"""Quick Streamlit + OpenAI — copy and customize on hackathon day."""
import json
import os

import openai
import streamlit as st
from dotenv import load_dotenv

load_dotenv()

st.set_page_config(page_title="Hackathon App", layout="wide", page_icon="🚀")
st.title("🤖 Hackathon Project")

client = openai.OpenAI(api_key=os.getenv("OPENAI_API_KEY"))
MODEL = os.getenv("OPENAI_MODEL", "gpt-4o")

SYSTEM_PROMPT = """You are a helpful assistant.
Return valid JSON only with keys: summary, urgency (Low/Medium/High), action."""

# Pre-baked demo inputs — fill these in after you pick your idea
DEMO_INPUTS = {
    "Demo 1 (safe)": "Replace with a symptom or question that always works.",
    "Demo 2 (impact)": "Replace with a second strong example for judges.",
}

col1, col2 = st.columns([2, 1])
with col2:
    st.caption("Quick demos")
    for label, text in DEMO_INPUTS.items():
        if st.button(label, use_container_width=True):
            st.session_state.user_input = text
            st.rerun()
with col1:
    user_input = st.text_area(
        "Input",
        height=120,
        placeholder="Describe the problem...",
        key="user_input",
    )

if st.button("Run AI", type="primary"):
    if not user_input.strip():
        st.warning("Enter some text first.")
    else:
        with st.spinner("Processing..."):
            try:
                response = client.chat.completions.create(
                    model=MODEL,
                    messages=[
                        {"role": "system", "content": SYSTEM_PROMPT},
                        {"role": "user", "content": user_input},
                    ],
                    response_format={"type": "json_object"},
                )
                raw = response.choices[0].message.content
                data = json.loads(raw)
                c1, c2, c3 = st.columns(3)
                c1.metric("Summary", data.get("summary", "—")[:80])
                urgency = data.get("urgency", "—")
                c2.metric("Urgency", urgency)
                c3.metric("Action", data.get("action", "—")[:40])
                st.json(data)
            except Exception as e:
                st.error(f"API error: {e}")
                st.info("Check .env, WiFi, and API credits. Use backup screenshots if needed.")
