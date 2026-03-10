"use client"

import * as React from "react"
import Image from "next/image"

type SourceChunk = {
  chunk_id: string
  score: number
  text?: string | null
  reference?: string | null
  image?: string | null
}

type MetadataEvent = { type: "metadata"; session_id: string; sources: SourceChunk[] }
type ContentEvent = { type: "content"; delta: string }
type DoneEvent = { type: "done"; tokens_used: number; cost_usd: number; processing_time_ms: number }
type ErrorEvent = { type: "error"; message: string }
type SSEvent = MetadataEvent | ContentEvent | DoneEvent | ErrorEvent

type Message = {
  id: string
  role: "user" | "assistant"
  content: string
  sources?: SourceChunk[]
}

type ChatSettings = {
  top_k: number
  model: string
  streaming: boolean
}

type Corpus = "portfolio" | "podcasts"

function newId(prefix: string) {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return `${prefix}_${crypto.randomUUID()}`
  }
  return `${prefix}_${Math.random().toString(16).slice(2)}${Date.now().toString(16)}`
}

export function ChatWidget({
  apiUrl,
  title = "Chat with my experience",
  description = "Ask about roles, projects, and the work behind them. I’ll cite the source chunk I used.",
}: {
  apiUrl?: string
  title?: string
  description?: string
}) {
  // Default to a same-origin proxy to avoid CORS and "localhost in prod" footguns.
  const baseUrl = apiUrl ?? "/api/rag"
  const [messages, setMessages] = React.useState<Message[]>([])
  const [input, setInput] = React.useState("")
  const [sessionId, setSessionId] = React.useState<string | undefined>(undefined)
  const [isSending, setIsSending] = React.useState(false)
  const [streamingText, setStreamingText] = React.useState("")
  const [streamingSources, setStreamingSources] = React.useState<SourceChunk[] | undefined>(undefined)
  const [chatSettings, setChatSettings] = React.useState<ChatSettings | null>(null)
  const [corpus, setCorpus] = React.useState<Corpus>("portfolio")

  // Single shared user_id so the knowledge base and message logs are queryable/admin-viewable.
  const userId = process.env.NEXT_PUBLIC_CHATBOT_USER_ID ?? "gundy_io_public"

  React.useEffect(() => {
    try {
      const saved = window.localStorage.getItem("gundy_chat_corpus")
      if (saved === "portfolio" || saved === "podcasts") setCorpus(saved)
    } catch {
      // ignore
    }
  }, [])

  React.useEffect(() => {
    try {
      window.localStorage.setItem("gundy_chat_corpus", corpus)
    } catch {
      // ignore
    }
  }, [corpus])

  const onChangeCorpus = React.useCallback((next: Corpus) => {
    setCorpus(next)
    setSessionId(undefined)
    setMessages([])
    setStreamingText("")
    setStreamingSources(undefined)
  }, [])

  React.useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        const res = await fetch(`${baseUrl}/settings/chat`, { cache: "no-store" })
        if (!res.ok) return
        const data = (await res.json()) as Partial<ChatSettings>
        if (cancelled) return
        if (typeof data.top_k === "number" && typeof data.model === "string" && typeof data.streaming === "boolean") {
          setChatSettings({ top_k: data.top_k, model: data.model, streaming: data.streaming })
        }
      } catch {
        // ignore: fall back to defaults
      }
    })()
    return () => {
      cancelled = true
    }
  }, [baseUrl])

  const sendMessage = React.useCallback(
    async (text: string) => {
      const message = text.trim()
      if (!message) return

      setIsSending(true)
      setInput("")
      setStreamingText("")
      setStreamingSources(undefined)

      setMessages((prev) => [...prev, { id: newId("msg"), role: "user", content: message }])

      const effectiveTopK = chatSettings?.top_k ?? 5
      const effectiveModel = chatSettings?.model ?? "gpt-4o-mini"
      const effectiveStreaming = chatSettings?.streaming ?? true

      if (!effectiveStreaming) {
        const response = await fetch(`${baseUrl}/chat`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            message,
            corpus,
            session_id: sessionId,
            user_id: userId,
            top_k: effectiveTopK,
            model: effectiveModel,
            include_sources: true,
          }),
        })

        if (!response.ok) {
          const detail = await response.text().catch(() => "")
          setMessages((prev) => [
            ...prev,
            {
              id: newId("msg"),
              role: "assistant",
              content: `Sorry — the chatbot backend returned an error (${response.status}). ${detail}`.trim(),
            },
          ])
          setIsSending(false)
          return
        }

        const data = (await response.json()) as {
          answer?: string
          session_id?: string
          sources?: SourceChunk[]
        }

        setSessionId(data.session_id)
        setMessages((prev) => [
          ...prev,
          {
            id: newId("msg"),
            role: "assistant",
            content: String(data.answer ?? "(No content returned.)"),
            sources: Array.isArray(data.sources) ? data.sources : undefined,
          },
        ])
        setIsSending(false)
        return
      }

      const response = await fetch(`${baseUrl}/chat/stream`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message,
          corpus,
          session_id: sessionId,
          user_id: userId,
          top_k: effectiveTopK,
          model: effectiveModel,
          include_sources: true,
        }),
      })

      if (!response.ok || !response.body) {
        const detail = await response.text().catch(() => "")
        setMessages((prev) => [
          ...prev,
          {
            id: newId("msg"),
            role: "assistant",
            content: `Sorry — the chatbot backend returned an error (${response.status}). ${detail}`.trim(),
          },
        ])
        setIsSending(false)
        return
      }

      const reader = response.body.getReader()
      const decoder = new TextDecoder()
      let buffer = ""
      let full = ""
      let finalSessionId: string | undefined = sessionId
      let finalSources: SourceChunk[] | undefined

      try {
        while (true) {
          const { done, value } = await reader.read()
          if (done) break
          buffer += decoder.decode(value, { stream: true })

          const lines = buffer.split("\n")
          buffer = lines.pop() ?? ""

          for (const line of lines) {
            const trimmed = line.trim()
            if (!trimmed.startsWith("data: ")) continue
            const payload = trimmed.slice(6)
            if (!payload) continue

            try {
              const raw: unknown = JSON.parse(payload)
              if (!raw || typeof raw !== "object" || !("type" in raw)) continue
              const event = raw as SSEvent

              if (event.type === "metadata") {
                finalSessionId = event.session_id
                finalSources = Array.isArray(event.sources) ? event.sources : []
                setStreamingSources(finalSources)
              } else if (event.type === "content") {
                full += String(event.delta ?? "")
                setStreamingText(full)
              } else if (event.type === "done") {
                // finalize below
              } else if (event.type === "error") {
                throw new Error(String(event.message ?? "Unknown error"))
              }
            } catch {
              // ignore partial/incomplete events
            }
          }
        }
      } catch (e) {
        const err = e instanceof Error ? e.message : String(e)
        setMessages((prev) => [
          ...prev,
          { id: newId("msg"), role: "assistant", content: `Sorry — something went wrong: ${err}` },
        ])
        return
      } finally {
        reader.releaseLock()
        setIsSending(false)
      }

      setSessionId(finalSessionId)
      setMessages((prev) => [
        ...prev,
        {
          id: newId("msg"),
          role: "assistant",
          content: full || streamingText || "(No content returned.)",
          sources: finalSources ?? streamingSources,
        },
      ])
      setStreamingText("")
      setStreamingSources(undefined)
    },
    [baseUrl, chatSettings, corpus, sessionId, streamingSources, streamingText, userId],
  )

  const onSubmit: React.FormEventHandler = (e) => {
    e.preventDefault()
    void sendMessage(input)
  }

  return (
    <section className="rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden">
      <header className="px-5 py-4 border-b border-gray-200">
        <div className="font-heading text-lg font-semibold text-primary">{title}</div>
        <p className="mt-1 text-sm text-body">{description}</p>
        <div className="mt-3 flex flex-wrap items-center gap-3">
          <div className="inline-flex rounded-xl border border-gray-200 bg-white p-1">
            <button
              type="button"
              onClick={() => onChangeCorpus("portfolio")}
              className={[
                "px-3 py-1.5 text-xs font-semibold rounded-lg",
                corpus === "portfolio"
                  ? "bg-gray-900 text-white"
                  : "text-secondary hover:text-primary",
              ].join(" ")}
            >
              Portfolio
            </button>
            <button
              type="button"
              onClick={() => onChangeCorpus("podcasts")}
              className={[
                "px-3 py-1.5 text-xs font-semibold rounded-lg",
                corpus === "podcasts"
                  ? "bg-gray-900 text-white"
                  : "text-secondary hover:text-primary",
              ].join(" ")}
            >
              Podcasts
            </button>
          </div>
          <p className="text-xs text-secondary">
            {corpus === "podcasts"
              ? "Searching Lenny’s Podcast transcripts."
              : "Searching Dan’s portfolio knowledge base."}
          </p>
        </div>
        <p className="mt-2 text-xs text-secondary">
          Backend: <span className="font-mono">{baseUrl}</span>
        </p>
      </header>

      <div className="px-5 py-4 space-y-4 max-h-[520px] overflow-y-auto">
        {messages.length === 0 ? (
          <div className="rounded-xl bg-gray-50 border border-gray-200 p-4 text-sm text-body">
            {corpus === "podcasts" ? (
              <>
                Try: “In the episode with Andrew Chen, what did he say about growth loops?” or “What frameworks did the
                guest share for prioritization?”
              </>
            ) : (
              <>
                Try: “What projects best show Dan’s pricing & packaging experience?” or “What did Dan do on
                Entitlements Management?”
              </>
            )}
          </div>
        ) : null}

        {messages.map((m) => (
          <div key={m.id} className={m.role === "user" ? "flex justify-end" : "flex justify-start"}>
            <div
              className={[
                "max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed",
                m.role === "user"
                  ? "bg-primary text-white"
                  : "bg-gray-50 border border-gray-200 text-primary",
              ].join(" ")}
            >
              <div className="whitespace-pre-wrap">{m.content}</div>
              {m.role === "assistant" && m.sources?.length ? (
                <div className="mt-3 pt-3 border-t border-gray-200">
                  <div className="text-xs font-semibold text-secondary uppercase tracking-wide">
                    Sources used
                  </div>
                  <ul className="mt-2 space-y-2">
                    {m.sources.slice(0, 5).map((s, i) => (
                      <li key={`${s.chunk_id}-${i}`} className="text-xs text-body">
                        <div className="flex items-center justify-between gap-3">
                          <div className="truncate">
                            {s.reference ? (
                              <span className="font-medium text-primary">{s.reference}</span>
                            ) : (
                              <span className="font-mono text-secondary">{s.chunk_id}</span>
                            )}
                          </div>
                          <div className="shrink-0 text-secondary">{Math.round(s.score * 100)}%</div>
                        </div>
                        {s.text ? (
                          <div className="mt-1 text-secondary">
                            {s.text.length > 240 ? `${s.text.slice(0, 240)}…` : s.text}
                          </div>
                        ) : null}
                        {s.image ? (
                          <div className="mt-2 overflow-hidden rounded-lg border border-gray-200 bg-white">
                            <Image
                              src={s.image}
                              alt={s.reference ?? "Source image"}
                              width={960}
                              height={540}
                              className="w-full h-auto"
                            />
                          </div>
                        ) : null}
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null}
            </div>
          </div>
        ))}

        {isSending && streamingText ? (
          <div className="flex justify-start">
            <div className="max-w-[85%] rounded-2xl px-4 py-3 text-sm bg-gray-50 border border-gray-200 text-primary">
              <div className="whitespace-pre-wrap">{streamingText}</div>
            </div>
          </div>
        ) : null}
      </div>

      <form onSubmit={onSubmit} className="px-5 py-4 border-t border-gray-200 bg-white">
        <div className="flex gap-3">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask a question…"
            className="flex-1 rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm text-primary placeholder:text-secondary focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]"
            disabled={isSending}
          />
          <button
            type="submit"
            className="rounded-xl bg-[var(--color-accent)] px-4 py-3 text-sm font-semibold text-white disabled:opacity-50"
            disabled={isSending || !input.trim()}
          >
            Send
          </button>
        </div>
        <div className="mt-2 text-xs text-secondary">
          Tip: If the answer says it can’t find anything relevant, add more detail or seed the knowledge base.
        </div>
      </form>
    </section>
  )
}

