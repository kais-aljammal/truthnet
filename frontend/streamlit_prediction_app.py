"""Streamlit tabular ML — upload CSV, train, predict."""
import pandas as pd
import plotly.express as px
import streamlit as st
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import accuracy_score
from sklearn.model_selection import train_test_split

st.set_page_config(page_title="Prediction Model", layout="wide")
st.title("📊 Prediction Model")

uploaded = st.file_uploader("Upload CSV", type="csv")
if uploaded:
    df = pd.read_csv(uploaded)
    st.dataframe(df.head())
    target = st.selectbox("Target column", df.columns)

    if st.button("Train model"):
        X = df.drop(columns=[target]).select_dtypes(include="number")
        if X.empty:
            st.error("No numeric feature columns found.")
            st.stop()
        y = df[target]
        X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
        model = RandomForestClassifier(n_estimators=100, random_state=42)
        model.fit(X_train, y_train)
        acc = accuracy_score(y_test, model.predict(X_test))
        st.success(f"Test accuracy: {acc:.2%}")

        imp = pd.Series(model.feature_importances_, index=X.columns).sort_values(ascending=False)
        st.plotly_chart(px.bar(imp, title="Feature importance"))
