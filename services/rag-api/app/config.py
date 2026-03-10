"""Configuration for RAG API."""

from typing import Optional

from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    """Application settings."""

    # API Settings
    api_title: str = "RAG API"
    api_version: str = "0.1.0"
    api_description: str = "Production-ready RAG API with document ingestion and search"

    # Pipeline Settings
    vector_db_path: str = "./vector_db"
    # Backwards-compatible default collection (portfolio corpus).
    collection_name: str = "documents"
    # Separate collection for podcasts corpus.
    podcasts_collection_name: str = "podcasts"
    metadata_db_url: str = "sqlite+aiosqlite:///./metadata.db"
    chunk_max_tokens: int = 512
    chunk_overlap_tokens: int = 50
    # Tune chunking specifically for podcasts (defaults chosen for long transcripts).
    # Override via PODCASTS_CHUNK_MAX_TOKENS / PODCASTS_CHUNK_OVERLAP_TOKENS.
    podcasts_chunk_max_tokens: int = 1000
    podcasts_chunk_overlap_tokens: int = 120

    # Embedding Settings
    # Optional so the app can import and basic endpoints/tests can run without a key.
    # In production, set OPENAI_API_KEY to enable ingestion + chat.
    openai_api_key: Optional[str] = None
    embedding_model: str = "text-embedding-3-small"

    # LLM Settings
    default_chat_model: str = "gpt-4o-mini"
    default_system_prompt: str = (
        "You are an assistant for gundy.io. Your job is to answer questions about Dan Gunderson’s "
        "work history, projects, and experience.\n\n"
        "Rules:\n"
        "- Use ONLY the provided context from the knowledge base/documents.\n"
        "- If the context does not contain the answer, say you don’t know and suggest what to ask instead.\n"
        "- Do not invent details, timelines, metrics, employers, titles, or outcomes.\n"
        "- Be concise and specific.\n"
    )

    # CORS Settings
    cors_origins: list[str] = [
        "http://localhost:3000",
        "http://localhost:8000",
        "https://gundy.io",
        "https://www.gundy.io",
    ]
    cors_allow_credentials: bool = True
    cors_allow_methods: list[str] = ["*"]
    cors_allow_headers: list[str] = ["*"]

    # Admin / Observability
    admin_api_key: Optional[str] = None

    class Config:
        """Pydantic config."""

        env_file = (".env", ".env.local")
        env_file_encoding = "utf-8"
        extra = "ignore"


settings = Settings()
