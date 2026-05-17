# Copy-paste prompts for Cursor / Claude on the day

## Full Streamlit feature (Generative / healthcare example)

```
Write a Python Streamlit app that:
- Takes medical symptoms as Turkish text input
- Calls OpenAI gpt-4o with system prompt: triage assistant, return JSON only with keys: summary_tr, urgency (Low/Medium/High), recommended_action_tr, disclaimer
- Shows metrics with color for urgency
- Has two st.button demo inputs with pre-filled safe examples
- Uses python-dotenv for OPENAI_API_KEY
- Handles API errors with st.error
```

## FastAPI + Streamlit split

```
FastAPI endpoint POST /triage accepting {text: str}, calls OpenAI with JSON response_format, returns parsed dict.
Separate Streamlit client that posts to http://localhost:8000/triage and displays results.
Include CORS and /health.
```

## Image track (webcam optional)

```
Streamlit app: file uploader for jpg/png, run Hugging Face pipeline image-classification with google/vit-base-patch16-224, show top 5 labels with progress bars. Cache model with @st.cache_resource.
```

## Data track

```
Streamlit: CSV upload, select target column, train XGBoost classifier on numeric columns only, show accuracy and SHAP or feature importance plotly chart. Handle missing values simply.
```

## Debug prompt

```
This error occurs when I run streamlit: [paste full traceback]
File: [paste relevant 30 lines]
Fix with minimal changes only.
```
