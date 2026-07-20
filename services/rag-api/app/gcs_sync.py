"""Sync the local Chroma vector store and metadata SQLite db to/from a GCS bucket.

Cloud Run scales to zero and wipes local disk on every cold start, so this is
what makes ingested documents and chat logs survive restarts there. No-op
everywhere (sync_down/sync_up become cheap no-ops) if GCS_DATA_BUCKET is unset,
so local dev is unaffected.
"""

from __future__ import annotations

import os
from pathlib import Path

import structlog

logger = structlog.get_logger(__name__)

BUCKET = os.environ.get("GCS_DATA_BUCKET")
SYNC_INTERVAL_SECONDS = int(os.environ.get("GCS_SYNC_INTERVAL_SECONDS", "60"))

_VECTOR_DB_PREFIX = "vector_db/"
_METADATA_DB_BLOB = "metadata/metadata.db"


def _client():
    from google.cloud import storage

    return storage.Client()


def sync_down(vector_db_path: str, metadata_db_path: str) -> None:
    """Best-effort restore of prior state from GCS. Never raises."""
    if not BUCKET:
        return
    try:
        client = _client()
        vdb = Path(vector_db_path)
        vdb.mkdir(parents=True, exist_ok=True)
        n = 0
        for blob in client.list_blobs(BUCKET, prefix=_VECTOR_DB_PREFIX):
            rel = blob.name[len(_VECTOR_DB_PREFIX) :]
            if not rel:
                continue
            dest = vdb / rel
            dest.parent.mkdir(parents=True, exist_ok=True)
            blob.download_to_filename(str(dest))
            n += 1

        meta_blob = client.bucket(BUCKET).blob(_METADATA_DB_BLOB)
        restored_meta = False
        if meta_blob.exists():
            Path(metadata_db_path).parent.mkdir(parents=True, exist_ok=True)
            meta_blob.download_to_filename(metadata_db_path)
            restored_meta = True

        logger.info(
            "gcs_sync_down_complete", vector_db_files=n, metadata_db_restored=restored_meta
        )
    except Exception as e:  # pragma: no cover - best-effort, must not block startup
        logger.error("gcs_sync_down_failed", error=str(e))


def sync_up(vector_db_path: str, metadata_db_path: str) -> None:
    """Best-effort upload of current state to GCS. Never raises."""
    if not BUCKET:
        return
    try:
        client = _client()
        bucket = client.bucket(BUCKET)

        vdb = Path(vector_db_path)
        n = 0
        if vdb.is_dir():
            for f in vdb.rglob("*"):
                if f.is_file():
                    rel = f.relative_to(vdb).as_posix()
                    bucket.blob(f"{_VECTOR_DB_PREFIX}{rel}").upload_from_filename(str(f))
                    n += 1

        if Path(metadata_db_path).is_file():
            bucket.blob(_METADATA_DB_BLOB).upload_from_filename(metadata_db_path)

        logger.info("gcs_sync_up_complete", vector_db_files=n)
    except Exception as e:  # pragma: no cover - best-effort, must not break requests
        logger.error("gcs_sync_up_failed", error=str(e))


def metadata_db_path_from_url(url: str) -> str:
    """Extract the filesystem path from a sqlite(+aiosqlite):/// URL."""
    for prefix in ("sqlite+aiosqlite:///", "sqlite:///"):
        if url.startswith(prefix):
            return url.removeprefix(prefix)
    raise ValueError(f"Unsupported metadata_db_url scheme: {url}")
