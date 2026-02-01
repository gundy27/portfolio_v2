import Image from 'next/image'
import { cn } from '@/lib/utils/cn'

export interface TwoColumnSectionProps {
  children: React.ReactNode
  imagePosition?: 'left' | 'right'
  image?: string
  imageAlt?: string
  media?: React.ReactNode
  className?: string
  contentClassName?: string
  mediaClassName?: string
  imageClassName?: string
  imageAspectClassName?: string
}

export function TwoColumnSection({
  children,
  imagePosition = 'right',
  image,
  imageAlt = '',
  media,
  className,
  contentClassName,
  mediaClassName,
  imageClassName,
  imageAspectClassName = 'aspect-video',
}: TwoColumnSectionProps) {
  const mediaNode =
    media ??
    (image ? (
      <div className={cn('relative w-full overflow-hidden bg-gray-100 rounded-lg', imageAspectClassName)}>
        <Image
          src={image}
          alt={imageAlt}
          fill
          className={cn('object-cover', imageClassName)}
          sizes="(min-width: 1024px) 50vw, 100vw"
        />
      </div>
    ) : null)

  const contentNode = <div className={cn('text-block mx-auto lg:max-w-none', contentClassName)}>{children}</div>
  const mediaWrapper = mediaNode ? <div className={cn('w-full', mediaClassName)}>{mediaNode}</div> : null

  return (
    <section className={cn('section-spacing-large', className)}>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-start">
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
    </section>
  )
}

