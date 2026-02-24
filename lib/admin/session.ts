import crypto from 'node:crypto'

function b64urlEncode(input: string | Buffer) {
  const buf = typeof input === 'string' ? Buffer.from(input, 'utf8') : input
  return buf.toString('base64').replaceAll('+', '-').replaceAll('/', '_').replaceAll('=', '')
}

function b64urlDecodeToString(input: string) {
  const padLen = (4 - (input.length % 4)) % 4
  const padded = input + '='.repeat(padLen)
  const b64 = padded.replaceAll('-', '+').replaceAll('_', '/')
  return Buffer.from(b64, 'base64').toString('utf8')
}

function safeEqual(a: string, b: string) {
  const aBuf = Buffer.from(a, 'utf8')
  const bBuf = Buffer.from(b, 'utf8')
  if (aBuf.length !== bBuf.length) return false
  return crypto.timingSafeEqual(aBuf, bBuf)
}

export type AdminSession = {
  username: string
  expiresAtMs: number
}

type AdminSessionPayload = {
  u: string
  exp: number
}

function getSecret() {
  const secret = process.env.ADMIN_SESSION_SECRET
  if (!secret) {
    throw new Error('Missing ADMIN_SESSION_SECRET')
  }
  return secret
}

function sign(payloadB64: string) {
  const secret = getSecret()
  return crypto.createHmac('sha256', secret).update(payloadB64).digest('base64url')
}

export function createAdminSessionToken(input: {
  username: string
  ttlMs: number
}) {
  const now = Date.now()
  const payload: AdminSessionPayload = {
    u: input.username,
    exp: now + input.ttlMs,
  }
  const payloadB64 = b64urlEncode(JSON.stringify(payload))
  const sig = sign(payloadB64)
  return `${payloadB64}.${sig}`
}

export function verifyAdminSessionToken(token: string | undefined | null): AdminSession | null {
  if (!token) return null

  const [payloadB64, sig] = token.split('.')
  if (!payloadB64 || !sig) return null

  const expected = sign(payloadB64)
  if (!safeEqual(sig, expected)) return null

  let payload: AdminSessionPayload
  try {
    payload = JSON.parse(b64urlDecodeToString(payloadB64)) as AdminSessionPayload
  } catch {
    return null
  }

  if (!payload || typeof payload.u !== 'string' || typeof payload.exp !== 'number') {
    return null
  }

  if (Date.now() > payload.exp) return null

  return { username: payload.u, expiresAtMs: payload.exp }
}

