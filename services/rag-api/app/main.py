"""RAG API main application."""

import json
import time
from datetime import datetime, timezone
from typing import Any, Dict

import structlog
from fastapi import FastAPI, File, Form, Header, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse, StreamingResponse

from .config import settings
from .models import (
    ChatRequest,
    ChatResponse,
    ChatSettings,
    DocumentIngestResponse,
    HealthResponse,
    SearchRequest,
    SearchResponse,
    SearchResultItem,
    SourceChunk,
)
from .pipeline import RAGPipeline
from .settings_store import SettingsStore

logger = structlog.get_logger(__name__)

# Initialize FastAPI app
app = FastAPI(
    title=settings.api_title,
    version=settings.api_version,
    description=settings.api_description,
    docs_url="/docs",
    redoc_url="/redoc",
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=settings.cors_allow_credentials,
    allow_methods=settings.cors_allow_methods,
    allow_headers=settings.cors_allow_headers,
)

# Global pipeline instance
pipeline: RAGPipeline | None = None
settings_store = SettingsStore(settings.metadata_db_url)


def _assert_admin(x_admin_key: str | None) -> None:
    # If no key is configured, disable admin endpoints.
    if not settings.admin_api_key:
        raise HTTPException(status_code=404, detail="Not found")
    if not x_admin_key or x_admin_key != settings.admin_api_key:
        raise HTTPException(status_code=401, detail="Unauthorized")


async def _ensure_pipeline() -> RAGPipeline:
    """Ensure the global pipeline is initialized.

    Starlette's TestClient doesn't always run lifespan events unless used as a
    context manager. Lazily initializing here keeps basic endpoints working
    in tests and local tooling.
    """

    global pipeline
    if pipeline is not None:
        return pipeline

    logger.info("pipeline_lazy_init_begin")
    import os

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
    logger.info("pipeline_lazy_init_complete")
    return pipeline


@app.on_event("startup")
async def startup_event():
    """Initialize pipeline on startup."""
    logger.info("api_startup_begin")

    try:
        await _ensure_pipeline()

        logger.info("api_startup_complete")
    except Exception as e:
        logger.error("api_startup_failed", error=str(e))
        raise


@app.on_event("shutdown")
async def shutdown_event():
    """Cleanup on shutdown."""
    logger.info("api_shutdown")


# Middleware for request logging
@app.middleware("http")
async def logging_middleware(request, call_next):
    """Log all requests."""
    start_time = time.time()
    method = request.method
    path = request.url.path

    logger.info("request_start", method=method, path=path)

    try:
        response = await call_next(request)
        duration_ms = (time.time() - start_time) * 1000

        logger.info(
            "request_complete",
            method=method,
            path=path,
            status=response.status_code,
            duration_ms=duration_ms,
        )

        return response
    except Exception as e:
        duration_ms = (time.time() - start_time) * 1000

        logger.error(
            "request_error",
            method=method,
            path=path,
            duration_ms=duration_ms,
            error=str(e),
        )

        return JSONResponse(
            status_code=500,
            content={"error": "Internal server error", "detail": str(e)},
        )


@app.get("/")
async def root() -> Dict[str, Any]:
    """API information."""
    return {
        "name": settings.api_title,
        "version": settings.api_version,
        "description": settings.api_description,
        "docs_url": "/docs",
        "health_url": "/health",
    }


@app.get("/health", response_model=HealthResponse)
async def health_check() -> HealthResponse:
    """Health check for all components."""
    if pipeline is None:
        return HealthResponse(
            status="unhealthy",
            components={
                "pipeline": {
                    "healthy": False,
                    "message": "Pipeline not initialized",
                }
            },
            timestamp=datetime.now(timezone.utc).isoformat(),
        )

    try:
        health_data = pipeline.health_check()

        # Convert to response format
        components = {}
        for name, data in health_data.items():
            if name == "status":
                continue

            components[name] = {
                "healthy": data.get("healthy", False),
                "message": data.get("error") or "OK",
                "latency_ms": data.get("latency_ms"),
            }

        return HealthResponse(
            status=health_data.get("status", "unknown"),
            components=components,
            timestamp=datetime.now(timezone.utc).isoformat(),
        )
    except Exception as e:
        logger.error("health_check_failed", error=str(e))
        return HealthResponse(
            status="unhealthy",
            components={"error": {"healthy": False, "message": str(e)}},
            timestamp=datetime.now(timezone.utc).isoformat(),
        )


@app.get("/stats")
async def get_stats() -> Dict[str, Any]:
    """Get pipeline statistics."""
    p = await _ensure_pipeline()

    try:
        return p.get_stats()
    except Exception as e:
        logger.error("get_stats_failed", error=str(e))
        raise HTTPException(status_code=500, detail=str(e)) from e


@app.post("/documents/ingest", response_model=DocumentIngestResponse)
async def ingest_document(
    file: UploadFile = File(...),
    metadata: str = Form(default="{}"),
    user_id: str = Form(default="anonymous"),
) -> DocumentIngestResponse:
    """Ingest a document into the RAG system.

    Processes the document through the complete pipeline:
    1. Extract text from file
    2. Chunk into smaller pieces
    3. Generate embeddings
    4. Store in vector database

    Args:
        file: File to upload (TXT, PDF, DOCX)
        metadata: Optional JSON metadata for the document
        user_id: User identifier (defaults to "anonymous")

    Returns:
        DocumentIngestResponse with processing results
    """
    p = await _ensure_pipeline()

    try:
        # Read file content
        content = await file.read()

        # Encode to base64
        import base64

        content_b64 = base64.b64encode(content).decode("utf-8")

        # Parse metadata
        import json

        try:
            metadata_dict = json.loads(metadata)
        except json.JSONDecodeError:
            metadata_dict = {}

        # Ingest document
        result = await p.ingest_document(
            file.filename or "unknown",
            content_b64,
            user_id=user_id,
            metadata=metadata_dict,
        )

        return DocumentIngestResponse(**result)

    except ValueError as e:
        logger.warning("ingest_validation_error", error=str(e))
        raise HTTPException(status_code=400, detail=str(e)) from e
    except Exception as e:
        logger.error("ingest_error", error=str(e))
        raise HTTPException(status_code=500, detail=str(e)) from e


@app.post("/search", response_model=SearchResponse)
async def search_documents(request: SearchRequest) -> SearchResponse:
    """Search for similar documents.

    Uses semantic similarity to find relevant document chunks.

    Args:
        request: Search request with query and parameters

    Returns:
        SearchResponse with matching results
    """
    p = await _ensure_pipeline()

    start_time = time.time()

    try:
        # Perform search
        results = p.search(
            query=request.query,
            top_k=request.top_k,
            filter=request.filter,
            include_text=request.include_text,
        )

        processing_time_ms = (time.time() - start_time) * 1000

        # Convert to response format
        result_items = [
            SearchResultItem(
                chunk_id=result.id,
                document_id=result.metadata.get("document_id", "unknown"),
                score=result.score,
                text=result.text if request.include_text else None,
                metadata=result.metadata,
            )
            for result in results
        ]

        return SearchResponse(
            query=request.query,
            results=result_items,
            total_results=len(result_items),
            processing_time_ms=processing_time_ms,
        )

    except Exception as e:
        logger.error("search_error", error=str(e))
        raise HTTPException(status_code=500, detail=str(e)) from e


@app.get("/documents")
async def list_documents(
    user_id: str = "anonymous", limit: int = 100
) -> Dict[str, Any]:
    """List all documents for a user.

    Args:
        user_id: User identifier
        limit: Maximum number of documents to return

    Returns:
        List of documents with metadata
    """
    p = await _ensure_pipeline()

    try:
        # Get documents from metadata store (source of truth)
        documents = await p.metadata_store.list_user_documents(
            user_id=user_id, limit=limit
        )

        return {
            "documents": [
                {
                    "id": doc.id,
                    "name": doc.name,
                    "user_id": doc.user_id,
                    "uploaded_at": doc.uploaded_at.isoformat(),
                    "status": doc.status,
                    "chunks_count": doc.chunks_count,
                    "file_size": doc.file_size,
                    "file_type": doc.file_type,
                    "metadata": doc.metadata_json,
                }
                for doc in documents
            ],
            "total": len(documents),
        }

    except Exception as e:
        logger.error("list_documents_error", error=str(e))
        raise HTTPException(status_code=500, detail=str(e)) from e


@app.delete("/documents/{document_id}")
async def delete_document(document_id: str) -> Dict[str, Any]:
    """Delete a document and all its chunks.

    Args:
        document_id: Document identifier

    Returns:
        Deletion status
    """
    p = await _ensure_pipeline()

    try:
        # Get chunk IDs from metadata store
        chunk_ids = await p.metadata_store.delete_document(document_id)

        # Delete from vectorstore
        if chunk_ids:
            p.vector_store.delete(chunk_ids)

        return {
            "document_id": document_id,
            "chunks_deleted": len(chunk_ids),
            "status": "deleted",
        }

    except Exception as e:
        logger.error("delete_document_error", error=str(e), document_id=document_id)
        raise HTTPException(status_code=500, detail=str(e)) from e


@app.post("/chat", response_model=ChatResponse)
async def chat(request: ChatRequest) -> ChatResponse:
    """Chat with RAG system.

    Uses semantic search to find relevant context, then generates an answer
    using an LLM. Maintains conversation history across sessions.

    Args:
        request: Chat request with message and parameters

    Returns:
        ChatResponse with answer and sources
    """
    p = await _ensure_pipeline()

    try:
        # Chat with pipeline
        result = await p.chat(
            message=request.message,
            session_id=request.session_id,
            user_id=request.user_id,
            top_k=request.top_k,
            model=request.model,
            system_prompt=request.system_prompt or settings.default_system_prompt,
        )

        # Convert to response format
        sources = [
            SourceChunk(
                chunk_id=s["chunk_id"],
                score=s["score"],
                text=s.get("text") if request.include_sources else None,
                reference=s.get("reference"),
                image=s.get("image"),
            )
            for s in result["sources"]
        ]

        return ChatResponse(
            answer=result["answer"],
            session_id=result["session_id"],
            sources=sources,
            model=result["model"],
            tokens_used=result["tokens_used"],
            cost_usd=result["cost_usd"],
            processing_time_ms=result["processing_time_ms"],
        )

    except Exception as e:
        logger.error("chat_error", error=str(e))
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/chat/stream")
async def chat_stream(request: ChatRequest):
    """Stream chat responses with real-time context retrieval.

    Uses Server-Sent Events (SSE) to stream responses as they're generated.
    Returns events with types: metadata, content, done, error.

    Args:
        request: Chat request with message and parameters

    Returns:
        StreamingResponse with SSE events
    """
    p = await _ensure_pipeline()

    async def generate():
        try:
            async for event in p.chat_stream(
                message=request.message,
                session_id=request.session_id,
                user_id=request.user_id,
                top_k=request.top_k,
                model=request.model,
                system_prompt=request.system_prompt or settings.default_system_prompt,
            ):
                # Format as SSE
                yield f"data: {json.dumps(event)}\n\n"
        except Exception as e:
            logger.error("chat_stream_error", error=str(e))
            yield f"data: {json.dumps({'type': 'error', 'message': str(e)})}\n\n"

    return StreamingResponse(
        generate(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "X-Accel-Buffering": "no",  # Disable nginx buffering
        },
    )


@app.get("/settings/chat", response_model=ChatSettings)
async def public_get_chat_settings() -> ChatSettings:
    """Public, read-only chat settings (used by the website ChatWidget)."""
    row = await settings_store.get_chat_settings()
    return ChatSettings(**row.value)


@app.get("/admin/sessions")
async def admin_list_sessions(
    user_id: str = "gundy_io_public",
    limit: int = 50,
    offset: int = 0,
    x_admin_key: str | None = Header(default=None, alias="X-Admin-Key"),
):
    """List recent sessions (admin-only)."""
    _assert_admin(x_admin_key)
    p = await _ensure_pipeline()
    sessions = await p.metadata_store.list_user_sessions(
        user_id=user_id, limit=limit, offset=offset
    )
    return {
        "user_id": user_id,
        "sessions": [
            {
                "id": s.id,
                "user_id": s.user_id,
                "created_at": s.created_at.isoformat(),
                "last_activity": s.last_activity.isoformat(),
                "message_count": s.message_count,
                "metadata": s.metadata_json,
            }
            for s in sessions
        ],
    }


@app.get("/admin/sessions/{session_id}/messages")
async def admin_list_messages(
    session_id: str,
    limit: int = 50,
    offset: int = 0,
    x_admin_key: str | None = Header(default=None, alias="X-Admin-Key"),
):
    """List messages for a session (admin-only)."""
    _assert_admin(x_admin_key)
    p = await _ensure_pipeline()
    messages = await p.metadata_store.get_conversation_history(
        session_id=session_id, limit=limit, offset=offset
    )
    return {
        "session_id": session_id,
        "messages": [
            {
                "id": m.id,
                "role": m.role,
                "content": m.content,
                "timestamp": m.timestamp.isoformat(),
                "model": m.model,
                "tokens_used": m.tokens_used,
                "cost_usd": m.cost_usd,
                "sources": m.sources_json,
                "metadata": m.metadata_json,
            }
            for m in messages
        ],
    }


@app.get("/admin/settings/chat", response_model=ChatSettings)
async def admin_get_chat_settings(
    x_admin_key: str | None = Header(default=None, alias="X-Admin-Key"),
) -> ChatSettings:
    """Fetch chat settings (admin-only)."""
    _assert_admin(x_admin_key)
    row = await settings_store.get_chat_settings()
    return ChatSettings(**row.value)


@app.put("/admin/settings/chat", response_model=ChatSettings)
async def admin_put_chat_settings(
    body: ChatSettings,
    x_admin_key: str | None = Header(default=None, alias="X-Admin-Key"),
) -> ChatSettings:
    """Update chat settings (admin-only)."""
    _assert_admin(x_admin_key)
    row = await settings_store.set_chat_settings(body.model_dump())
    return ChatSettings(**row.value)
