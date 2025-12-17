'use client'

import { TimelineHeader } from '@/components/timeline/TimelineHeader'
import { TimelineSection } from '@/components/timeline/TimelineSection'
import type { TimelineEvent } from '@/lib/content/types'

interface TimelinePageClientProps {
  events: TimelineEvent[]
}

export function TimelinePageClient({ events }: TimelinePageClientProps) {
  return (
    <div className="container-wide">
      <div className="text-center">
        <TimelineHeader />
      </div>

      <div className="mt-16 relative">
        {/* Subtle vertical timeline line */}
        <div className="absolute left-2 sm:left-3 top-0 bottom-0 w-px bg-gray-200" aria-hidden="true" />

        {events.length > 0 ? (
          <ul>
            {events.map((event, index) => (
              <TimelineSection key={event.id} event={event} index={index} />
            ))}
          </ul>
        ) : (
          <div className="text-center text-secondary py-24">
            <p>No timeline events yet. Add events to `content/timeline/events.json`.</p>
          </div>
        )}
      </div>
    </div>
  )
}

