import argparse
import asyncio
import base64
import json
import os
import re
import time
from dataclasses import dataclass
from pathlib import Path
from typing import Any, Dict, Iterable, List, Optional, Tuple


FRONTMATTER_RE = re.compile(r"^---\n(?P<frontmatter>.*?)\n---\n(?P<body>.*)$", re.DOTALL)


def coerce_chroma_metadata(metadata: Dict[str, Any]) -> Dict[str, Any]:
    """ChromaDB metadata values must be scalar: str/int/float/bool."""
    out: Dict[str, Any] = {}
    for k, v in metadata.items():
        if v is None:
            continue
        if isinstance(v, (str, int, float, bool)):
            out[k] = v
            continue
        if isinstance(v, list):
            out[k] = ",".join(str(x) for x in v)
            continue
        if isinstance(v, dict):
            out[k] = json.dumps(v, ensure_ascii=False)
            continue
        out[k] = str(v)
    return out


def parse_frontmatter_md(text: str) -> Tuple[Dict[str, Any], str]:
    try:
        import yaml  # type: ignore
    except Exception as e:  # pragma: no cover
        raise RuntimeError("PyYAML is required to parse transcript frontmatter.") from e

    m = FRONTMATTER_RE.match(text.strip())
    if not m:
        return {}, text
    front = yaml.safe_load(m.group("frontmatter").strip()) or {}
    if not isinstance(front, dict):
        front = {}
    body = m.group("body").strip()
    return front, body


def iter_transcript_files(root: Path) -> Iterable[Path]:
    # Expected structure: episodes/**/transcript.md
    for p in sorted(root.glob("episodes/**/transcript.md")):
        if p.is_file():
            yield p


def build_reference(meta: Dict[str, Any], fallback_slug: str) -> str:
    guest = str(meta.get("guest") or "").strip()
    publish = str(meta.get("publish_date") or "").strip()
    title = str(meta.get("title") or "").strip()

    parts = ["Lenny’s Podcast"]
    if guest:
        parts.append(guest)
    if publish:
        parts.append(publish)
    elif title:
        parts.append(title)
    else:
        parts.append(fallback_slug)
    return " — ".join(parts)


def read_checkpoint(path: Path) -> Dict[str, Any]:
    if not path.exists():
        return {"uploaded": {}}
    try:
        data = json.loads(path.read_text(encoding="utf-8"))
        if isinstance(data, dict):
            return data
    except Exception:
        pass
    return {"uploaded": {}}


def write_checkpoint(path: Path, data: Dict[str, Any]) -> None:
    path.write_text(json.dumps(data, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")


@dataclass(frozen=True)
class UploadConfig:
    api_base_url: str
    admin_key: str
    user_id: str
    corpus: str
    dry_run: bool
    limit: Optional[int]
    checkpoint_path: Path
    concurrency: int
    max_retries: int
    retry_backoff_s: float


async def _upload_one(
    client,
    cfg: UploadConfig,
    transcript_path: Path,
    root: Path,
    checkpoint: Dict[str, Any],
    sem: asyncio.Semaphore,
) -> None:
    rel = str(transcript_path.relative_to(root))
    uploaded = checkpoint.setdefault("uploaded", {})
    if uploaded.get(rel):
        return

    async with sem:
        raw = transcript_path.read_text(encoding="utf-8")
        front, body = parse_frontmatter_md(raw)
        episode_slug = transcript_path.parent.name

        reference = build_reference(front, fallback_slug=episode_slug)
        meta: Dict[str, Any] = {
            "reference": reference,
            "episode_slug": episode_slug,
            "relative_path": rel,
            **front,
        }
        meta = coerce_chroma_metadata(meta)

        if cfg.dry_run:
            uploaded[rel] = {"ok": True, "dry_run": True, "at": time.time()}
            return

        url = f"{cfg.api_base_url.rstrip('/')}/documents/ingest"

        # Use API's expected multipart fields: file, metadata (JSON string), user_id, corpus
        files = {"file": (transcript_path.name, body.encode("utf-8"), "text/markdown")}
        data = {
            "metadata": json.dumps(meta, ensure_ascii=False),
            "user_id": cfg.user_id,
            "corpus": cfg.corpus,
        }
        headers = {"X-Admin-Key": cfg.admin_key}

        last_err: Optional[str] = None
        for attempt in range(1, cfg.max_retries + 1):
            try:
                resp = await client.post(url, files=files, data=data, headers=headers, timeout=120)
                if resp.status_code >= 400:
                    last_err = f"{resp.status_code}: {resp.text[:500]}"
                    raise RuntimeError(last_err)
                uploaded[rel] = {"ok": True, "at": time.time(), "response": resp.json()}
                return
            except Exception as e:
                last_err = str(e)
                if attempt >= cfg.max_retries:
                    uploaded[rel] = {"ok": False, "at": time.time(), "error": last_err}
                    return
                await asyncio.sleep(cfg.retry_backoff_s * attempt)


async def run(cfg: UploadConfig, transcripts_root: Path) -> None:
    try:
        import httpx
    except Exception as e:  # pragma: no cover
        raise RuntimeError(
            "httpx is required to run this script. Install with:\n"
            "  poetry install --with dev\n"
            "or:\n"
            "  pip install httpx\n"
        ) from e

    checkpoint = read_checkpoint(cfg.checkpoint_path)
    sem = asyncio.Semaphore(max(1, cfg.concurrency))

    paths = list(iter_transcript_files(transcripts_root))
    if cfg.limit is not None:
        paths = paths[: cfg.limit]

    async with httpx.AsyncClient() as client:
        tasks = [
            _upload_one(client, cfg, p, transcripts_root, checkpoint, sem)
            for p in paths
        ]
        for fut in asyncio.as_completed(tasks):
            await fut
            # Persist progress frequently so reruns are resumable.
            write_checkpoint(cfg.checkpoint_path, checkpoint)


def main() -> None:
    parser = argparse.ArgumentParser(
        description="Upload Lenny's Podcast transcript markdowns into the RAG API via /documents/ingest."
    )
    parser.add_argument(
        "--transcripts-root",
        required=True,
        help="Path to lennys-podcast-transcripts repository root.",
    )
    parser.add_argument(
        "--api-base-url",
        required=True,
        help="Base URL of deployed RAG API (e.g. https://your-service.onrender.com).",
    )
    parser.add_argument(
        "--admin-key",
        default=os.getenv("RAG_ADMIN_KEY") or "",
        help="Admin key for ingestion (or set RAG_ADMIN_KEY).",
    )
    parser.add_argument("--user-id", default="gundy_io_public")
    parser.add_argument("--corpus", default="podcasts", choices=["portfolio", "podcasts"])
    parser.add_argument("--dry-run", action="store_true")
    parser.add_argument("--limit", type=int, default=None)
    parser.add_argument(
        "--checkpoint",
        default="./.ingest_lennys_checkpoint.json",
        help="Path to a local checkpoint JSON (resumable).",
    )
    parser.add_argument("--concurrency", type=int, default=4)
    parser.add_argument("--max-retries", type=int, default=5)
    parser.add_argument("--retry-backoff-s", type=float, default=1.5)
    args = parser.parse_args()

    if not args.admin_key and not args.dry_run:
        raise SystemExit("Missing --admin-key (or set RAG_ADMIN_KEY).")

    cfg = UploadConfig(
        api_base_url=args.api_base_url,
        admin_key=args.admin_key,
        user_id=args.user_id,
        corpus=args.corpus,
        dry_run=bool(args.dry_run),
        limit=args.limit,
        checkpoint_path=Path(args.checkpoint),
        concurrency=args.concurrency,
        max_retries=args.max_retries,
        retry_backoff_s=args.retry_backoff_s,
    )

    asyncio.run(run(cfg, Path(args.transcripts_root)))


if __name__ == "__main__":
    main()

