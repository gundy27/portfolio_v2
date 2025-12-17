import { isValidElement } from 'react'
import Image from 'next/image'
import { notFound } from 'next/navigation'
import ReactMarkdown, { type Components } from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { PageLayout } from '@/components/layout/PageLayout'
import { SectionHeader } from '@/components/ui/SectionHeader'
import { getProject, getProjectContent, getProfile } from '@/lib/content/loader.server'

const markdownComponents: Components = {
  img: ({ src, alt }) => {
    const safeSrc = typeof src === 'string' ? src : ''
    const safeAlt = typeof alt === 'string' ? alt : ''
    if (!safeSrc) return null

    return (
      <figure className="my-8">
        <Image src={safeSrc} alt={safeAlt} width={1200} height={800} className="w-full h-auto rounded-lg" />
      </figure>
    )
  },
  h1: ({ children }) => (
    <h1 className="font-heading text-4xl font-semibold text-primary mt-12 mb-6 space-before-h1">{children}</h1>
  ),
  h2: ({ children }) => (
    <h2 className="font-heading text-3xl font-semibold text-primary mt-10 mb-5 space-before-h2">{children}</h2>
  ),
  h3: ({ children }) => (
    <h3 className="font-heading text-2xl font-medium text-primary mt-8 mb-4 space-before-h3">{children}</h3>
  ),
  h4: ({ children }) => (
    <h4 className="font-heading text-xl font-medium text-primary mt-6 mb-3 space-before-h4">{children}</h4>
  ),
  p: ({ children }) => {
    // Check if paragraph contains only a figure (image)
    const isOnlyFigure = isValidElement(children) && children.type === 'figure'
    const isOnlyFigureInArray =
      Array.isArray(children) &&
      children.length === 1 &&
      isValidElement(children[0]) &&
      children[0].type === 'figure'

    // If paragraph only contains a figure, don't wrap it in <p>
    if (isOnlyFigure || isOnlyFigureInArray) {
      return <>{children}</>
    }

    return <p className="text-body leading-relaxed mb-4">{children}</p>
  },
  ul: ({ children }) => (
    <ul className="list-disc list-outside mb-4 ml-6 space-y-2 text-body">{children}</ul>
  ),
  ol: ({ children }) => (
    <ol className="list-decimal list-outside mb-4 ml-6 space-y-2 text-body">{children}</ol>
  ),
  li: ({ children }) => <li className="text-body">{children}</li>,
  code: ({ node, inline, children, ...props }) =>
    inline ? (
      <code className="bg-gray-100 px-2 py-1 rounded text-sm font-mono text-primary" {...props}>
        {children}
      </code>
    ) : (
      <pre className="bg-gray-100 p-4 rounded-lg text-sm font-mono overflow-x-auto mb-4">
        <code {...props}>{children}</code>
      </pre>
    ),
  blockquote: ({ children }) => (
    <blockquote className="border-l-4 border-accent pl-4 italic text-secondary my-4">{children}</blockquote>
  ),
  a: ({ node, children, ...props }) => (
    <a className="text-accent hover:underline" {...props}>
      {children}
    </a>
  ),
  strong: ({ children }) => <strong className="font-semibold text-primary">{children}</strong>,
  em: ({ children }) => <em className="italic">{children}</em>,
}

interface ProjectPageProps {
  params: { slug: string }
}

export default async function ProjectPage({ params }: ProjectPageProps) {
  const { slug } = params
  const project = getProject(slug)
  const content = project ? getProjectContent(slug) : null
  const profile = getProfile()
  
  if (!project) {
    notFound()
  }
  
  return (
    <PageLayout profile={profile}>
      <div>
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 sm:py-12 lg:py-16">
          {/* Hero Image - Full Width */}
          <div className="relative aspect-video mb-8 sm:mb-12 lg:mb-16 overflow-hidden bg-gray-100 rounded-lg">
            <Image
              src={project.thumbnail}
              alt={project.title}
              fill
              className="object-cover"
            />
          </div>
          
          {/* Two Column Layout */}
          <div className="relative mt-8 sm:mt-12 lg:mt-16">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
              {/* Left Column - Content */}
              <div className="relative">
                <div className="text-block space-before-h2">
                  <SectionHeader
                    label={project.tags[0] || 'PROJECT'}
                    heading={project.title}
                    headingLevel="h1"
                  />
                  
                  <div className="space-y-4 mb-8 text-secondary">
                    {project.company && <p><strong>Company:</strong> {project.company}</p>}
                    <p><strong>Time:</strong> {project.year}</p>
                    <div>
                      <strong>Labels:</strong>{' '}
                      {project.tags.map((tag, i) => (
                        <span key={tag}>
                          {tag}{i < project.tags.length - 1 ? ', ' : ''}
                        </span>
                      ))}
                    </div>
                  </div>
                  
                  {content && (
                    <div className="prose prose-lg max-w-none prose-headings:font-heading prose-headings:text-primary prose-p:text-body prose-p:leading-relaxed prose-a:text-accent prose-a:no-underline hover:prose-a:underline prose-img:rounded-lg prose-img:my-8 prose-strong:text-primary">
                      <ReactMarkdown
                        remarkPlugins={[remarkGfm]}
                        components={markdownComponents}
                      >
                        {content}
                      </ReactMarkdown>
                    </div>
                  )}
                  
                  {project.url && (
                    <div className="mt-8">
                      <a
                        href={project.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-accent hover:underline"
                      >
                        Visit Project →
                      </a>
                    </div>
                  )}
                </div>
              </div>
              
              {/* Right Column - Project Images (hidden on small screens) */}
              <div className="hidden lg:block">
                <div className="sticky top-32 space-y-6">
                  {/* Project Image 1 */}
                  <div className="relative aspect-video w-full overflow-hidden bg-gray-100 rounded-lg">
                    <div className="absolute inset-0 flex items-center justify-center text-secondary">
                      <p className="text-sm">Project Image 1</p>
                    </div>
                  </div>
                  
                  {/* Project Image 2 */}
                  <div className="relative aspect-video w-full overflow-hidden bg-gray-100 rounded-lg">
                    <div className="absolute inset-0 flex items-center justify-center text-secondary">
                      <p className="text-sm">Project Image 2</p>
                    </div>
                  </div>
                  
                  {/* Project Image 3 */}
                  <div className="relative aspect-video w-full overflow-hidden bg-gray-100 rounded-lg">
                    <div className="absolute inset-0 flex items-center justify-center text-secondary">
                      <p className="text-sm">Project Image 3</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </PageLayout>
  )
}

