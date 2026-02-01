import { isValidElement } from 'react'
import type { ComponentPropsWithoutRef } from 'react'
import Image from 'next/image'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import type { ProjectSection as ProjectSectionType } from '@/lib/content/types'
import { SectionHeader } from '@/components/ui/SectionHeader'
import { TwoColumnSection } from '@/components/ui/TwoColumnSection'
import { FullWidthSection } from '@/components/ui/FullWidthSection'
import { HighlightSection } from '@/components/ui/HighlightSection'
import { BulletList } from '@/components/ui/BulletList'
import { ChecklistItem } from '@/components/ui/ChecklistItem'
import { MetricsRow } from '@/components/projects/MetricsRow'

function Markdown({ content }: { content: string }) {
  return (
    <div className="prose prose-lg max-w-none prose-headings:font-heading prose-headings:text-primary prose-p:text-body prose-p:leading-relaxed prose-a:text-accent prose-a:no-underline hover:prose-a:underline prose-img:rounded-lg prose-img:my-8 prose-strong:text-primary">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          img: ({ node, ...props }: ComponentPropsWithoutRef<'img'> & { node?: unknown }) => {
            const src = typeof props.src === 'string' ? props.src : ''
            const alt = typeof props.alt === 'string' ? props.alt : ''
            return (
              <figure className="my-8">
                <Image
                  src={src}
                  alt={alt}
                  width={1200}
                  height={800}
                  className="w-full h-auto rounded-lg"
                />
              </figure>
            )
          },
          p: ({ node, ...props }: ComponentPropsWithoutRef<'p'> & { node?: unknown }) => {
            // If paragraph contains only a figure, don't wrap it in <p>
            const children = props.children
            const isOnlyFigure = isValidElement(children) && children.type === 'figure'
            const isOnlyFigureInArray =
              Array.isArray(children) &&
              children.length === 1 &&
              isValidElement(children[0]) &&
              children[0].type === 'figure'
            if (isOnlyFigure || isOnlyFigureInArray) return <>{props.children}</>
            return <p className="text-body leading-relaxed mb-4">{props.children}</p>
          },
          ul: ({ node, ...props }: ComponentPropsWithoutRef<'ul'> & { node?: unknown }) => (
            <ul className="list-disc list-outside mb-4 ml-6 space-y-2 text-body">{props.children}</ul>
          ),
          ol: ({ node, ...props }: ComponentPropsWithoutRef<'ol'> & { node?: unknown }) => (
            <ol className="list-decimal list-outside mb-4 ml-6 space-y-2 text-body">{props.children}</ol>
          ),
          li: ({ node, ...props }: ComponentPropsWithoutRef<'li'> & { node?: unknown }) => (
            <li className="text-body">{props.children}</li>
          ),
          a: ({ node, ...props }: ComponentPropsWithoutRef<'a'> & { node?: unknown }) => (
            <a className="text-accent hover:underline" {...props} />
          ),
          strong: ({ node, ...props }: ComponentPropsWithoutRef<'strong'> & { node?: unknown }) => (
            <strong className="font-semibold text-primary">{props.children}</strong>
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  )
}

function SectionHeaderBlock({ section }: { section: ProjectSectionType }) {
  if (!section.label || !section.heading) return null
  return <SectionHeader label={section.label} heading={section.heading} />
}

export function ProjectSection({ section }: { section: ProjectSectionType }) {
  if (section.type === 'metrics') {
    return (
      <FullWidthSection width="wide">
        <MetricsRow metrics={section.metrics ?? []} />
      </FullWidthSection>
    )
  }

  const bullets = section.bullets?.length ? <BulletList items={section.bullets} /> : null

  const checklist =
    section.checklist?.length ? (
      <div className="space-y-3">
        {section.checklist.map((item, idx) => (
          <ChecklistItem key={`${idx}-${item}`}>{item}</ChecklistItem>
        ))}
      </div>
    ) : null

  const markdown = section.content ? <Markdown content={section.content} /> : null

  if (section.type === 'two-column') {
    return (
      <TwoColumnSection
        image={section.image}
        imageAlt={section.imageAlt}
        imagePosition={section.imagePosition ?? 'right'}
      >
        <div className="space-y-6">
          <SectionHeaderBlock section={section} />
          {bullets}
          {checklist}
          {markdown}
        </div>
      </TwoColumnSection>
    )
  }

  if (section.type === 'highlight') {
    return (
      <HighlightSection>
        <div className="space-y-6">
          {section.label && section.heading ? (
            <SectionHeader
              label={section.label}
              heading={section.heading}
              className="text-white"
              labelClassName="text-white/80"
              headingClassName="text-white"
            />
          ) : null}
          {bullets}
          {checklist}
          {markdown}
        </div>
      </HighlightSection>
    )
  }

  // full-width
  return (
    <FullWidthSection width="wide">
      <div className="space-y-6">
        <SectionHeaderBlock section={section} />
        {bullets}
        {checklist}
        {markdown}
      </div>
    </FullWidthSection>
  )
}

