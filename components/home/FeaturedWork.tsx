'use client'

import { useEffect, useId, useMemo, useRef, useState } from 'react'
import Link from 'next/link'
import { ChevronDown } from 'lucide-react'
import { SectionHeader } from '@/components/ui/SectionHeader'
import { FeaturedWorkCard } from '@/components/ui/FeaturedWorkCard'
import type { Project } from '@/lib/content/types'

type FeaturedWorkItem = {
  id: string
  label: string
  title: string
  description: string
  skills: string[]
  image?: string
  imageAlt?: string
}

export function FeaturedWork({ projects }: { projects: Project[] }) {
  const items: FeaturedWorkItem[] = useMemo(
    () =>
      projects.map((project) => ({
        id: project.id,
        label: project.label ?? 'PROJECT',
        title: project.title,
        description: project.description,
        skills: project.tags,
        image: project.thumbnail,
        imageAlt: project.title,
      })),
    [projects]
  )

  const regionId = useId()
  const [expanded, setExpanded] = useState(false)
  const [collapsedHeight, setCollapsedHeight] = useState<number | null>(null)
  const [expandedHeight, setExpandedHeight] = useState<number | null>(null)

  const listRef = useRef<HTMLDivElement>(null)
  const card1Ref = useRef<HTMLDivElement>(null)
  const card2Ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const measureHeights = () => {
      const listEl = listRef.current
      const c1 = card1Ref.current
      const c2 = card2Ref.current
      if (!listEl || !c1) return

      const cardHeight = c1.getBoundingClientRect().height
      const listHeight = listEl.scrollHeight

      const styles = window.getComputedStyle(listEl)
      const paddingTop = Number.parseFloat(styles.paddingTop || '0') || 0
      const paddingBottom = Number.parseFloat(styles.paddingBottom || '0') || 0

      let gap = 24
      if (c2) {
        const r1 = c1.getBoundingClientRect()
        const r2 = c2.getBoundingClientRect()
        gap = Math.max(0, r2.top - r1.top - r1.height)
      }

      // 2 full cards + half of the 3rd, accounting for gaps between cards.
      // Include list padding so borders/shadows have room and don't get clipped by overflow-hidden.
      const computedCollapsed = paddingTop + paddingBottom + cardHeight * 2.5 + gap * 2

      setCollapsedHeight(computedCollapsed)
      setExpandedHeight(listHeight)
    }

    measureHeights()

    const ro = new ResizeObserver(() => measureHeights())
    if (listRef.current) ro.observe(listRef.current)
    if (card1Ref.current) ro.observe(card1Ref.current)
    if (card2Ref.current) ro.observe(card2Ref.current)

    window.addEventListener('resize', measureHeights)
    return () => {
      ro.disconnect()
      window.removeEventListener('resize', measureHeights)
    }
  }, [])

  const maxHeight = expanded ? expandedHeight : collapsedHeight

  return (
    <section className="section-spacing-large">
      <div className="floating-section">
        <div className="floating-section__content">
          <div className="space-y-10">
            <SectionHeader
              label="FEATURED"
              heading="Work"
              headingLevel="h2"
              className="items-center text-center"
              labelClassName="text-center"
              headingClassName="text-center"
            />

            <div className="relative">
              <div
                id={regionId}
                className="relative overflow-hidden transition-[max-height] duration-500 ease-out"
                style={{ maxHeight: maxHeight ?? undefined }}
              >
                <div
                  ref={listRef}
                  className="flex flex-col gap-6 px-3 pt-2 pb-6 sm:px-4 sm:pt-3 sm:pb-8"
                >
                  {items.map((item, idx) => (
                    <div
                      key={`${item.label}-${item.title}`}
                      ref={idx === 0 ? card1Ref : idx === 1 ? card2Ref : undefined}
                    >
                      <Link
                        href={`/projects/${item.id}`}
                        className="block rounded-[var(--radius-card)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent)] focus-visible:ring-offset-2 focus-visible:ring-offset-white"
                        aria-label={`View project: ${item.title}`}
                      >
                        <FeaturedWorkCard
                          label={item.label}
                          title={item.title}
                          description={item.description}
                          skills={item.skills}
                          image={item.image}
                          imageAlt={item.imageAlt}
                          className="transition-transform duration-200 ease-out hover:scale-[1.01]"
                        />
                      </Link>
                    </div>
                  ))}
                </div>

                {!expanded ? (
                  <div
                    className="pointer-events-none absolute inset-x-0 bottom-0 h-28"
                    style={{
                      background:
                        'linear-gradient(to bottom, rgba(255,255,255,0) 0%, rgba(255,255,255,1) 70%)',
                    }}
                    aria-hidden="true"
                  />
                ) : null}
              </div>

              <div className="mt-6 flex justify-center">
                <button
                  type="button"
                  className="inline-flex items-center justify-center rounded-full border border-gray-200 bg-white p-3 shadow-sm transition-transform duration-200 ease-out hover:scale-[1.03]"
                  aria-controls={regionId}
                  aria-expanded={expanded}
                  onClick={() => setExpanded((v) => !v)}
                >
                  <ChevronDown
                    className={`h-5 w-5 text-secondary transition-transform duration-300 ease-out ${
                      expanded ? 'rotate-180' : 'rotate-0'
                    }`}
                    aria-hidden="true"
                  />
                  <span className="sr-only">{expanded ? 'Collapse featured work' : 'Expand featured work'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

