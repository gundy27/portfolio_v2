import fs from 'fs/promises'
import path from 'path'

import { NextResponse } from 'next/server'

export const runtime = 'nodejs'

function getClientIp(headers: Headers) {
  const forwardedFor = headers.get('x-forwarded-for')
  if (forwardedFor) return forwardedFor.split(',')[0]?.trim()
  return headers.get('x-real-ip') ?? undefined
}

export async function GET(request: Request) {
  const headers = request.headers
  const userAgent = headers.get('user-agent') ?? undefined
  const ip = getClientIp(headers)

  // Audit log: count resume downloads in your server logs.
  console.info('[audit]', {
    event: 'resume_download',
    ts: new Date().toISOString(),
    ip,
    userAgent,
  })

  const resumePath = path.join(process.cwd(), 'public', 'assets', 'resume.pdf')

  try {
    const file = await fs.readFile(resumePath)

    return new NextResponse(file, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': 'attachment; filename="Dan-Gunderson-Resume.pdf"',
        'Cache-Control': 'public, max-age=3600',
      },
    })
  } catch (err) {
    console.error('[audit]', { event: 'resume_download_failed', ts: new Date().toISOString(), resumePath, err })
    return new NextResponse('Resume not found. Place it at public/assets/resume.pdf.', { status: 404 })
  }
}

