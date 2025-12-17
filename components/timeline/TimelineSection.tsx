'use client'

import { motion } from 'framer-motion'
import Image from 'next/image'
import Link from 'next/link'
import type { TimelineEvent } from '@/lib/content/types'
import { Label } from '@/components/ui/Label'

interface TimelineSectionProps {
  event: TimelineEvent
  index: number
}

export function TimelineSection({ event }: TimelineSectionProps) {
  const formatDate = (date: string) => {
    const [year, month] = date.split('-')
    return `${new Date(parseInt(year), parseInt(month) - 1).toLocaleString('default', { month: 'short' })} ${year}`
  }

  const dateRange = event.endDate
    ? `${formatDate(event.startDate)} - ${formatDate(event.endDate)}`
    : `${formatDate(event.startDate)} - Present`

  const eventColor = event.color ?? '#4A67FF'

  return (
    <li className="relative pl-10 sm:pl-14 py-10">
      {/* Timeline node */}
      <span
        className="absolute left-2 sm:left-3 top-14 w-3.5 h-3.5 rounded-full border-2 bg-white"
        style={{ borderColor: eventColor }}
        aria-hidden="true"
      />

      {/* Entry */}
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.35 }}
        transition={{ duration: 0.55, ease: [0.25, 0.1, 0.25, 1] }}
        className="grid grid-cols-1 lg:grid-cols-[minmax(0,720px)_minmax(0,1fr)] gap-8 lg:gap-12 items-start"
      >
        <div className="bg-white rounded-lg border border-gray-200 p-6 sm:p-8 shadow-sm">
          <div className="text-secondary text-xs sm:text-sm mb-3">
            {dateRange}
          </div>

          <h3 className="font-heading text-2xl sm:text-3xl font-semibold text-primary mb-3">
            {event.company}
          </h3>

          <h4 className="font-heading text-lg sm:text-xl font-medium text-primary mb-4">
            {event.role}
          </h4>

          <p className="text-body text-base leading-relaxed mb-6">
            {event.description}
          </p>

          <div className="flex flex-wrap gap-2 mb-6">
            {event.tags.map((tag) => (
              <Label key={tag}>{tag}</Label>
            ))}
          </div>

          {/* Optional links: add more links/resources here */}
          {event.projectLinks && event.projectLinks.length > 0 && (
            <div className="space-y-2">
              <Label variant="accent">Related Projects:</Label>
              <div className="flex flex-wrap gap-3">
                {event.projectLinks.map((projectId) => (
                  <Link
                    key={projectId}
                    href={`/projects/${projectId}`}
                    className="text-accent hover:underline text-sm sm:text-base font-medium"
                  >
                    View Project →
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Optional image placeholder (desktop). Add additional images/media here. */}
        <div className="hidden lg:block">
          <div className="relative w-full aspect-[4/3] rounded-lg overflow-hidden bg-gray-100 border border-gray-200">
            {event.image ? (
              <Image
                src={event.image}
                alt={`${event.company} image`}
                fill
                className="object-contain p-10"
              />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center text-secondary text-sm">
                Image placeholder
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </li>
  )
}

