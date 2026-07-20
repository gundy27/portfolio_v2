# Build context must be the repo root, not this directory, because the
# gundy-ai-* dependencies below are path deps into vendor/ai-utils (a sibling
# two levels up):
#
#   docker build -f services/rag-api/Dockerfile -t rag-api .
#
# vector_db/ and metadata.db are intentionally NOT baked in here. At runtime
# they're restored from GCS_DATA_BUCKET (see app/gcs_sync.py) if that env var
# is set, or start empty otherwise.

FROM python:3.11-slim

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    POETRY_VIRTUALENVS_CREATE=false

RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

RUN pip install --no-cache-dir poetry

WORKDIR /app
COPY vendor/ai-utils ./vendor/ai-utils
COPY services/rag-api ./services/rag-api
WORKDIR /app/services/rag-api

RUN poetry install --only main --no-interaction --no-ansi --no-root

# Cloud Run sets $PORT and expects the container to listen on it.
EXPOSE 8080
CMD ["sh", "-c", "uvicorn app.main:app --host 0.0.0.0 --port ${PORT:-8080}"]
