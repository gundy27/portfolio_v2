import Link from 'next/link'
import { notFound } from 'next/navigation'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { GetInTouch } from '@/components/layout/GetInTouch'
import type { ProjectSection as ProjectSectionType } from '@/lib/content/types'
import { getNextProject, getPreviousProject, getProject, getProjectContent } from '@/lib/content/loader.server'
import { ProjectHero } from '@/components/projects/ProjectHero'
import { ProjectMeta } from '@/components/projects/ProjectMeta'
import { MetricsRow } from '@/components/projects/MetricsRow'
import { ProjectSection } from '@/components/projects/ProjectSection'

interface ProjectPageProps {
  params: Promise<{ slug: string }>
}

export default async function ProjectPage({ params }: ProjectPageProps) {
  const { slug } = await params
  const project = getProject(slug)
  const content = project ? getProjectContent(slug) : null
  if (!project) {
    notFound()
  }

  const previousProject = getPreviousProject(slug)
  const nextProject = getNextProject(slug)
  const sections: ProjectSectionType[] =
    project.sections?.length
      ? project.sections
      : content
        ? [{ id: 'content', type: 'full-width', content }]
        : []
  
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1">
        <div className="container-wide pb-16">
          <ProjectHero
            label={project.label ?? project.tags[0] ?? 'PROJECT'}
            title={project.title}
            description={project.description}
            tags={project.tags}
            image={project.thumbnail}
            imageAlt={project.title}
            externalUrl={project.url}
          />

          <ProjectMeta
            role={project.meta?.role}
            company={project.meta?.company ?? project.company}
            timeline={project.meta?.timeline ?? (project.year ? `${project.year}` : undefined)}
            proudOf={project.meta?.proudOf}
            learned={project.meta?.learned}
          />

          {project.metrics?.length ? (
            <section className="subsection-spacing">
              <MetricsRow metrics={project.metrics} />
            </section>
          ) : null}

          {sections.length ? (
            <div className="pt-2">
              {sections.map((section) => (
                <ProjectSection key={section.id} section={section} />
              ))}
            </div>
          ) : null}

          {(previousProject || nextProject) && (
            <nav aria-label="Project navigation" className="mt-12 sm:mt-16 pt-8 border-t border-gray-200">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {previousProject ? (
                  <Link
                    href={`/projects/${previousProject.id}`}
                    className="group rounded-lg border border-gray-200 bg-transparent p-5 hover:border-gray-300 hover:bg-transparent transition-colors"
                  >
                    <div className="text-xs font-medium tracking-wide text-secondary mb-2">
                      ← Previous Project
                    </div>
                    <div className="font-heading text-lg font-semibold text-primary group-hover:text-accent transition-colors">
                      {previousProject.title}
                    </div>
                  </Link>
                ) : (
                  <div className="hidden sm:block" />
                )}

                {nextProject && (
                  <Link
                    href={`/projects/${nextProject.id}`}
                    className="group rounded-lg border border-gray-200 bg-transparent p-5 hover:border-gray-300 hover:bg-transparent transition-colors sm:text-right"
                  >
                    <div className="text-xs font-medium tracking-wide text-secondary mb-2">
                      Next Project →
                    </div>
                    <div className="font-heading text-lg font-semibold text-primary group-hover:text-accent transition-colors">
                      {nextProject.title}
                    </div>
                  </Link>
                )}
              </div>
            </nav>
          )}
        </div>
      </main>
      
      <GetInTouch />
      <Footer />
    </div>
  )
}

