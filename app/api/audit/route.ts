import { NextResponse } from 'next/server'

export const runtime = 'nodejs'

export async function POST(request: Request) {
  let body: unknown = null
  try {
    body = await request.json()
  } catch {
    // ignore
  }

  console.info('[audit]', {
    event: 'client_audit',
    ts: new Date().toISOString(),
    body,
    userAgent: request.headers.get('user-agent') ?? undefined,
  })

  return new NextResponse(null, { status: 204 })
}

