import { NextResponse } from "next/server"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

const HOP_BY_HOP_RESPONSE_HEADERS = new Set([
  "connection",
  "keep-alive",
  "proxy-authenticate",
  "proxy-authorization",
  "te",
  "trailers",
  "transfer-encoding",
  "upgrade",
])

function getUpstreamBaseUrl(): string {
  const base =
    process.env.RAG_API_URL ??
    process.env.NEXT_PUBLIC_RAG_API_URL ??
    process.env.NEXT_PUBLIC_API_URL

  if (!base?.trim()) {
    // Fail loudly in production instead of accidentally proxying to localhost.
    throw new Error("Missing RAG_API_URL (or NEXT_PUBLIC_RAG_API_URL) for /api/rag proxy.")
  }

  return base.replace(/\/+$/, "")
}

async function proxy(request: Request, ctx: { params: Promise<{ path?: string[] }> }) {
  const { path = [] } = await ctx.params

  const upstreamBase = getUpstreamBaseUrl()
  const upstreamUrl = new URL(`${upstreamBase}/${path.join("/")}`)

  const incomingUrl = new URL(request.url)
  upstreamUrl.search = incomingUrl.search

  const headers = new Headers(request.headers)
  // Avoid forwarding browser origin/host semantics to the upstream.
  headers.delete("host")
  headers.delete("origin")
  headers.delete("referer")
  headers.delete("content-length")
  headers.delete("connection")
  headers.delete("accept-encoding")

  const init: RequestInit & { duplex?: "half" } = {
    method: request.method,
    headers,
    redirect: "manual",
  }

  if (request.method !== "GET" && request.method !== "HEAD") {
    init.body = request.body
    init.duplex = "half"
  }

  const upstreamRes = await fetch(upstreamUrl, init)

  const resHeaders = new Headers(upstreamRes.headers)
  for (const h of HOP_BY_HOP_RESPONSE_HEADERS) resHeaders.delete(h)
  // Node's fetch auto-decompresses the body, so the raw bytes no longer match
  // the original content-encoding. Drop it to avoid ERR_CONTENT_DECODING_FAILED.
  resHeaders.delete("content-encoding")
  resHeaders.delete("content-length")
  // Safer default for APIs + SSE.
  if (!resHeaders.has("cache-control")) resHeaders.set("cache-control", "no-store")

  return new Response(upstreamRes.body, {
    status: upstreamRes.status,
    statusText: upstreamRes.statusText,
    headers: resHeaders,
  })
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      Allow: "GET,HEAD,POST,PUT,PATCH,DELETE,OPTIONS",
    },
  })
}

export const GET = proxy
export const HEAD = proxy
export const POST = proxy
export const PUT = proxy
export const PATCH = proxy
export const DELETE = proxy

