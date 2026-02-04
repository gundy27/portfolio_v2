'use client'

import * as React from 'react'
import { SectionHeader } from '@/components/ui/SectionHeader'
import { EndorsementCard } from '@/components/ui/EndorsementCard'
import type { Endorsement } from '@/lib/content/types'

export { EndorsementCard } from '@/components/ui/EndorsementCard'

type TestimonialsProps = {
  endorsements: readonly Endorsement[]
}

const AUTO_SCROLL_PX_PER_SECOND = 14
const DRAG_SPEED_MULTIPLIER = 2.5

export function Testimonials({ endorsements }: TestimonialsProps) {
  const scrollerRef = React.useRef<HTMLDivElement | null>(null)
  const firstCopyRef = React.useRef<HTMLDivElement | null>(null)
  const posRef = React.useRef(0)
  const isDraggingRef = React.useRef(false)
  const dragRef = React.useRef<{ active: boolean; startX: number; startScrollLeft: number }>({
    active: false,
    startX: 0,
    startScrollLeft: 0,
  })
  const [isDragging, setIsDragging] = React.useState(false)

  React.useEffect(() => {
    if (endorsements.length === 0) return

    const el = scrollerRef.current
    const firstCopy = firstCopyRef.current
    if (!el || !firstCopy) {
      return
    }

    const prefersReduced =
      typeof window !== 'undefined' &&
      window.matchMedia &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches

    if (prefersReduced) return

    let rafId = 0
    let lastTs = performance.now()
    // Keep our own float accumulator so sub-pixel deltas accumulate.
    // `scrollLeft` effectively behaves as an integer in many browsers, so `+= 0.x` never advances.
    posRef.current = el.scrollLeft

    const tick = (now: number) => {
      const dt = Math.min(0.05, (now - lastTs) / 1000)
      lastTs = now

      const copyWidth = firstCopy.scrollWidth
      if (copyWidth > 0 && !isDraggingRef.current) {
        posRef.current += AUTO_SCROLL_PX_PER_SECOND * dt
        if (posRef.current >= copyWidth) {
          posRef.current -= copyWidth
        }
        el.scrollLeft = posRef.current
      }

      rafId = window.requestAnimationFrame(tick)
    }

    rafId = window.requestAnimationFrame(tick)
    return () => {
      window.cancelAnimationFrame(rafId)
    }
  }, [endorsements.length])

  if (!endorsements.length) return null

  const onPointerDown: React.PointerEventHandler<HTMLElement> = (e) => {
    if (e.button !== 0) return
    const el = scrollerRef.current
    if (!el) return

    // Don’t hijack interactions on the LinkedIn button.
    const target = e.target
    if (target instanceof Element && target.closest('a')) return

    isDraggingRef.current = true
    setIsDragging(true)
    dragRef.current.active = true
    dragRef.current.startX = e.clientX
    dragRef.current.startScrollLeft = el.scrollLeft
    posRef.current = el.scrollLeft

    el.setPointerCapture(e.pointerId)
  }

  const onWheel: React.WheelEventHandler<HTMLElement> = (e) => {
    // Keep vertical page scroll from affecting the marquee state, but still respect
    // intentional horizontal scrolling (trackpads / shift+wheel).
    const isHorizontalIntent =
      Math.abs(e.deltaX) > Math.abs(e.deltaY) || e.shiftKey || e.deltaX !== 0
    if (!isHorizontalIntent) return

    const el = scrollerRef.current
    if (!el) return

    // Let the browser perform the scroll, then sync our animation position.
    window.requestAnimationFrame(() => {
      posRef.current = el.scrollLeft
    })
  }

  const onPointerMove: React.PointerEventHandler<HTMLElement> = (e) => {
    const el = scrollerRef.current
    if (!el) return
    if (!dragRef.current.active) return

    // Prevent text selection while dragging.
    e.preventDefault()

    const dx = (e.clientX - dragRef.current.startX) * DRAG_SPEED_MULTIPLIER
    const next = dragRef.current.startScrollLeft - dx
    el.scrollLeft = next
    posRef.current = next
  }

  const endDrag: React.PointerEventHandler<HTMLElement> = (e) => {
    const el = scrollerRef.current
    if (!el) return
    if (!dragRef.current.active) return

    dragRef.current.active = false
    isDraggingRef.current = false
    setIsDragging(false)

    try {
      el.releasePointerCapture(e.pointerId)
    } catch {
      // no-op
    }
  }

  return (
    <section className="section-spacing-large">
      <div className="floating-section floating-section--transparent">
        <div className="floating-section__content">
          <SectionHeader
            label="ENDORSEMENTS"
            heading="From Industry Experts"
            headingLevel="h2"
          />

          <div className="mt-8">
            <section
              ref={scrollerRef}
              className={`overflow-x-auto select-none touch-pan-y scrollbar-hide ${
                isDragging ? 'cursor-grabbing' : 'cursor-grab'
              }`}
              style={{
                scrollbarWidth: 'none', /* Firefox */
                msOverflowStyle: 'none', /* IE/Edge */
              }}
              aria-label="Endorsements carousel"
              onPointerDown={onPointerDown}
              onWheel={onWheel}
              onPointerMove={onPointerMove}
              onPointerUp={endDrag}
              onPointerCancel={endDrag}
              onPointerLeave={endDrag}
            >
              <div className="flex w-max gap-6">
                <div ref={firstCopyRef} className="flex w-max gap-6">
                  {endorsements.map((endorsement) => (
                    <EndorsementCard key={endorsement.id} endorsement={endorsement} />
                  ))}
                </div>
                <div className="flex w-max gap-6" aria-hidden="true">
                  {endorsements.map((endorsement) => (
                    <EndorsementCard key={`${endorsement.id}-dup`} endorsement={endorsement} />
                  ))}
                </div>
              </div>
            </section>
          </div>
        </div>
      </div>
    </section>
  )
}

