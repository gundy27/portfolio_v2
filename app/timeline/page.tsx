import { TimelinePageClient } from '@/components/timeline/TimelinePageClient'
import { PageLayout } from '@/components/layout/PageLayout'
import { getProfile, getTimelineEvents } from '@/lib/content/loader.server'

export default async function TimelinePage() {
  const events = getTimelineEvents()
  const profile = getProfile()

  return (
    <PageLayout profile={profile} mainClassName="pt-24 pb-16" footerWrapperClassName="mt-24">
      <TimelinePageClient events={events} />
    </PageLayout>
  )
}
