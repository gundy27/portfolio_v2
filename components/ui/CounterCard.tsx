'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { cn } from '@/lib/utils/cn'

export interface CounterCardProps {
  start: number
  stop: number
  label: string
  durationMs?: number
  format?: (value: number) => string
  className?: string
}

function defaultFormat(value: number) {
  return Math.round(value).toString()
}

export function CounterCard({
  start,
  stop,
  label,
  durationMs = 1600,
  format,
  className,
}: CounterCardProps) {
  const cardRef = useRef<HTMLDivElement>(null)
  const [hasAnimated, setHasAnimated] = useState(false)
  const [displayValue, setDisplayValue] = useState(start)

  const formatter = useMemo(() => format ?? defaultFormat, [format])

  useEffect(() => {
    // Keep display in sync if props change before animation triggers.
    if (!hasAnimated) setDisplayValue(start)
  }, [start, hasAnimated])

  useEffect(() => {
    const el = cardRef.current
    if (!el) return

    const prefersReduced =
      typeof window !== 'undefined' &&
      window.matchMedia &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches

    if (prefersReduced) {
      setDisplayValue(stop)
      setHasAnimated(true)
      return
    }

    let rafId: number | null = null
    let didStart = false

    const animate = () => {
      if (didStart) return
      didStart = true
      setHasAnimated(true)

      const from = start
      const to = stop
      const startTs = performance.now()

      const tick = (now: number) => {
        const t = Math.min(1, (now - startTs) / durationMs)
        const value = from + (to - from) * t
        setDisplayValue(value)
        if (t < 1) rafId = window.requestAnimationFrame(tick)
      }

      rafId = window.requestAnimationFrame(tick)
    }

    const io = new IntersectionObserver(
      (entries) => {
        const entry = entries[0]
        if (!entry) return
        if (entry.isIntersecting && !hasAnimated) {
          animate()
          io.disconnect()
        }
      },
      { threshold: 0.35 }
    )

    io.observe(el)

    return () => {
      io.disconnect()
      if (rafId != null) window.cancelAnimationFrame(rafId)
    }
  }, [start, stop, durationMs, hasAnimated])

  return (
    <div
      ref={cardRef}
      className={cn('bg-white text-center', className)}
      style={{
        borderRadius: 'var(--radius-card-sm)',
        border: '1px solid rgba(17, 17, 17, 0.10)',
        boxShadow: '0 2px 10px rgba(17, 17, 17, 0.06)',
        padding: '1.25rem 1.25rem',
      }}
    >
      <div className="font-heading font-semibold text-3xl sm:text-4xl text-[var(--color-text-primary)]">
        {formatter(displayValue)}
      </div>
      <div className="mt-2 font-label text-xs text-[var(--color-text-primary)]/70">
        {label}
      </div>
    </div>
  )
}

