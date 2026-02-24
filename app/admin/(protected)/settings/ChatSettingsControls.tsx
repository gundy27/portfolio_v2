"use client"

import * as React from "react"

export function ChatSettingsControls({
  initialTopK,
  initialModel,
  initialStreaming,
}: {
  initialTopK: number
  initialModel: string
  initialStreaming: boolean
}) {
  const [topK, setTopK] = React.useState<number>(initialTopK)
  const [model, setModel] = React.useState<string>(initialModel)
  const [streaming, setStreaming] = React.useState<boolean>(initialStreaming)

  return (
    <div className="space-y-6">
      <div>
        <label className="block text-xs font-semibold text-secondary uppercase tracking-wide">
          Language model
        </label>
        <input
          value={model}
          onChange={(e) => setModel(e.target.value)}
          className="mt-2 w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm text-primary placeholder:text-secondary focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]"
          list="chat-model-suggestions"
          placeholder="gpt-4o-mini"
        />
        <datalist id="chat-model-suggestions">
          <option value="gpt-4o-mini" />
          <option value="gpt-4o" />
        </datalist>
        <input type="hidden" name="model" value={model} />
      </div>

      <div>
        <div className="flex items-end justify-between gap-4">
          <label className="block text-xs font-semibold text-secondary uppercase tracking-wide">
            Context chunks (Top K)
          </label>
          <div className="text-xs text-secondary">
            <span className="font-mono text-primary">{topK}</span>
          </div>
        </div>

        <input
          type="range"
          min={1}
          max={20}
          value={topK}
          onChange={(e) => setTopK(Number(e.target.value))}
          className="mt-3 w-full"
        />
        <div className="mt-2 flex items-center justify-between text-xs text-secondary">
          <span>1 (faster)</span>
          <span>20 (more context)</span>
        </div>
        <input type="hidden" name="top_k" value={topK} />
      </div>

      <div className="flex items-start gap-3">
        <input
          id="chat-streaming"
          type="checkbox"
          checked={streaming}
          onChange={(e) => setStreaming(e.target.checked)}
          className="mt-1 h-4 w-4 rounded border-gray-300"
        />
        <div className="flex-1">
          <label
            htmlFor="chat-streaming"
            className="block text-xs font-semibold text-secondary uppercase tracking-wide"
          >
            Enable streaming responses
          </label>
          <p className="mt-1 text-sm text-body">
            When enabled, the website chatbot uses Server-Sent Events for better perceived performance.
          </p>
        </div>
        <input type="hidden" name="streaming" value={streaming ? "true" : "false"} />
      </div>
    </div>
  )
}

