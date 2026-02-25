import { redirect } from "next/navigation"

import { ChatSettingsControls } from "./ChatSettingsControls"

type ChatSettings = {
  top_k: number
  model: string
  streaming: boolean
}

function getServerEnv(name: string, fallbackName?: string) {
  const v = process.env[name] ?? (fallbackName ? process.env[fallbackName] : undefined)
  return v?.trim() ? v : undefined
}

function getApiConfig() {
  const apiBase =
    getServerEnv("RAG_API_URL") ??
    getServerEnv("NEXT_PUBLIC_RAG_API_URL") ??
    ""

  const adminKey =
    getServerEnv("RAG_ADMIN_API_KEY") ??
    getServerEnv("ADMIN_API_KEY") ??
    getServerEnv("NEXT_PUBLIC_ADMIN_API_KEY")

  if (!apiBase) {
    throw new Error("Missing RAG_API_URL (or NEXT_PUBLIC_RAG_API_URL) for admin settings.")
  }

  return { apiBase, adminKey }
}

async function fetchJson<T>(url: string, init: RequestInit): Promise<T> {
  const res = await fetch(url, init)
  if (!res.ok) {
    const txt = await res.text().catch(() => "")
    throw new Error(`Request failed (${res.status}): ${txt}`.trim())
  }
  return (await res.json()) as T
}

async function updateChatSettings(formData: FormData) {
  "use server"

  const topKRaw = String(formData.get("top_k") ?? "")
  const model = String(formData.get("model") ?? "").trim() || "gpt-4o-mini"
  const streamingRaw = String(formData.get("streaming") ?? "true")

  const topK = Math.max(1, Math.min(20, Number.parseInt(topKRaw, 10) || 5))
  const streaming = streamingRaw === "true"

  const { apiBase, adminKey } = getApiConfig()
  if (!adminKey) {
    throw new Error("Missing RAG_ADMIN_API_KEY (or ADMIN_API_KEY) for admin settings updates.")
  }

  await fetchJson<ChatSettings>(`${apiBase}/admin/settings/chat`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      "X-Admin-Key": adminKey,
    },
    body: JSON.stringify({ top_k: topK, model, streaming }),
    cache: "no-store",
  })

  redirect("/admin/settings?saved=1")
}

export default async function AdminSettingsPage({
  searchParams,
}: {
  searchParams?: Promise<Record<string, string | string[] | undefined>>
}) {
  const sp = (await searchParams) ?? {}
  const saved = sp.saved === "1"

  const { apiBase, adminKey } = getApiConfig()
  const headers: HeadersInit = adminKey ? { "X-Admin-Key": adminKey } : {}

  let error: string | null = null
  let settings: ChatSettings = { top_k: 5, model: "gpt-4o-mini", streaming: true }

  try {
    settings = await fetchJson<ChatSettings>(`${apiBase}/admin/settings/chat`, {
      headers,
      cache: "no-store",
    })
  } catch (e) {
    error = e instanceof Error ? e.message : String(e)
  }

  return (
    <main className="max-w-3xl">
      <div className="rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden">
        <div className="px-6 py-5 border-b border-gray-200">
          <div className="font-heading text-xl font-semibold text-primary">Chat settings</div>
          <p className="mt-1 text-sm text-body">
            These settings affect the public chatbot experience on the site.
          </p>
          <p className="mt-2 text-xs text-secondary">
            Source API: <span className="font-mono">{apiBase}</span>
          </p>
        </div>

        <div className="px-6 py-5">
          {saved ? (
            <div className="mb-5 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800">
              Settings saved.
            </div>
          ) : null}

          {error ? (
            <div className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          ) : null}

          <form action={updateChatSettings} className="space-y-6">
            <ChatSettingsControls
              initialTopK={settings.top_k}
              initialModel={settings.model}
              initialStreaming={settings.streaming}
            />

            <div className="pt-2 flex items-center justify-end gap-3">
              <button
                type="submit"
                className="rounded-xl bg-[var(--color-accent)] px-5 py-3 text-sm font-semibold text-white"
              >
                Save settings
              </button>
            </div>
          </form>
        </div>
      </div>
    </main>
  )
}

