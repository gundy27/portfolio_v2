import Image from 'next/image'
import { cn } from '@/lib/utils/cn'

export interface ContentCardSectionProps {
  children: React.ReactNode
  imagePosition?: 'left' | 'right'
  image?: string
  imageAlt?: string
  media?: React.ReactNode
  className?: string
  innerClassName?: string
  contentClassName?: string
  mediaClassName?: string
  imageClassName?: string
  contentCardClassName?: string
}

/**
 * A two-column section where only the content area is in a white "card"
 * and the media/image floats on the page background with a drop shadow.
 */
export function ContentCardSection({
  children,
  imagePosition = 'right',
  image,
  imageAlt = '',
  media,
  className,
  innerClassName,
  contentClassName,
  mediaClassName,
  imageClassName,
  contentCardClassName,
}: ContentCardSectionProps) {
  const mediaNode =
    media ??
    (image ? (
      <Image
        src={image}
        alt={imageAlt}
        width={1200}
        height={900}
        className={cn('w-full h-auto image-drop-shadow', imageClassName)}
        sizes="(min-width: 1024px) 50vw, 100vw"
      />
    ) : null)

  const contentNode = (
    <div className={cn('w-full min-w-0', contentClassName)}>
      <div
        className={cn(
          'rounded-2xl bg-white border border-black/5 shadow-sm p-6 sm:p-8 lg:p-10',
          contentCardClassName
        )}
      >
        {children}
      </div>
    </div>
  )

  const mediaWrapper = mediaNode ? <div className={cn('w-full', mediaClassName)}>{mediaNode}</div> : null

  return (
    <section className={cn('section-spacing-large', className)}>
      <div className="w-[calc(100%-2rem)] sm:w-[calc(100%-3rem)] lg:w-[calc(100%-4rem)] xl:w-[calc(100%-6rem)] 2xl:w-[calc(100%-8rem)] max-w-[90rem] mx-auto">
        <div className={cn('py-12 px-6 sm:py-16 sm:px-8 lg:py-20 lg:px-10', innerClassName)}>
          <div className="grid gap-10 lg:grid-cols-2 lg:items-center">
            {imagePosition === 'left' ? (
              <>
                {mediaWrapper}
                {contentNode}
              </>
            ) : (
              <>
                {contentNode}
                {mediaWrapper}
              </>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}

