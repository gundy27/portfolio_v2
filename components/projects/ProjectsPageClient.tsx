'use client'

import { useMemo, useState } from 'react'
import { ProjectsHeader } from '@/components/projects/ProjectsHeader'
import { ProjectFilters } from '@/components/projects/ProjectFilters'
import { ProjectGrid } from '@/components/projects/ProjectGrid'
import type { Project } from '@/lib/content/types'

type FilterType = 'all' | 'paid' | 'personal'

interface ProjectsPageClientProps {
  projects: Project[]
}

export function ProjectsPageClient({ projects }: ProjectsPageClientProps) {
  const [activeFilter, setActiveFilter] = useState<FilterType>('all')

  const filteredProjects = useMemo(() => {
    if (activeFilter === 'all') return projects
    return projects.filter((p) => p.type === activeFilter)
  }, [projects, activeFilter])

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 sm:py-12 lg:py-16">
      <ProjectsHeader />
      <ProjectFilters activeFilter={activeFilter} onFilterChange={setActiveFilter} />
      <ProjectGrid projects={filteredProjects} />
    </div>
  )
}

