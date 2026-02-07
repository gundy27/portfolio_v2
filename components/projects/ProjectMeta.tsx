'use client'

import * as React from 'react'
import TextType from '@/components/ui/TextType'
import { cn } from '@/lib/utils/cn'

export interface ProjectMetaProps {
  role?: string
  company?: string
  timeline?: string
  proudOf?: string
  learned?: string
  className?: string
}

type MetaItem = { label: string; value: string }

function MetaRow({
  label,
  value,
  state,
  startOnVisible,
  onComplete,
}: {
  label: string
  value: string
  state: 'pending' | 'active' | 'done'
  startOnVisible?: boolean
  onComplete?: () => void
}) {
  if (!value) return null

  return (
    <div className="grid grid-cols-[140px_minmax(0,1fr)] gap-4 sm:grid-cols-[180px_minmax(0,1fr)]">
      <div className="text-sm font-medium text-primary">{label}</div>
      <div className="min-w-0 text-sm text-secondary break-words">
        {state === 'done' ? (
          <span>{value}</span>
        ) : state === 'active' ? (
          <TextType
            as="span"
            text={value}
            multiline
            typingSpeed={12}
            deletingSpeed={0}
            pauseDuration={0}
            initialDelay={0}
            loop={false}
            showCursor={false}
            startOnVisible={startOnVisible}
            onSentenceComplete={onComplete ? () => onComplete() : undefined}
          />
        ) : (
          // Reserve space so layout doesn't shift, but keep text hidden until typed.
          <span className="opacity-0 select-none" aria-hidden="true">
            {value}
          </span>
        )}
      </div>
    </div>
  )
}

export function ProjectMeta({ role, company, timeline, proudOf, learned, className }: ProjectMetaProps) {
  const items: MetaItem[] = React.useMemo(() => {
    const out: MetaItem[] = []
    if (role) out.push({ label: 'Role', value: role })
    if (company) out.push({ label: 'Company', value: company })
    if (timeline) out.push({ label: 'Timeline', value: timeline })
    if (proudOf) out.push({ label: "Why I'm Proud of It", value: proudOf })
    if (learned) out.push({ label: 'Learned', value: learned })
    return out
  }, [role, company, timeline, proudOf, learned])

  const [activeIndex, setActiveIndex] = React.useState(0)

  if (!items.length) return null

  return (
    <section className={cn('subsection-spacing', className)}>
      <div className="inset-panel">
        <div className="space-y-4">
          {items.map((item, idx) => {
            const state: 'pending' | 'active' | 'done' =
              idx < activeIndex ? 'done' : idx === activeIndex ? 'active' : 'pending'
            const startOnVisible = idx === 0

            return (
              <MetaRow
                key={item.label}
                label={item.label}
                value={item.value}
                state={state}
                startOnVisible={startOnVisible}
                onComplete={
                  idx === activeIndex
                    ? () => setActiveIndex((prev) => Math.min(prev + 1, items.length))
                    : undefined
                }
              />
            )
          })}
        </div>
      </div>
    </section>
  )
}

