'use client'

import * as React from 'react'
import Image from 'next/image'
import { AnimatePresence, motion } from 'framer-motion'
import { Button } from '@/components/ui/Button'
import type { TimelineAnchor, TimelineYear } from '@/lib/content/types'

type TimelineStickyProps = {
  years: readonly TimelineYear[]
}

type FlatAnchor = {
  year: number
  anchor: TimelineAnchor
}

export function TimelineSticky({ years }: TimelineStickyProps) {
  const [activeIndex, setActiveIndex] = React.useState(0)
  const anchorRefs = React.useRef<Array<HTMLElement | null>>([])

  const flatAnchors = React.useMemo<FlatAnchor[]>(() => {
    const out: FlatAnchor[] = []
    years.forEach((y) => {
      y.anchors.forEach((a) => {
        out.push({ year: y.year, anchor: a })
      })
    })
    return out
  }, [years])

  React.useEffect(() => {
    const getNodes = () => anchorRefs.current.filter(Boolean) as HTMLElement[]

    const pickClosestToCenter = () => {
      const nodes = getNodes()
      if (!nodes.length) return

      const viewportCenter = window.innerHeight / 2
      let bestIdx = 0
      let bestDistance = Number.POSITIVE_INFINITY

      for (const node of nodes) {
        const rect = node.getBoundingClientRect()
        // Only consider items that are at least partially on screen.
        if (rect.bottom <= 0 || rect.top >= window.innerHeight) continue
        const nodeCenter = rect.top + rect.height / 2
        const dist = Math.abs(nodeCenter - viewportCenter)
        if (dist < bestDistance) {
          bestDistance = dist
          const idx = Number((node as HTMLElement).dataset.index)
          if (Number.isFinite(idx)) bestIdx = idx
        }
      }

      setActiveIndex((prev) => (prev === bestIdx ? prev : bestIdx))
    }

    // Extra fallback: some layouts/browsers can be finicky; keep index in sync on scroll.
    let raf = 0
    const onScroll = () => {
      if (raf) return
      raf = window.requestAnimationFrame(() => {
        raf = 0
        pickClosestToCenter()
      })
    }

    let observer: IntersectionObserver | null = null
    let initRaf = 0

    const init = () => {
      const nodes = getNodes()
      if (!nodes.length) {
        initRaf = window.requestAnimationFrame(init)
        return
      }

      observer = new IntersectionObserver(
        (observerEntries) => {
          const visible = observerEntries
            .filter((e) => e.isIntersecting)
            .map((e) => {
              const idx = Number((e.target as HTMLElement).dataset.index)
              const rect = e.boundingClientRect
              const distanceToCenter = Math.abs(rect.top + rect.height / 2 - window.innerHeight / 2)
              return { idx, ratio: e.intersectionRatio, distanceToCenter }
            })
            .sort((a, b) => b.ratio - a.ratio || a.distanceToCenter - b.distanceToCenter)

          if (visible[0] && Number.isFinite(visible[0].idx)) {
            setActiveIndex(visible[0].idx)
            return
          }

          // Fallback: if nothing is intersecting within our “center band”, pick the closest.
          pickClosestToCenter()
        },
        {
          root: null,
          rootMargin: '-35% 0px -55% 0px',
          threshold: [0.15, 0.3, 0.5, 0.7],
        }
      )

      nodes.forEach((n) => {
        observer?.observe(n)
      })

      window.addEventListener('scroll', onScroll, { passive: true })
      window.addEventListener('resize', onScroll, { passive: true })
      // Prime initial state.
      onScroll()
    }

    init()

    return () => {
      if (initRaf) window.cancelAnimationFrame(initRaf)
      if (observer) observer.disconnect()
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
      if (raf) window.cancelAnimationFrame(raf)
    }
  }, [])

  const safeActiveIndex = Math.min(Math.max(activeIndex, 0), Math.max(flatAnchors.length - 1, 0))
  const active = flatAnchors[safeActiveIndex]

  if (!years.length || !flatAnchors.length) return null

  return (
    <section className="mt-20">
      <div className="grid gap-12 md:grid-cols-2 md:gap-16">
        {/* Left: timeline */}
        <div className="relative">
          {/* Single vertical timeline line */}
          <div
            className="absolute left-4 sm:left-6 lg:left-8 -translate-x-1/2 top-0 bottom-0 w-px bg-gray-200"
            aria-hidden="true"
          />

          <ul className="space-y-0">
            {(() => {
              let runningIndex = -1
              const lastYear = years[years.length - 1]?.year

              return years.map((yearBlock) => {
                const isBottomYear = yearBlock.year === lastYear

                return (
                  <li key={yearBlock.year} className="relative">
                    <div
                      className="relative pl-10 sm:pl-12 lg:pl-14 pt-8 pb-2"
                      id={isBottomYear ? 'timeline-bottom' : undefined}
                    >
                      <span
                        className="absolute left-4 sm:left-6 lg:left-8 -translate-x-1/2 top-10 w-4 h-4 rounded-full border-2 bg-white border-gray-200"
                        aria-hidden="true"
                      />
                      <div className="font-heading text-lg sm:text-xl font-semibold text-primary">
                        {yearBlock.year}
                      </div>
                    </div>

                    {yearBlock.anchors.map((anchor) => {
                      runningIndex += 1
                      const flatIndex = runningIndex

                      return (
                        <article
                          key={anchor.id}
                          ref={(el) => {
                            anchorRefs.current[flatIndex] = el
                          }}
                          data-index={flatIndex}
                          className="relative pl-10 sm:pl-12 lg:pl-14 py-16 sm:py-20 lg:py-24 min-h-[60vh] scroll-mt-28"
                        >
                          <motion.div
                            initial={{ opacity: 0, y: 18 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ amount: 0.25, margin: '-10% 0px -55% 0px' }}
                            transition={{ duration: 0.5, ease: 'easeOut' }}
                            className="max-w-[48rem]"
                          >
                            {anchor.type ? (
                              <div className="text-accent text-xs sm:text-sm mb-3 font-label uppercase tracking-wider">
                                {anchor.type}
                              </div>
                            ) : null}

                            <h3 className="font-heading text-2xl sm:text-3xl lg:text-4xl font-semibold text-primary mb-4">
                              {anchor.title}
                            </h3>

                            {anchor.description ? (
                              <p className="text-body text-base sm:text-lg leading-relaxed mb-8">{anchor.description}</p>
                            ) : null}

                            {anchor.projectLink ? (
                              <Button asChild href={`/projects/${anchor.projectLink}`} variant="secondary" size="sm">
                                View project
                              </Button>
                            ) : null}
                          </motion.div>
                        </article>
                      )
                    })}
                  </li>
                )
              })
            })()}
          </ul>
        </div>

        {/* Right: sticky image/details */}
        <div className="md:sticky md:top-24 md:self-start">
          <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
            <div className="relative aspect-[4/3] w-full bg-gray-50">
              <AnimatePresence mode="wait" initial={false}>
                <motion.div
                  key={`${active.year}-${active.anchor.id}`}
                  className="absolute inset-0"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.25 }}
                >
                  {active.anchor.imageUrl ? (
                    <Image
                      src={active.anchor.imageUrl}
                      alt={active.anchor.title}
                      fill
                      className="object-contain p-10"
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center text-secondary text-sm">
                      Image placeholder
                    </div>
                  )}
                </motion.div>
              </AnimatePresence>
            </div>

            <div className="space-y-1 p-5">
              <p className="text-xs font-label uppercase tracking-wider text-secondary">{active.year}</p>
              <p className="text-base font-heading font-semibold text-primary">{active.anchor.title}</p>
              {active.anchor.imageDescription ? (
                <p className="text-sm text-secondary">{active.anchor.imageDescription}</p>
              ) : null}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

