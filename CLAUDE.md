# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Personal portfolio site for Dan Gunderson (gundy.io) — a product/growth leader. This is a monorepo containing three distinct apps and a vendor submodule.

## Architecture

### Three Apps

1. **Main Portfolio** (`/` root) — Next.js 16, React 19, Tailwind CSS v4, TypeScript. The public-facing site with an admin dashboard at `/admin`.
2. **Chatbot** (`/chatbot/`) — Standalone Next.js 14 app. A RAG chatbot UI that can be run independently.
3. **RAG API** (`/services/rag-api/`) — FastAPI (Python) backend for the RAG system. Communicates with OpenAI for embeddings and chat, ChromaDB for vectors, SQLite for metadata.

### Vendor Submodule

`/vendor/ai-utils/` is a git submodule containing reusable Python libraries (`gundy-ai-*`) used by the RAG API:
- `extractors` → parse TXT/PDF/DOCX
- `chunker` → token-aware text splitting
- `embeddings` → OpenAI embedding generation
- `vectorstore` → ChromaDB adapter
- `metadata-store` → SQLite session/conversation tracking
- `llm_wrappers/openai_wrapper` → LLM client

### Request Flow

Browser → Next.js `/api/rag/[...path]` proxy → FastAPI (`RAG_API_URL`) → OpenAI + ChromaDB

The proxy at `app/api/rag/[...path]/route.ts` forwards all methods including SSE streaming. The `RAG_API_URL` env var controls where the proxy points (default: `http://localhost:8000`).

### RAG Pipeline

The pipeline in `services/rag-api/app/pipeline.py` processes documents as a single portfolio corpus (512 token chunks, 50 overlap).

### Admin Dashboard

`/admin` is a server-rendered protected area using session cookies (httpOnly JWT signed with `ADMIN_SESSION_SECRET`). It surfaces chat logs and settings from the RAG API's admin endpoints (which require `X-Admin-Key` header).

## Commands

### Main Portfolio
```bash
npm run dev      # Dev server
npm run build    # Production build
npm run lint     # ESLint
```

### Chatbot (run from /chatbot/)
```bash
npm run dev      # Dev server
npm run build    # Production build
```

### RAG API (run from /services/rag-api/)
```bash
poetry install                                      # Install dependencies
poetry run uvicorn app.main:app --reload            # Dev server (port 8000)
poetry run pytest                                   # Run tests
poetry run pytest --cov                             # Run tests with coverage
```

## Environment Variables

**Main portfolio** (`.env.local`):
- `ADMIN_DASHBOARD_USERNAME` / `ADMIN_DASHBOARD_PASSWORD` — admin login credentials
- `ADMIN_SESSION_SECRET` — signs the admin session JWT
- `RAG_API_URL` — upstream FastAPI URL (e.g., `http://localhost:8000`)
- `RAG_ADMIN_API_KEY` — sent as `X-Admin-Key` to RAG API admin endpoints

**RAG API** (`.env` in `services/rag-api/`):
- `OPENAI_API_KEY` — required for embeddings and chat
- `VECTOR_DB_PATH` — ChromaDB storage path (default: `./vector_db`)
- `METADATA_DB_URL` — SQLite connection string
- `COLLECTION_NAME` — ChromaDB collection name (default: `documents`)

## Design System

See `DESIGN_GUIDELINES.md` for full design specs. Key points:
- **Fonts**: Space Grotesk (headings), Poppins (body), Lexend Exa (accent/brand)
- **Styling**: Tailwind CSS v4 throughout the main portfolio
- Component patterns and spacing rules are documented in `DESIGN_GUIDELINES.md`

## TypeScript Config

The root `tsconfig.json` uses path alias `@/*` → root. The `chatbot/` and `vendor/` directories are excluded from the root TS compilation — each has its own config.

## Deployment

- **Frontend**: Vercel (auto-deploys from `main` branch at gundy.io)
- **RAG API**: Docker-ready, designed for Render with a persistent disk mounted at `/data`
