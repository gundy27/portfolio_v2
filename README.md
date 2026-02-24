# Portfolio Website

A clean, modern portfolio website built with Next.js 16 and React 19.

## Status

This project has been cleaned and is ready for a fresh start with a new design system.

## Tech Stack

- **Framework**: Next.js 16
- **React**: 19.2.0
- **TypeScript**: 5.x
- **Styling**: Tailwind CSS v4
- **Fonts**: Geist Sans & Mono

## Getting Started

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build
```

## Admin dashboard (chat logs)

The site includes a simple admin UI at `/admin` that mirrors the FastAPI admin endpoints:

- `GET /admin/sessions?user_id=...`
- `GET /admin/sessions/{session_id}/messages`

### Required environment variables (Next.js)

Set these in your runtime environment (Vercel project env vars in production):

- **`ADMIN_DASHBOARD_USERNAME`**: username for `/admin/login`
- **`ADMIN_DASHBOARD_PASSWORD`**: password for `/admin/login`
- **`ADMIN_SESSION_SECRET`**: random string used to sign the admin session cookie
- **`RAG_API_URL`**: base URL of the FastAPI service (server-to-server)
- **`RAG_ADMIN_API_KEY`**: value sent as `X-Admin-Key` to the FastAPI admin endpoints

### FastAPI configuration

In the API service env, set **`ADMIN_API_KEY`** to enable the `/admin/*` endpoints (see `services/rag-api/env.example`).

## Deployment

This project is deployed to Vercel at [gundy.io](https://gundy.io).

---

_Ready for new design system implementation_
