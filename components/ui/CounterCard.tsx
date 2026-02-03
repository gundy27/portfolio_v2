'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { cn } from '@/lib/utils/cn'

export type CounterCardVariant = 'default' | 'dark-accent'

export interface CounterCardProps {
  start: number
  stop: number
  label: string
  durationMs?: number
  format?: (value: number) => string
  /** Optional helper characters after the numeric value (e.g. "+", "%", "x"). */
  valueSuffix?: React.ReactNode
  /** Optional className for the suffix span (defaults to same size as value). */
  valueSuffixClassName?: string
  /** Visual variant: default (white card) or dark-accent (accent background, white number, light grey label). */
  variant?: CounterCardVariant
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
  valueSuffix,
  valueSuffixClassName,
  variant = 'default',
  className,
}: CounterCardProps) {
  const cardRef = useRef<HTMLDivElement>(null)
  const hasAnimatedRef = useRef(false)
  const [displayValue, setDisplayValue] = useState(start)

  const formatter = useMemo(() => format ?? defaultFormat, [format])

  useEffect(() => {
    // Keep display in sync if props change before animation triggers.
    if (!hasAnimatedRef.current) setDisplayValue(start)
  }, [start])

  useEffect(() => {
    const el = cardRef.current
    if (!el) return

    const prefersReduced =
      typeof window !== 'undefined' &&
      window.matchMedia &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches

    if (prefersReduced) {
      setDisplayValue(stop)
      hasAnimatedRef.current = true
      return
    }

    let rafId: number | null = null
    let didStart = false

    const animate = () => {
      if (didStart) return
      didStart = true
      hasAnimatedRef.current = true

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
        if (entry.isIntersecting && !hasAnimatedRef.current) {
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
  }, [start, stop, durationMs])

  const isDark = variant === 'dark-accent'

  return (
    <div
      ref={cardRef}
      className={cn(
        'text-center',
        isDark
          ? 'bg-[var(--color-accent-dark)]'
          : 'bg-white',
        className
      )}
      style={{
        borderRadius: 'var(--radius-card-sm)',
        border: isDark ? 'none' : '1px solid rgba(17, 17, 17, 0.10)',
        boxShadow: isDark ? '0 2px 10px rgba(0, 0, 0, 0.15)' : '0 2px 10px rgba(17, 17, 17, 0.06)',
        padding: '1.25rem 1.25rem',
      }}
    >
      <div
        className={cn(
          'font-heading font-semibold text-3xl sm:text-4xl whitespace-nowrap flex items-baseline justify-center',
          isDark ? 'text-white' : 'text-[var(--color-accent-dark)]'
        )}
      >
        <span>{formatter(displayValue)}</span>
        {valueSuffix != null ? (
          <span className={cn('ml-0.5', valueSuffixClassName)}>{valueSuffix}</span>
        ) : null}
      </div>
      <div
        className={cn(
          'mt-2 font-label text-xs',
          isDark ? 'text-white/70' : 'text-[var(--color-text-primary)]/70'
        )}
      >
        {label}
      </div>
    </div>
  )
}

