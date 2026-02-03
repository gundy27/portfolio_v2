import Image from 'next/image'
import { ArrowRight } from 'lucide-react'
import { Label } from '@/components/ui/Label'
import { cn } from '@/lib/utils/cn'

export interface FeaturedWorkCardProps {
  label: string
  title: string
  description: string
  skills: string[]
  image?: string
  imageAlt?: string
  className?: string
}

export function FeaturedWorkCard({
  label,
  title,
  description,
  skills,
  image,
  imageAlt,
  className,
}: FeaturedWorkCardProps) {
  return (
    <div
      className={cn(
        'featured-work-card group relative w-full bg-white',
        className
      )}
      style={{ borderRadius: 'var(--radius-card)' }}
    >
      <div className="relative overflow-hidden" style={{ borderRadius: 'var(--radius-card)' }}>
        {/* Top-right icon (above thumbnail) */}
        <div className="absolute top-3 right-3 sm:top-4 sm:right-4 z-20">
          <div className="flex h-9 w-9 items-center justify-center rounded-md bg-white/90 ring-1 ring-black/10 backdrop-blur-sm transition-colors duration-200 group-hover:bg-[var(--color-accent)] group-hover:ring-white/30">
            <ArrowRight
              className="h-4 w-4 text-[var(--color-accent)] transition-colors duration-200 group-hover:text-white"
              aria-hidden="true"
            />
          </div>
        </div>

        <div className="flex flex-col gap-4 p-3 sm:p-4 md:flex-row md:items-start md:justify-between">
          {/* Content */}
          <div className="min-w-0 flex-1">
            <Label variant="accent">
              {label}
            </Label>
            <h3 className="mt-2 font-heading text-xl sm:text-2xl font-semibold text-[var(--color-text-primary)]">
              {title}
            </h3>
            <p className="mt-2 mb-3 text-sm sm:text-base text-[var(--color-text-body)]">
              {description}
            </p>
            <p className="text-small text-[var(--color-text-secondary)]/80">
              {skills.join(' | ')}
            </p>
          </div>

          {/* Thumbnail */}
          <div className="w-full md:w-80 lg:w-96">
            {image ? (
              <div
                className="p-1 sm:p-1.5"
                style={{ borderRadius: 'calc(var(--radius-card) - 4px)' }}
              >
                <div
                  className="relative aspect-[4/3] w-full overflow-hidden"
                  style={{ borderRadius: 'calc(var(--radius-card) - 6px)' }}
                >
                  <Image
                    src={image}
                    alt={imageAlt ?? title}
                    fill
                    className="object-cover"
                    sizes="(min-width: 768px) 384px, 100vw"
                  />
                </div>
              </div>
            ) : (
              <div
                className="aspect-[4/3] w-full bg-gray-100"
                style={{ borderRadius: 'calc(var(--radius-card) - 4px)' }}
                aria-hidden="true"
              />
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

