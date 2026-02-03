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

function Markdown({ content, inverse }: { content: string; inverse?: boolean }) {
  const pClassName = inverse ? 'text-white leading-relaxed mb-4' : 'text-body leading-relaxed mb-4'
  const listClassName = inverse
    ? 'list-disc list-outside mb-4 ml-6 space-y-2 text-white'
    : 'list-disc list-outside mb-4 ml-6 space-y-2 text-body'
  const orderedListClassName = inverse
    ? 'list-decimal list-outside mb-4 ml-6 space-y-2 text-white'
    : 'list-decimal list-outside mb-4 ml-6 space-y-2 text-body'
  const liClassName = inverse ? 'text-white' : 'text-body'
  const aClassName = inverse ? 'text-white hover:underline' : 'text-accent hover:underline'
  const strongClassName = inverse ? 'font-semibold text-white' : 'font-semibold text-primary'

  return (
    <div
      className={[
        'prose prose-lg max-w-none',
        'prose-headings:font-heading',
        inverse
          ? 'prose-invert prose-headings:text-white prose-p:text-white prose-strong:text-white prose-a:text-white'
          : 'prose-headings:text-primary prose-p:text-body prose-strong:text-primary prose-a:text-accent',
        'prose-p:leading-relaxed prose-a:no-underline hover:prose-a:underline prose-img:rounded-lg prose-img:my-8',
      ].join(' ')}
    >
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
            return <p className={pClassName}>{props.children}</p>
          },
          ul: ({ node, ...props }: ComponentPropsWithoutRef<'ul'> & { node?: unknown }) => (
            <ul className={listClassName}>{props.children}</ul>
          ),
          ol: ({ node, ...props }: ComponentPropsWithoutRef<'ol'> & { node?: unknown }) => (
            <ol className={orderedListClassName}>{props.children}</ol>
          ),
          li: ({ node, ...props }: ComponentPropsWithoutRef<'li'> & { node?: unknown }) => (
            <li className={liClassName}>{props.children}</li>
          ),
          a: ({ node, ...props }: ComponentPropsWithoutRef<'a'> & { node?: unknown }) => (
            <a className={aClassName} {...props} />
          ),
          strong: ({ node, ...props }: ComponentPropsWithoutRef<'strong'> & { node?: unknown }) => (
            <strong className={strongClassName}>{props.children}</strong>
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
    const highlightBullets = section.bullets?.length ? (
      <BulletList items={section.bullets} className="text-white" itemClassName="text-white" />
    ) : null

    const highlightChecklist =
      section.checklist?.length ? (
        <div className="space-y-3">
          {section.checklist.map((item, idx) => (
            <ChecklistItem
              key={`${idx}-${item}`}
              iconClassName="text-white"
              textClassName="text-white"
            >
              {item}
            </ChecklistItem>
          ))}
        </div>
      ) : null

    const highlightMarkdown = section.content ? <Markdown content={section.content} inverse /> : null
    const highlightBottomLine = section.bottomLine ? <Markdown content={section.bottomLine} /> : null

    return (
      <HighlightSection bottomLine={highlightBottomLine}>
        <div className="space-y-6">
          {section.label && section.heading ? (
            <SectionHeader
              label={section.label}
              heading={section.heading}
              className="text-white"
              labelClassName="text-accent-light"
              headingClassName="text-white"
            />
          ) : null}
          {highlightBullets}
          {highlightChecklist}
          {highlightMarkdown}
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

