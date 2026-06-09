FROM python:3.11-slim

WORKDIR /app

RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential libpq-dev \
    && rm -rf /var/lib/apt/lists/*

COPY requirements-prod.txt .
RUN pip install --no-cache-dir -r requirements-prod.txt

COPY backend ./backend
COPY frontend ./frontend
COPY scripts ./scripts

ENV TRUTHNET_ENV=production
ENV PYTHONUNBUFFERED=1
ENV PORT=8000

EXPOSE 8000

CMD uvicorn backend.main:app --host 0.0.0.0 --port ${PORT:-8000}
