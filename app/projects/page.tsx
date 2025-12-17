import { PageLayout } from '@/components/layout/PageLayout'
import { ProjectsPageClient } from '@/components/projects/ProjectsPageClient'
import { getProfile, getProjects } from '@/lib/content/loader.server'

export default async function ProjectsPage() {
  const projects = getProjects()
  const profile = getProfile()

  return (
    <PageLayout profile={profile}>
      <ProjectsPageClient projects={projects} />
    </PageLayout>
  )
}

