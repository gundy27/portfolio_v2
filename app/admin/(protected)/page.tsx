type SessionItem = {
  id: string
  user_id: string
  created_at: string
  last_activity: string
  message_count: number
  metadata?: unknown
}

type MessageItem = {
  id: string
  role: 'user' | 'assistant' | string
  content: string
  timestamp: string
  model?: string | null
  tokens_used?: number | null
  cost_usd?: number | null
  sources?: unknown
  metadata?: unknown
}

function getServerEnv(name: string, fallbackName?: string) {
  const v = process.env[name] ?? (fallbackName ? process.env[fallbackName] : undefined)
  return v?.trim() ? v : undefined
}

function fmtTs(iso: string) {
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return iso
  return d.toLocaleString()
}

async function fetchJson<T>(url: string, init: RequestInit): Promise<T> {
  const res = await fetch(url, init)
  if (!res.ok) {
    const txt = await res.text().catch(() => '')
    throw new Error(`Request failed (${res.status}): ${txt}`.trim())
  }
  return (await res.json()) as T
}

export default async function AdminDashboardPage({
  searchParams,
}: {
  searchParams?: Promise<Record<string, string | string[] | undefined>>
}) {
  const sp = (await searchParams) ?? {}

  const userId = (typeof sp.user_id === 'string' && sp.user_id.trim()) ? sp.user_id.trim() : 'gundy_io_public'
  const sessionId = typeof sp.session_id === 'string' ? sp.session_id : undefined

  const apiBase =
    getServerEnv('RAG_API_URL') ??
    getServerEnv('NEXT_PUBLIC_RAG_API_URL') ??
    ''

  if (!apiBase) {
    throw new Error('Missing RAG_API_URL (or NEXT_PUBLIC_RAG_API_URL) for admin dashboard.')
  }

  const adminKey =
    getServerEnv('RAG_ADMIN_API_KEY') ??
    getServerEnv('ADMIN_API_KEY') ??
    getServerEnv('NEXT_PUBLIC_ADMIN_API_KEY')

  const headers: HeadersInit = adminKey ? { 'X-Admin-Key': adminKey } : {}

  let sessionsError: string | null = null
  let messagesError: string | null = null
  let sessions: SessionItem[] = []
  let messages: MessageItem[] = []

  try {
    const data = await fetchJson<{ sessions: SessionItem[] }>(
      `${apiBase}/admin/sessions?user_id=${encodeURIComponent(userId)}&limit=100&offset=0`,
      { headers, cache: 'no-store' },
    )
    sessions = Array.isArray(data.sessions) ? data.sessions : []
  } catch (e) {
    sessionsError = e instanceof Error ? e.message : String(e)
  }

  if (sessionId) {
    try {
      const data = await fetchJson<{ messages: MessageItem[] }>(
        `${apiBase}/admin/sessions/${encodeURIComponent(sessionId)}/messages?limit=200&offset=0`,
        { headers, cache: 'no-store' },
      )
      messages = Array.isArray(data.messages) ? data.messages : []
    } catch (e) {
      messagesError = e instanceof Error ? e.message : String(e)
    }
  }

  return (
    <main className="grid grid-cols-1 lg:grid-cols-[360px_1fr] gap-6">
      <section className="rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-200">
          <div className="font-heading text-base font-semibold text-primary">Sessions</div>
          <p className="mt-1 text-xs text-secondary">
            From <span className="font-mono">{apiBase}</span>
          </p>
        </div>

        <div className="px-5 py-4 border-b border-gray-200">
          <form action="/admin" method="get" className="flex gap-3 items-end">
            <div className="flex-1">
              <label
                htmlFor="admin-user-id"
                className="block text-xs font-semibold text-secondary uppercase tracking-wide"
              >
                user_id
              </label>
              <input
                id="admin-user-id"
                name="user_id"
                defaultValue={userId}
                className="mt-2 w-full rounded-xl border border-gray-300 bg-white px-3 py-2 text-sm text-primary placeholder:text-secondary focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]"
              />
            </div>

            <button
              type="submit"
              className="rounded-xl bg-[var(--color-accent)] px-4 py-2 text-sm font-semibold text-white"
            >
              Load
            </button>
          </form>
        </div>

        <div className="px-2 py-2 max-h-[70vh] overflow-y-auto">
          {sessionsError ? (
            <div className="m-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {sessionsError}
            </div>
          ) : null}

          {sessions.length === 0 && !sessionsError ? (
            <div className="m-3 rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-body">
              No sessions found.
            </div>
          ) : null}

          <ul className="space-y-1">
            {sessions.map((s) => {
              const active = s.id === sessionId
              const href = `/admin?user_id=${encodeURIComponent(userId)}&session_id=${encodeURIComponent(s.id)}`
              return (
                <li key={s.id}>
                  <a
                    href={href}
                    className={[
                      'block rounded-xl border px-4 py-3',
                      active ? 'border-[var(--color-accent)] bg-[rgba(89,131,146,0.08)]' : 'border-transparent hover:border-gray-200 hover:bg-gray-50',
                    ].join(' ')}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div className="font-mono text-xs text-secondary truncate">{s.id}</div>
                      <div className="shrink-0 text-xs text-secondary">{s.message_count} msgs</div>
                    </div>
                    <div className="mt-2 text-xs text-body">
                      <div>
                        <span className="text-secondary">Last:</span> {fmtTs(s.last_activity)}
                      </div>
                      <div className="mt-1">
                        <span className="text-secondary">Created:</span> {fmtTs(s.created_at)}
                      </div>
                    </div>
                  </a>
                </li>
              )
            })}
          </ul>
        </div>
      </section>

      <section className="rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-200 flex items-center justify-between gap-4">
          <div>
            <div className="font-heading text-base font-semibold text-primary">Messages</div>
            <p className="mt-1 text-xs text-secondary">
              {sessionId ? (
                <>
                  session_id <span className="font-mono">{sessionId}</span>
                </>
              ) : (
                'Select a session to view messages.'
              )}
            </p>
          </div>

          {sessionId ? (
            <a
              href={`/admin?user_id=${encodeURIComponent(userId)}`}
              className="text-xs font-semibold text-[var(--color-accent-dark)] hover:underline"
            >
              Clear
            </a>
          ) : null}
        </div>

        <div className="px-5 py-4 max-h-[70vh] overflow-y-auto">
          {messagesError ? (
            <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {messagesError}
            </div>
          ) : null}

          {!sessionId ? (
            <div className="rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-body">
              Pick a session on the left.
            </div>
          ) : null}

          {sessionId && messages.length === 0 && !messagesError ? (
            <div className="rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-body">
              No messages found.
            </div>
          ) : null}

          <div className="space-y-3">
            {messages.map((m) => {
              const isUser = m.role === 'user'
              return (
                <div key={m.id} className={isUser ? 'flex justify-end' : 'flex justify-start'}>
                  <div
                    className={[
                      'max-w-[900px] w-full rounded-2xl px-4 py-3 text-sm leading-relaxed border',
                      isUser ? 'bg-[var(--color-accent)] text-white border-transparent' : 'bg-gray-50 text-primary border-gray-200',
                    ].join(' ')}
                  >
                    <div className="flex items-center justify-between gap-3 text-xs opacity-90">
                      <div className="font-semibold uppercase tracking-wide">{m.role}</div>
                      <div className="shrink-0">{fmtTs(m.timestamp)}</div>
                    </div>
                    <div className="mt-2 whitespace-pre-wrap">{m.content}</div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </section>
    </main>
  )
}

