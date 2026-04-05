"use client"

import * as React from "react"
import Image from "next/image"
import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"
import { ArrowUp, ChevronDown } from "lucide-react"

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

function MarkdownMessage({ content }: { content: string }) {
  return (
    <div className="space-y-3 [&_p]:leading-relaxed [&_p]:text-[var(--color-text-body)] [&_p]:text-sm [&_p]:break-words [&_a]:text-[var(--color-accent)] hover:[&_a]:underline">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          p: ({ children }) => <p className="m-0">{children}</p>,
          strong: ({ children }) => <strong className="font-semibold text-[var(--color-text-primary)]">{children}</strong>,
          em: ({ children }) => <em className="italic">{children}</em>,
          ul: ({ children }) => <ul className="list-disc list-outside pl-5 space-y-1">{children}</ul>,
          ol: ({ children }) => <ol className="list-decimal list-outside pl-5 space-y-1">{children}</ol>,
          li: ({ children }) => <li className="text-[var(--color-text-body)]">{children}</li>,
          blockquote: ({ children }) => (
            <blockquote className="border-l-2 border-gray-200 pl-3 text-[var(--color-text-secondary)]">{children}</blockquote>
          ),
          hr: () => <hr className="border-gray-200" />,
          a: ({ children, ...props }) => (
            <a {...props} className="text-[var(--color-accent)] underline-offset-2">
              {children}
            </a>
          ),
          code: ({ children, ...props }) =>
            "inline" in props && props.inline ? (
              <code className="rounded bg-gray-100 px-1 py-0.5 font-mono text-[0.85em] text-[var(--color-text-primary)]">
                {children}
              </code>
            ) : (
              <code className="font-mono text-xs text-gray-100">{children}</code>
            ),
          pre: ({ children }) => (
            <pre className="overflow-x-auto rounded-lg bg-gray-900 p-3 leading-relaxed">{children}</pre>
          ),
          table: ({ children }) => (
            <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white">
              <table className="w-full border-collapse text-sm">{children}</table>
            </div>
          ),
          thead: ({ children }) => <thead className="bg-gray-50">{children}</thead>,
          th: ({ children }) => (
            <th className="border-b border-gray-200 px-3 py-2 text-left text-xs font-semibold text-[var(--color-text-primary)]">
              {children}
            </th>
          ),
          td: ({ children }) => (
            <td className="border-b border-gray-100 px-3 py-2 align-top text-sm text-[var(--color-text-body)]">{children}</td>
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  )
}

function newId(prefix: string) {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return `${prefix}_${crypto.randomUUID()}`
  }
  return `${prefix}_${Math.random().toString(16).slice(2)}${Date.now().toString(16)}`
}

export function ChatWidget({
  apiUrl,
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
  const [hasSubmitted, setHasSubmitted] = React.useState(false)
  const [apiStatus, setApiStatus] = React.useState<"unknown" | "ok" | "degraded" | "unhealthy">("unknown")
  const scrollContainerRef = React.useRef<HTMLDivElement>(null)

  // biome-ignore lint/correctness/useExhaustiveDependencies: intentional scroll trigger
  React.useEffect(() => {
    const el = scrollContainerRef.current
    if (el) el.scrollTop = el.scrollHeight
  }, [messages, streamingText])

  // Single shared user_id so the knowledge base and message logs are queryable/admin-viewable.
  const userId = process.env.NEXT_PUBLIC_CHATBOT_USER_ID ?? "gundy_io_public"

  React.useEffect(() => {
    let cancelled = false
    const poll = async () => {
      try {
        const res = await fetch(`${baseUrl}/health`, { cache: "no-store" })
        if (cancelled) return
        if (!res.ok) { setApiStatus("unhealthy"); return }
        const data = (await res.json()) as { status?: string }
        if (cancelled) return
        const s = data.status
        if (s === "ok" || s === "healthy") setApiStatus("ok")
        else if (s === "degraded") setApiStatus("degraded")
        else setApiStatus("unhealthy")
      } catch {
        if (!cancelled) setApiStatus("unhealthy")
      }
    }
    void poll()
    const id = setInterval(poll, 30_000)
    return () => { cancelled = true; clearInterval(id) }
  }, [baseUrl])

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

      setHasSubmitted(true)
      setIsSending(true)
      setInput("")
      setStreamingText("")
      setStreamingSources(undefined)

      setMessages((prev) => [...prev, { id: newId("msg"), role: "user", content: message }])

      const effectiveTopK = chatSettings?.top_k ?? 12
      const effectiveModel = chatSettings?.model ?? "gpt-4o-mini"
      const effectiveStreaming = chatSettings?.streaming ?? true

      if (!effectiveStreaming) {
        const response = await fetch(`${baseUrl}/chat`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            message,
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
    [baseUrl, chatSettings, sessionId, streamingSources, streamingText, userId],
  )

  const onSubmit: React.FormEventHandler = (e) => {
    e.preventDefault()
    void sendMessage(input)
  }

  return (
    <section
      className={[
        "rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden",
        "flex flex-col",
        hasSubmitted ? "h-[600px] max-h-[80vh]" : "min-h-[420px]",
      ].join(" ")}
    >
      <div ref={scrollContainerRef} className="flex-1 min-h-0 px-5 py-4 space-y-4 overflow-y-auto">
        <div className="sticky top-0 z-10 flex items-center gap-1.5 text-[10px] text-gray-400 pointer-events-none select-none">
          <span
            className={`inline-block h-1.5 w-1.5 rounded-full ${
              apiStatus === "ok"
                ? "bg-green-500"
                : apiStatus === "degraded"
                  ? "bg-yellow-500"
                  : "bg-red-500"
            }`}
          />
          API Service
        </div>
        {messages.map((m) => (
          <div key={m.id} className={m.role === "user" ? "flex justify-end" : "flex justify-start"}>
            <div
              className={[
                "max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed",
                m.role === "user"
                  ? "bg-[var(--color-accent-dark)] text-white"
                  : "bg-gray-50 border border-gray-200 text-primary",
              ].join(" ")}
            >
              {m.role === "assistant" ? (
                <MarkdownMessage content={m.content} />
              ) : (
                <div className="whitespace-pre-wrap break-words">{m.content}</div>
              )}
              {m.role === "assistant" && m.sources?.length ? (
                <details className="mt-3 pt-3 border-t border-gray-200 group">
                  <summary className="cursor-pointer list-none select-none text-xs font-semibold text-secondary uppercase tracking-wide focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent)] rounded">
                    <div className="flex items-center justify-between gap-3">
                      <span>Sources ({Math.min(m.sources.length, 3)})</span>
                      <span className="inline-flex items-center gap-2">
                        <ChevronDown
                          className="h-4 w-4 text-secondary transition-transform duration-200 group-open:rotate-180"
                          aria-hidden="true"
                        />
                        <span className="sr-only">Toggle sources</span>
                      </span>
                    </div>
                  </summary>
                  <div className="mt-2 space-y-2">
                    {m.sources.slice(0, 3).map((s, i) => (
                      <details
                        key={`${s.chunk_id}-${i}`}
                        className="rounded-lg border border-gray-200 bg-white p-2"
                      >
                        <summary className="cursor-pointer list-none select-none focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent)] rounded">
                          <div className="flex items-center justify-between gap-3">
                            <div className="min-w-0">
                              <div className="text-xs font-medium text-primary truncate">
                                {s.reference ? s.reference : s.chunk_id}
                              </div>
                              <div className="text-[10px] text-secondary">
                                Citation {i + 1} • Similarity {Math.round(s.score * 100)}%
                              </div>
                            </div>
                            <div className="shrink-0 text-[10px] text-secondary">Show</div>
                          </div>
                        </summary>

                        {s.text ? (
                          <div className="mt-2 rounded-md bg-gray-50 border border-gray-200 p-2 text-xs text-[var(--color-text-body)] whitespace-pre-wrap break-words max-h-48 overflow-y-auto">
                            {s.text}
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
                      </details>
                    ))}
                  </div>
                </details>
              ) : null}
            </div>
          </div>
        ))}

        {isSending && streamingText ? (
          <div className="flex justify-start">
            <div className="max-w-[85%] rounded-2xl px-4 py-3 text-sm bg-gray-50 border border-gray-200 text-primary">
              <MarkdownMessage content={streamingText} />
            </div>
          </div>
        ) : null}

      </div>

      <form onSubmit={onSubmit} className="mt-auto px-4 sm:px-5 py-4 border-t border-gray-200 bg-white">
        <div className="flex min-w-0 items-center gap-2 sm:gap-3">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask a question about my work experience"
            className="flex-1 min-w-0 rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm text-primary placeholder:text-secondary focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]"
            disabled={isSending}
          />
          <button
            type="submit"
            aria-label="Send message"
            className={[
              "inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-[var(--color-accent-dark)] bg-[var(--color-accent-dark)] text-white",
              "transition-colors hover:bg-[var(--color-accent)]",
              "focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent)]",
              "disabled:cursor-not-allowed disabled:opacity-50 disabled:text-gray-500 disabled:hover:bg-[var(--color-accent-dark)]",
            ].join(" ")}
            disabled={isSending || !input.trim()}
          >
            <ArrowUp className="h-4 w-4" aria-hidden="true" />
            <span className="sr-only">Send</span>
          </button>
        </div>
        <div className="mt-2 text-xs text-secondary">
          Tip: Start with high level questions first and drill down from there. If the answer says it can&apos;t find anything relevant, it is not in the knowledge base. Try a different question or ask me directly{" "}
          <a
            href="https://mail.google.com/mail/?view=cm&fs=1&to=dan@gundy.io&su=Intro"
            target="_blank"
            rel="noopener noreferrer"
            className="underline text-[var(--color-accent)] hover:text-[var(--color-accent-dark)]"
          >
            here
          </a>
          .
        </div>
      </form>
    </section>
  )
}

