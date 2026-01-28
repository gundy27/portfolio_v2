import { Label } from '@/components/ui/Label'
import { cn } from '@/lib/utils/cn'

export interface FeaturedWorkCardProps {
  label: string
  title: string
  description: string
  skills: string[]
  className?: string
}

export function FeaturedWorkCard({ label, title, description, skills, className }: FeaturedWorkCardProps) {
  return (
    <div
      className={cn(
        'featured-work-card relative w-full bg-white',
        className
      )}
      style={{ borderRadius: 'var(--radius-card)' }}
    >
      <div className="relative overflow-hidden" style={{ borderRadius: 'var(--radius-card)' }}>
        <div className="flex flex-col gap-8 p-6 sm:p-8 md:flex-row md:items-start md:justify-between">
          {/* Content */}
          <div className="min-w-0 flex-1">
            <Label variant="accent">{label}</Label>
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

          {/* Thumbnail slot (placeholder) */}
          <div className="w-full md:w-64 lg:w-72">
            <div
              className="aspect-[4/3] w-full border border-gray-200 bg-gray-100"
              style={{ borderRadius: 'calc(var(--radius-card) - 4px)' }}
              aria-hidden="true"
            />
          </div>
        </div>
      </div>
    </div>
  )
}

