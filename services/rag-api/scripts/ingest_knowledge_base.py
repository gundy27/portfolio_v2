import argparse
import asyncio
import base64
import json
import re
import os
from pathlib import Path
from typing import Any, Dict, List, Tuple


FRONTMATTER_BLOCK_RE = re.compile(
    r"^---\n(?P<frontmatter>.*?)\n---\n(?P<body>.*?)(?=^---\n|\Z)",
    re.DOTALL | re.MULTILINE,
)


def _slugify(value: str) -> str:
    value = value.strip().lower()
    value = re.sub(r"[^a-z0-9]+", "-", value)
    return value.strip("-") or "kb"


def parse_sections(text: str) -> List[Tuple[Dict[str, Any], str]]:
    try:
        import yaml  # type: ignore
    except Exception as e:  # pragma: no cover
        raise RuntimeError("PyYAML is required to parse frontmatter.") from e

    sections: List[Tuple[Dict[str, Any], str]] = []
    for m in FRONTMATTER_BLOCK_RE.finditer(text):
        frontmatter_raw = m.group("frontmatter").strip()
        body = m.group("body").strip()
        if not frontmatter_raw or not body:
            continue

        metadata = yaml.safe_load(frontmatter_raw) or {}
        if not isinstance(metadata, dict):
            raise ValueError("Frontmatter must be a YAML mapping/object.")

        if not metadata.get("reference"):
            raise ValueError("Each section must include a `reference` in frontmatter.")

        sections.append((metadata, body))

    if not sections:
        raise ValueError("No `--- frontmatter ---` sections found to ingest.")

    return sections


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
            # e.g. tags: ["a","b"] -> "a,b"
            out[k] = ",".join(str(x) for x in v)
            continue
        if isinstance(v, dict):
            out[k] = json.dumps(v, ensure_ascii=False)
            continue

        # Fallback: stringify unknown types
        out[k] = str(v)

    return out


async def run(path: Path, user_id: str, dry_run: bool) -> None:
    from app.pipeline import RAGPipeline
    from app.config import settings

    raw = path.read_text(encoding="utf-8")
    sections = parse_sections(raw)

    print(
        "ingest_config:",
        json.dumps(
            {
                "vector_db_path": settings.vector_db_path,
                "collection_name": settings.collection_name,
                "metadata_db_url": settings.metadata_db_url,
                "embedding_model": settings.embedding_model,
                "chunk_max_tokens": settings.chunk_max_tokens,
                "chunk_overlap_tokens": settings.chunk_overlap_tokens,
            },
            ensure_ascii=False,
        ),
    )

    pipeline = RAGPipeline(
        vector_db_path=settings.vector_db_path,
        collection_name=settings.collection_name,
        metadata_db_url=settings.metadata_db_url,
        openai_api_key=settings.openai_api_key or os.getenv("OPENAI_API_KEY"),
        embedding_model=settings.embedding_model,
        chunk_max_tokens=settings.chunk_max_tokens,
        chunk_overlap_tokens=settings.chunk_overlap_tokens,
    )
    await pipeline.metadata_store.initialize()

    # Fail fast if embeddings are disabled.
    if (not dry_run) and pipeline.embeddings.__class__.__name__ == "_DisabledEmbeddingProvider":
        raise RuntimeError(
            "Embeddings are disabled. Set OPENAI_API_KEY before ingesting the knowledge base."
        )

    for idx, (metadata, body) in enumerate(sections):
        reference = str(metadata.get("reference"))
        file_name = f"kb_{idx:03d}_{_slugify(reference)[:60]}.md"

        doc_text = body.strip() + "\n"
        content_b64 = base64.b64encode(doc_text.encode("utf-8")).decode("utf-8")

        enriched_metadata = {
            "source": "knowledge-base",
            **metadata,
        }
        enriched_metadata = coerce_chroma_metadata(enriched_metadata)

        if dry_run:
            print(f"[dry-run] would ingest: {file_name} (reference={reference})")
            continue

        await pipeline.ingest_document(
            file_name=file_name,
            file_content_base64=content_b64,
            user_id=user_id,
            metadata=enriched_metadata,
        )

        print(f"ingested: {file_name} (reference={reference})")


def main() -> None:
    parser = argparse.ArgumentParser(description="Ingest knowledge base markdown into RAG pipeline.")
    parser.add_argument(
        "--path",
        required=True,
        help="Path to knowledge-base markdown (with YAML frontmatter sections).",
    )
    parser.add_argument("--user-id", default="gundy_io_public")
    parser.add_argument("--dry-run", action="store_true")
    args = parser.parse_args()

    asyncio.run(run(Path(args.path), user_id=args.user_id, dry_run=args.dry_run))


if __name__ == "__main__":
    main()

