import Image from 'next/image'
import Link from 'next/link'
import ReactMarkdown from 'react-markdown'
import { SectionHeader } from '@/components/ui/SectionHeader'
import { cn } from '@/lib/utils/cn'

export interface ProjectHeroProps {
  label: string
  title: string
  description?: string
  tags?: string[]
  image: string
  imageAlt?: string
  externalUrl?: string
  className?: string
}

function TagPill({ children }: { children: string }) {
  return (
    <span className="inline-flex items-center rounded-full border border-gray-200 bg-white px-3 py-1 font-label text-xs text-secondary">
      {children}
    </span>
  )
}

export function ProjectHero({
  label,
  title,
  description,
  tags = [],
  image,
  imageAlt,
  externalUrl,
  className,
}: ProjectHeroProps) {
  const media = (
    <div className="relative w-full overflow-hidden rounded-lg">
      <Image
        src={image}
        alt={imageAlt ?? title}
        width={1200}
        height={900}
        className="w-full h-auto"
        sizes="(min-width: 1024px) 50vw, 100vw"
        priority
      />
    </div>
  )

  return (
    <section className={cn('pt-20 sm:pt-24 lg:pt-28', className)}>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-start">
        <div className="w-full text-left">
          <div className="mb-4">
            <Link href="/" className="text-secondary hover:text-accent font-label text-xs">
              ← Back to Home
            </Link>
          </div>
          <SectionHeader label={label} heading={title} headingLevel="h1" />

          {/* On small screens, show media between title and description */}
          <div className="lg:hidden mb-3">{media}</div>

          {description ? (
            <div className="text-secondary text-lg mb-5 [&_strong]:font-semibold [&_strong]:text-primary">
              <ReactMarkdown
                components={{
                  p: ({ children }) => <span className="inline">{children}</span>,
                }}
              >
                {description}
              </ReactMarkdown>
            </div>
          ) : null}

          {tags.length ? (
            <div className="flex flex-wrap gap-2">
              {tags.map((t) => (
                <TagPill key={t}>{t}</TagPill>
              ))}
            </div>
          ) : null}

          {externalUrl ? (
            <div className="mt-6">
              <a
                href={externalUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-accent hover:underline font-label text-xs"
              >
                Visit Project →
              </a>
            </div>
          ) : null}
        </div>

        {/* On large screens, keep media in the right column */}
        <div className="hidden lg:block">{media}</div>
      </div>
    </section>
  )
}

