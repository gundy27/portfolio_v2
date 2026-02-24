import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'

import { createAdminSessionToken } from '@/lib/admin/session'

export const metadata = {
  title: 'Admin login',
}

function getRequiredEnv(name: string) {
  const v = process.env[name]
  if (!v) throw new Error(`Missing ${name}`)
  return v
}

function safeNextPath(next: string) {
  const trimmed = next.trim()
  if (!trimmed) return '/admin'
  if (!trimmed.startsWith('/admin')) return '/admin'
  return trimmed
}

async function signIn(formData: FormData) {
  'use server'

  const username = String(formData.get('username') ?? '').trim()
  const password = String(formData.get('password') ?? '')
  const next = safeNextPath(String(formData.get('next') ?? '/admin'))

  const expectedUser = getRequiredEnv('ADMIN_DASHBOARD_USERNAME')
  const expectedPass = getRequiredEnv('ADMIN_DASHBOARD_PASSWORD')

  if (username !== expectedUser || password !== expectedPass) {
    redirect(`/admin/login?next=${encodeURIComponent(next)}&error=${encodeURIComponent('Invalid username or password.')}`)
  }

  const token = createAdminSessionToken({ username, ttlMs: 1000 * 60 * 60 * 12 })

  ;(await cookies()).set('admin_session', token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/admin',
    maxAge: 60 * 60 * 12,
  })

  redirect(next)
}

export default async function AdminLoginPage({
  searchParams,
}: {
  searchParams?: Promise<Record<string, string | string[] | undefined>>
}) {
  const sp = (await searchParams) ?? {}
  const next = typeof sp.next === 'string' ? safeNextPath(sp.next) : '/admin'
  const error = typeof sp.error === 'string' ? sp.error : undefined

  return (
    <main className="min-h-screen flex items-center justify-center px-6">
      <div className="w-full max-w-md rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden">
        <div className="px-6 py-5 border-b border-gray-200">
          <div className="font-heading text-xl font-semibold text-primary">Admin</div>
          <p className="mt-1 text-sm text-body">Sign in to view admin dashboard.</p>
        </div>

        <form className="px-6 py-5 space-y-4" action={signIn}>
          <input type="hidden" name="next" value={next} />

          <div>
            <label
              htmlFor="admin-username"
              className="block text-xs font-semibold text-secondary uppercase tracking-wide"
            >
              Username
            </label>
            <input
              id="admin-username"
              name="username"
              autoComplete="username"
              required
              className="mt-2 w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm text-primary placeholder:text-secondary focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]"
            />
          </div>

          <div>
            <label
              htmlFor="admin-password"
              className="block text-xs font-semibold text-secondary uppercase tracking-wide"
            >
              Password
            </label>
            <input
              id="admin-password"
              name="password"
              type="password"
              autoComplete="current-password"
              required
              className="mt-2 w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm text-primary placeholder:text-secondary focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]"
            />
          </div>

          {error ? (
            <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          ) : null}

          <button
            type="submit"
            className="w-full rounded-xl bg-[var(--color-accent)] px-4 py-3 text-sm font-semibold text-white"
          >
            Sign in
          </button>
        </form>
      </div>
    </main>
  )
}

