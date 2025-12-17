import { ResourcesPageClient } from '@/components/resources/ResourcesPageClient'
import { PageLayout } from '@/components/layout/PageLayout'
import { getProfile, getResources } from '@/lib/content/loader.server'

export default async function ResourcesPage() {
  const resources = getResources()
  const profile = getProfile()

  return (
    <PageLayout profile={profile}>
      <ResourcesPageClient initialResources={resources} />
    </PageLayout>
  )
}

