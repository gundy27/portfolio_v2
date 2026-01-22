import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { GetInTouch } from '@/components/layout/GetInTouch'
import { TimelineHeader } from '@/components/timeline/TimelineHeader'
import { TimelineSticky } from '@/components/timeline/TimelineSticky'
import { getTimelineYears } from '@/lib/content/loader.server'

export default function TimelinePage() {
  const years = getTimelineYears()

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1 pt-24 pb-16">
        <TimelineHeader />

        <div className="container-wide">
          {years.length === 0 ? (
            <div className="mt-16 text-center text-secondary">
              <p>No timeline entries yet. Add events to the content file to get started.</p>
            </div>
          ) : (
            <TimelineSticky years={years} />
          )}
        </div>
      </main>

      <GetInTouch />
      <Footer />
    </div>
  )
}
