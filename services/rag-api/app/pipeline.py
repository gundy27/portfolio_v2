"""RAG pipeline integration."""

import base64
import re
import os
from app.config import settings as _settings
import tempfile
import time
from collections import defaultdict
from pathlib import Path
from typing import Any, AsyncGenerator, Dict, List, Optional

import structlog
from dotenv import load_dotenv
from gundy_ai.chunker import TokenAwareChunker
from gundy_ai.embeddings import OpenAIEmbeddingProvider
from gundy_ai.extractors import ParserRegistry, PDFParser, TXTParser
from gundy_ai.llm import OpenAIClient
from gundy_ai.metadata_store import MetadataStore
from gundy_ai.vectorstore import ChromaDBAdapter, QueryResult

from app.models import Corpus

logger = structlog.get_logger(__name__)


class _DisabledEmbeddingProvider:
    """Fallback embedding provider when no OpenAI key is configured.

    This allows the API to start (and basic endpoints/tests to run) without
    enabling ingestion/search/chat that require embeddings.
    """

    def __init__(self, model_name: str):
        self.model_name = model_name
        self.dimensions = None

    def embed(self, texts: List[str]):  # pragma: no cover
        raise RuntimeError(
            "Embeddings are disabled because OPENAI_API_KEY is not set."
        )

    def health_check(self) -> Dict[str, Any]:
        return {
            "healthy": False,
            "model": self.model_name,
            "error": "OPENAI_API_KEY not set; embeddings disabled",
        }


class _DisabledLLMClient:
    def chat(self, *args, **kwargs):  # pragma: no cover
        raise RuntimeError("LLM is disabled because OPENAI_API_KEY is not set.")

    def chat_stream(self, *args, **kwargs):  # pragma: no cover
        raise RuntimeError("LLM is disabled because OPENAI_API_KEY is not set.")


class RAGPipeline:
    """Complete RAG pipeline: extract → chunk → embed → store.

    Integrates all gundy-ai libraries into a cohesive pipeline.
    """

    def __init__(
        self,
        vector_db_path: str = "./vector_db",
        collection_name: str = "documents",
        metadata_db_url: str = "sqlite+aiosqlite:///./metadata.db",
        openai_api_key: Optional[str] = None,
        embedding_model: str = "text-embedding-3-small",
        chunk_max_tokens: int = 512,
        chunk_overlap_tokens: int = 50,
    ):
        """Initialize RAG pipeline.

        Args:
            vector_db_path: Path to vector database
            collection_name: Collection name for vectors
            metadata_db_url: Metadata store database URL
            openai_api_key: OpenAI API key (or use OPENAI_API_KEY env var)
            embedding_model: Embedding model to use
            chunk_max_tokens: Maximum tokens per chunk
            chunk_overlap_tokens: Overlap between chunks
        """
        logger.info(
            "rag_pipeline_init",
            vector_db_path=vector_db_path,
            collection=collection_name,
            embedding_model=embedding_model,
        )

        # Load environment variables (local dev) before initializing providers.
        # This mirrors OpenAIClient behavior and ensures embeddings can read OPENAI_API_KEY.
        load_dotenv(override=False)

        # Ensure the vector DB directory exists (important for containerized deploys
        # with a mounted persistent disk, e.g. Render at /data).
        try:
            persist_dir = Path(vector_db_path)
            if persist_dir.exists() and not persist_dir.is_dir():
                raise ValueError(
                    f"VECTOR_DB_PATH must be a directory path, got: {vector_db_path}"
                )
            persist_dir.mkdir(parents=True, exist_ok=True)
        except Exception as e:
            logger.error(
                "vector_db_path_init_failed", vector_db_path=vector_db_path, error=str(e)
            )
            raise

        # Initialize parser registry
        self.parser_registry = ParserRegistry()
        self.parser_registry.register(TXTParser())
        self.parser_registry.register(PDFParser())

        # Try to register DOCX parser if available
        try:
            from gundy_ai.extractors import DOCXParser

            self.parser_registry.register(DOCXParser())
        except ImportError:
            logger.warning(
                "docx_parser_unavailable", reason="python-docx not installed"
            )

        # Initialize chunker
        self.chunker = TokenAwareChunker(
            max_tokens=chunk_max_tokens, overlap_tokens=chunk_overlap_tokens
        )

        # Initialize embedding provider
        try:
            self.embeddings = OpenAIEmbeddingProvider(
                api_key=openai_api_key or os.environ.get("OPENAI_API_KEY"),
                model=embedding_model,
            )
        except ValueError as e:
            logger.warning(
                "embeddings_disabled",
                reason="openai_api_key_missing_or_invalid",
                error=str(e),
            )
            self.embeddings = _DisabledEmbeddingProvider(model_name=embedding_model)

        # Initialize vector store
        self.vector_store = ChromaDBAdapter(
            persist_directory=vector_db_path, collection_name=collection_name
        )

        # Initialize metadata store
        self.metadata_store = MetadataStore(metadata_db_url)

        # Initialize LLM client (set env var for OpenAIClient)
        if openai_api_key:
            os.environ["OPENAI_API_KEY"] = openai_api_key
        try:
            self.llm = OpenAIClient()
        except Exception as e:
            logger.warning(
                "llm_disabled",
                reason="openai_api_key_missing_or_invalid",
                error=str(e),
            )
            self.llm = _DisabledLLMClient()

        logger.info("rag_pipeline_initialized")

    async def ingest_document(
        self,
        file_name: str,
        file_content_base64: str,
        corpus: Corpus = "portfolio",
        user_id: str = "anonymous",
        metadata: Optional[Dict[str, Any]] = None,
    ) -> Dict[str, Any]:
        """Ingest a document through the complete pipeline.

        Args:
            file_name: Name of the file
            file_content_base64: Base64 encoded file content
            user_id: User identifier
            metadata: Optional document metadata

        Returns:
            Dictionary with ingestion results

        Raises:
            ValueError: If file type not supported
            RuntimeError: If processing fails
        """
        start_time = time.time()

        # Get file extension
        file_ext = Path(file_name).suffix.lower()
        if not file_ext:
            raise ValueError(f"File must have an extension: {file_name}")

        # Get parser for file type
        parser = self.parser_registry.get_parser(file_ext)
        if not parser:
            supported = self.parser_registry.get_supported_extensions()
            raise ValueError(
                f"Unsupported file type: {file_ext}. Supported: {supported}"
            )

        logger.info(
            "document_ingest_start",
            file_name=file_name,
            file_type=file_ext,
            corpus=corpus,
        )

        # Decode file content and save to temp file
        try:
            file_bytes = base64.b64decode(file_content_base64)
        except Exception as e:
            raise ValueError(f"Invalid base64 encoding: {str(e)}") from e

        # Create unique document ID
        import uuid

        document_id = f"doc_{uuid.uuid4().hex[:12]}"

        # Process file
        with tempfile.NamedTemporaryFile(suffix=file_ext, delete=False) as tmp_file:
            tmp_file.write(file_bytes)
            tmp_path = tmp_file.name

        try:
            # Step 1: Extract text
            extracted_chunks = parser.parse(tmp_path)
            logger.info("extraction_complete", chunks=len(extracted_chunks))

            # Step 2: Chunk the text
            all_chunks = []
            for extracted in extracted_chunks:
                chunks = self.chunker.chunk(extracted.text)
                all_chunks.extend(chunks)

            logger.info("chunking_complete", chunks=len(all_chunks))

            # Step 3: Generate embeddings
            chunk_texts = [chunk.text for chunk in all_chunks]
            embedding_result = self.embeddings.embed(chunk_texts)

            logger.info(
                "embedding_complete",
                embeddings=len(embedding_result.embeddings),
                tokens=embedding_result.total_tokens,
                cost=embedding_result.estimated_cost_usd,
            )

            # Step 4: Store in vector database
            chunk_ids = [f"{document_id}_chunk_{i}" for i in range(len(all_chunks))]
            chunk_metadatas = [
                {
                    "document_id": document_id,
                    "document_name": file_name,
                    "chunk_index": i,
                    "token_count": chunk.token_count,
                    "user_id": user_id,
                    "corpus": corpus,
                    "source": "portfolio",
                    **(metadata or {}),
                }
                for i, chunk in enumerate(all_chunks)
            ]

            self.vector_store.upsert(
                ids=chunk_ids,
                embeddings=embedding_result.embeddings,
                metadatas=chunk_metadatas,
                texts=chunk_texts,
            )

            logger.info("vectorstore_complete", vectors=len(chunk_ids))

            # Track in metadata store
            await self.metadata_store.create_document(
                name=file_name,
                user_id=user_id,
                chunks=chunk_ids,
                status="completed",
                file_size=len(file_bytes),
                file_type=file_ext,
                metadata={"corpus": corpus, "source": "portfolio", **(metadata or {})},
            )

            logger.info("metadata_store_complete", document_id=document_id)

            processing_time_ms = (time.time() - start_time) * 1000

            result = {
                "document_id": document_id,
                "chunks_created": len(all_chunks),
                "vectors_stored": len(chunk_ids),
                "total_tokens": embedding_result.total_tokens,
                "estimated_cost_usd": embedding_result.estimated_cost_usd,
                "processing_time_ms": processing_time_ms,
            }

            logger.info("document_ingest_complete", **result)

            return result

        finally:
            # Cleanup temp file
            Path(tmp_path).unlink(missing_ok=True)

    def search(
        self,
        query: str,
        corpus: Corpus = "portfolio",
        top_k: int = 5,
        filter: Optional[Dict[str, Any]] = None,
        include_text: bool = True,
    ) -> List[QueryResult]:
        """Search for similar documents.

        Args:
            query: Search query
            top_k: Number of results to return
            filter: Optional metadata filter
            include_text: Include text in results

        Returns:
            List of QueryResult objects
        """
        start_time = time.time()

        logger.info("search_start", query_length=len(query), top_k=top_k, corpus=corpus)

        # Generate query embedding
        query_embedding_result = self.embeddings.embed([query])
        query_embedding = query_embedding_result.embeddings[0]

        logger.info(
            "query_embedding_complete",
            dimensions=len(query_embedding),
            tokens=query_embedding_result.total_tokens,
        )

        # Search vector store
        results = self.vector_store.query(
            query_embedding=query_embedding,
            top_k=top_k,
            filter=filter,
            include_embeddings=False,
        )

        processing_time_ms = (time.time() - start_time) * 1000

        logger.info(
            "search_complete",
            results_found=len(results),
            processing_time_ms=processing_time_ms,
        )

        return results

    _BROAD_CAREER_PATTERNS: List[re.Pattern[str]] = [
        re.compile(r"\bcompanies?\b", re.IGNORECASE),
        re.compile(r"\bemployers?\b", re.IGNORECASE),
        re.compile(r"\bwork\s+history\b", re.IGNORECASE),
        re.compile(r"\bwhere\s+(did|has)\s+dan\s+work\b", re.IGNORECASE),
        re.compile(r"\bworked\s+at\b", re.IGNORECASE),
        re.compile(r"\broles?\b", re.IGNORECASE),
        re.compile(r"\bpositions?\b", re.IGNORECASE),
        re.compile(r"\bjob(s)?\b", re.IGNORECASE),
        re.compile(r"\btitles?\b", re.IGNORECASE),
        re.compile(r"\blast\s+position\b", re.IGNORECASE),
        re.compile(r"\bmost\s+recent\b", re.IGNORECASE),
        re.compile(r"\bresume\b", re.IGNORECASE),
        re.compile(r"\bcareer\b", re.IGNORECASE),
    ]

    def _is_broad_career_query(self, message: str) -> bool:
        msg = message.strip()
        if not msg:
            return False
        return any(p.search(msg) for p in self._BROAD_CAREER_PATTERNS)

    def _result_label(self, r: QueryResult) -> str:
        return (
            (r.metadata or {}).get("reference")
            or (r.metadata or {}).get("document_name")
            or (r.metadata or {}).get("document_id")
            or r.id
        )

    def _work_history_signal(self, r: QueryResult) -> bool:
        md = r.metadata or {}
        ref = str(md.get("reference") or "")
        tags = str(md.get("tags") or "")
        if ref.startswith("Work history:"):
            return True
        if "work-history" in tags:
            return True
        return False

    def _rerank_and_diversify(
        self,
        results: List[QueryResult],
        limit: int,
        *,
        prefer_work_history: bool,
        per_label_limit: int,
    ) -> List[QueryResult]:
        """De-duplicate and diversify results so one long section doesn't crowd out others."""

        # De-dupe by chunk id, keeping the best score.
        best_by_id: Dict[str, QueryResult] = {}
        for r in results:
            prev = best_by_id.get(r.id)
            if prev is None or r.score > prev.score:
                best_by_id[r.id] = r

        unique = list(best_by_id.values())

        # Boost work-history chunks for broad career queries so they appear in the context set.
        def boosted_score(r: QueryResult) -> float:
            score = float(r.score or 0.0)
            if prefer_work_history and self._work_history_signal(r):
                score += 0.20
            return score

        unique.sort(key=boosted_score, reverse=True)

        # Diversify by label (reference/document) to reduce duplicates from multi-chunk sections.
        selected: List[QueryResult] = []
        counts: Dict[str, int] = defaultdict(int)
        for r in unique:
            if len(selected) >= limit:
                break
            label = self._result_label(r)
            if counts[label] >= per_label_limit:
                continue
            counts[label] += 1
            selected.append(r)

        return selected

    def _retrieve_context_chunks(
        self,
        *,
        message: str,
        corpus: Corpus,
        user_id: str,
        top_k: int,
        search_filter: Dict[str, Any],
    ) -> List[QueryResult]:
        """Retrieve context with a small amount of query routing and diversity.

        Broad career questions (companies/roles/positions) are prone to under-retrieval.
        We overfetch + diversify, and if we still don't see any work-history signal,
        we run a lightweight query expansion pass and merge.
        """

        is_broad_career = self._is_broad_career_query(message)

        # Overfetch so we can diversify and still return `top_k`.
        overfetch_k = min(max(top_k * (5 if is_broad_career else 3), 20), 60)
        primary = self.search(
            query=message,
            corpus=corpus,
            top_k=overfetch_k,
            filter=search_filter,
            include_text=True,
        )

        merged: Dict[str, QueryResult] = {r.id: r for r in primary}

        if is_broad_career and not any(self._work_history_signal(r) for r in primary):
            expanded_query = (
                f"{message}\n\n"
                "Focus: work history, employers/companies, roles/titles, timeline, most recent position."
            )
            secondary = self.search(
                query=expanded_query,
                corpus=corpus,
                top_k=overfetch_k,
                filter=search_filter,
                include_text=True,
            )
            for r in secondary:
                prev = merged.get(r.id)
                if prev is None or r.score > prev.score:
                    merged[r.id] = r

        diversified = self._rerank_and_diversify(
            list(merged.values()),
            limit=top_k,
            prefer_work_history=is_broad_career,
            per_label_limit=1 if is_broad_career else 2,
        )
        return diversified

    def delete_document(self, document_id: str) -> int:
        """Delete all chunks for a document.

        Args:
            document_id: Document identifier

        Returns:
            Number of chunks deleted
        """
        logger.info("document_delete_start", document_id=document_id)

        # Query for all chunks with this document_id
        # ChromaDB doesn't have a built-in way to get all IDs by metadata,
        # so we'll search with a dummy embedding and filter
        # This is a workaround - in production you'd track document->chunk mappings

        # For now, we'll use a simple pattern match on chunk IDs
        # In production, maintain a separate document->chunks index

        # Since ChromaDB doesn't support pattern matching in delete,
        # we need to track chunks differently or query first

        # Simplified approach: assume chunk IDs follow pattern {document_id}_chunk_*
        # Get all chunks and filter (not ideal for large collections)

        # Better approach: use metadata filter to find chunks
        try:
            # This is a limitation - we'll need to enhance this
            # For now, return 0 and log warning
            logger.warning(
                "document_delete_not_implemented",
                document_id=document_id,
                reason="Need metadata-based bulk delete",
            )
            return 0
        except Exception as e:
            logger.error(
                "document_delete_failed", document_id=document_id, error=str(e)
            )
            raise

    def health_check(self) -> Dict[str, Any]:
        """Check health of all pipeline components.

        Returns:
            Dictionary with health status of each component
        """
        health = {}

        # Check vector store
        try:
            vs_health = self.vector_store.health_check()
            health["vector_store"] = {
                "healthy": vs_health["healthy"],
                "count": vs_health.get("count"),
                "latency_ms": vs_health.get("latency_ms"),
            }
        except Exception as e:
            health["vector_store"] = {"healthy": False, "error": str(e)}

        # Check embedding provider
        try:
            emb_health = self.embeddings.health_check()
            health["embeddings"] = {
                "healthy": emb_health["healthy"],
                "model": emb_health.get("model"),
                "latency_ms": emb_health.get("latency_ms"),
            }
        except Exception as e:
            health["embeddings"] = {"healthy": False, "error": str(e)}

        # Check parsers
        health["parsers"] = {
            "healthy": True,
            "registered": len(self.parser_registry.list_parsers()),
            "supported_types": self.parser_registry.get_supported_extensions(),
        }

        # Check chunker
        health["chunker"] = {
            "healthy": True,
            "max_tokens": self.chunker.max_tokens,
            "overlap_tokens": self.chunker.overlap_tokens,
        }

        # Overall status
        all_healthy = all(
            comp.get("healthy", False)
            for comp in [health["vector_store"], health["embeddings"]]
        )
        health["status"] = "healthy" if all_healthy else "unhealthy"

        return health

    async def chat(
        self,
        message: str,
        corpus: Corpus = "portfolio",
        session_id: Optional[str] = None,
        user_id: str = "anonymous",
        top_k: int = 5,
        model: str = "gpt-4o-mini",
        include_history: bool = True,
        system_prompt: Optional[str] = None,
    ) -> Dict[str, Any]:
        """Chat with RAG system.

        Args:
            message: User message
            session_id: Optional session ID for conversation history
            user_id: User identifier
            top_k: Number of context chunks to retrieve
            model: LLM model to use
            include_history: Include conversation history in context

        Returns:
            Dictionary with answer, sources, and metadata
        """
        start_time = time.time()

        # Get or create session
        if session_id:
            session = await self.metadata_store.get_session(session_id)
            if not session:
                session = await self.metadata_store.create_session(user_id=user_id)
        else:
            session = await self.metadata_store.create_session(user_id=user_id)

        logger.info(
            "chat_start", session_id=session.id, user_id=user_id, corpus=corpus
        )

        # Save user message
        await self.metadata_store.add_message(
            session_id=session.id, role="user", content=message
        )

        # Search for relevant context - filter by user_id (+ corpus) for RBAC/scoping.
        # Chroma's `where` syntax expects a single operator at the top level when
        # combining clauses, so we use "$and" for multi-field filters.
        search_filter: Dict[str, Any] = {"user_id": user_id}
        if corpus:
            search_filter = {"$and": [{"user_id": user_id}, {"corpus": corpus}]}
        search_results = self._retrieve_context_chunks(
            message=message,
            corpus=corpus,
            user_id=user_id,
            top_k=top_k,
            search_filter=search_filter,
        )

        # Build context from search results
        context_parts = []
        for i, r in enumerate(search_results):
            label = (
                r.metadata.get("reference")
                or r.metadata.get("document_name")
                or r.metadata.get("document_id")
                or r.id
            )
            context_parts.append(f"[Source {i+1} - {label}]: {r.text}")
        context = (
            "\n\n".join(context_parts)
            if context_parts
            else "No relevant documents found."
        )

        # Get conversation history if requested
        history_messages = []
        if include_history and session.message_count > 0:
            history = await self.metadata_store.get_conversation_history(
                session.id,
                limit=6,  # Last 3 exchanges
            )
            # Exclude the message we just added
            history_messages = [
                {"role": msg.role, "content": msg.content}
                for msg in history[:-1]  # Exclude last (current user message)
            ]

        # Construct LLM prompt
        # Use custom system prompt if provided, otherwise use default
        system_message = system_prompt or _settings.default_system_prompt

        messages = [{"role": "system", "content": system_message}]

        # Add history
        messages.extend(history_messages)

        # Add context and current question
        user_prompt = f"Context from documents:\n\n{context}\n\nQuestion: {message}"
        messages.append({"role": "user", "content": user_prompt})

        # Call LLM
        answer = self.llm.chat(model=model, messages=messages, max_tokens=500)

        # Estimate tokens (rough approximation)
        # In production, get from LLM response
        total_tokens = len(message.split()) + len(answer.split()) + len(context.split())
        estimated_tokens = int(total_tokens * 1.3)  # Rough token estimate

        # Estimate cost (for gpt-4o-mini: $0.15/1M input, $0.60/1M output)
        input_cost = (estimated_tokens * 0.15) / 1_000_000
        output_cost = (len(answer.split()) * 1.3 * 0.60) / 1_000_000
        estimated_cost = input_cost + output_cost

        # Save assistant message
        await self.metadata_store.add_message(
            session_id=session.id,
            role="assistant",
            content=answer,
            model=model,
            tokens_used=estimated_tokens,
            cost_usd=estimated_cost,
            sources={"chunks": [r.id for r in search_results]},
        )

        processing_time_ms = (time.time() - start_time) * 1000

        logger.info(
            "chat_complete",
            session_id=session.id,
            tokens=estimated_tokens,
            cost=estimated_cost,
            processing_time_ms=processing_time_ms,
        )

        return {
            "answer": answer,
            "session_id": session.id,
            "sources": [
                {
                    "chunk_id": r.id,
                    "score": r.score,
                    "text": r.text if include_history else None,
                    "reference": r.metadata.get("reference"),
                    "image": r.metadata.get("image"),
                }
                for r in search_results
            ],
            "model": model,
            "tokens_used": estimated_tokens,
            "cost_usd": estimated_cost,
            "processing_time_ms": processing_time_ms,
        }

    async def chat_stream(
        self,
        message: str,
        corpus: Corpus = "portfolio",
        session_id: Optional[str] = None,
        user_id: str = "anonymous",
        top_k: int = 5,
        model: str = "gpt-4o-mini",
        include_history: bool = True,
        system_prompt: Optional[str] = None,
    ) -> AsyncGenerator[Dict[str, Any], None]:
        """Stream chat responses with context retrieval.

        Args:
            message: User message
            session_id: Optional session ID for conversation history
            user_id: User identifier
            top_k: Number of context chunks to retrieve
            model: LLM model to use
            include_history: Include conversation history in context
            system_prompt: Optional custom system prompt

        Yields:
            Streaming events with types: metadata, content, done, error
        """
        start_time = time.time()

        # Get or create session
        if session_id:
            session = await self.metadata_store.get_session(session_id)
            if not session:
                session = await self.metadata_store.create_session(user_id=user_id)
        else:
            session = await self.metadata_store.create_session(user_id=user_id)

        logger.info(
            "chat_stream_start", session_id=session.id, user_id=user_id, corpus=corpus
        )

        # Save user message
        await self.metadata_store.add_message(
            session_id=session.id, role="user", content=message
        )

        # Search for relevant context - filter by user_id (+ corpus) for RBAC/scoping.
        # Chroma's `where` syntax expects a single operator at the top level when
        # combining clauses, so we use "$and" for multi-field filters.
        search_filter: Dict[str, Any] = {"user_id": user_id}
        if corpus:
            search_filter = {"$and": [{"user_id": user_id}, {"corpus": corpus}]}
        search_results = self._retrieve_context_chunks(
            message=message,
            corpus=corpus,
            user_id=user_id,
            top_k=top_k,
            search_filter=search_filter,
        )

        # Yield metadata first (session_id, sources)
        yield {
            "type": "metadata",
            "session_id": session.id,
            "sources": [
                {
                    "chunk_id": r.id,
                    "score": r.score,
                    "text": r.text,
                    "reference": r.metadata.get("reference"),
                    "image": r.metadata.get("image"),
                }
                for r in search_results
            ],
        }

        # Build context from search results
        context_parts = []
        for i, r in enumerate(search_results):
            label = (
                r.metadata.get("reference")
                or r.metadata.get("document_name")
                or r.metadata.get("document_id")
                or r.id
            )
            context_parts.append(f"[Source {i+1} - {label}]: {r.text}")
        context = (
            "\n\n".join(context_parts)
            if context_parts
            else "No relevant documents found."
        )

        # Get conversation history if requested
        history_messages = []
        if include_history and session.message_count > 0:
            history = await self.metadata_store.get_conversation_history(
                session.id,
                limit=6,  # Last 3 exchanges
            )
            # Exclude the message we just added
            history_messages = [
                {"role": msg.role, "content": msg.content}
                for msg in history[:-1]  # Exclude last (current user message)
            ]

        # Construct LLM prompt
        system_message = system_prompt or _settings.default_system_prompt

        messages = [{"role": "system", "content": system_message}]
        messages.extend(history_messages)

        # Add context and current question
        user_prompt = f"Context from documents:\n\n{context}\n\nQuestion: {message}"
        messages.append({"role": "user", "content": user_prompt})

        # Stream from LLM
        full_response = ""
        try:
            for chunk_text in self.llm.chat_stream(model=model, messages=messages):
                full_response += chunk_text
                yield {"type": "content", "delta": chunk_text}
        except Exception as e:
            logger.error("chat_stream_error", error=str(e))
            yield {"type": "error", "message": str(e)}
            return

        # Estimate tokens and cost
        total_tokens = (
            len(message.split()) + len(full_response.split()) + len(context.split())
        )
        estimated_tokens = int(total_tokens * 1.3)

        input_cost = (estimated_tokens * 0.15) / 1_000_000
        output_cost = (len(full_response.split()) * 1.3 * 0.60) / 1_000_000
        estimated_cost = input_cost + output_cost

        # Save assistant message after streaming completes
        await self.metadata_store.add_message(
            session_id=session.id,
            role="assistant",
            content=full_response,
            model=model,
            tokens_used=estimated_tokens,
            cost_usd=estimated_cost,
            sources={"chunks": [r.id for r in search_results]},
        )

        processing_time_ms = (time.time() - start_time) * 1000

        logger.info(
            "chat_stream_complete",
            session_id=session.id,
            tokens=estimated_tokens,
            cost=estimated_cost,
            processing_time_ms=processing_time_ms,
        )

        # Yield completion event
        yield {
            "type": "done",
            "tokens_used": estimated_tokens,
            "cost_usd": estimated_cost,
            "processing_time_ms": processing_time_ms,
        }

    def get_stats(self) -> Dict[str, Any]:
        """Get pipeline statistics.

        Returns:
            Dictionary with pipeline stats
        """
        try:
            vector_count = self.vector_store.count()
        except Exception as e:
            logger.warning("vector_count_failed", error=str(e))
            vector_count = 0

        return {
            "vector_count": vector_count,
            "parsers_registered": len(self.parser_registry.list_parsers()),
            "supported_file_types": self.parser_registry.get_supported_extensions(),
            "chunk_max_tokens": self.chunker.max_tokens,
            "chunk_overlap_tokens": self.chunker.overlap_tokens,
            "embedding_model": self.embeddings.model_name,
            "embedding_dimensions": self.embeddings.dimensions,
            "collection": self.vector_store.collection_name,
        }
