import { cn } from '@/lib/utils/cn'

export interface HighlightSectionProps {
  children: React.ReactNode
  bottomLine?: React.ReactNode
  className?: string
  innerClassName?: string
}

export function HighlightSection({
  children,
  bottomLine,
  className,
  innerClassName,
}: HighlightSectionProps) {
  return (
    <section className={cn('section-spacing-large', className)}>
      <div
        className={cn('rounded-2xl overflow-hidden', innerClassName)}
        style={{
          border: '1px solid rgba(255, 255, 255, 0.14)',
          boxShadow: '0 10px 30px rgba(17, 17, 17, 0.08)',
        }}
      >
        <div
          className="px-6 py-10 sm:px-10 sm:py-14"
          style={{
            background: 'linear-gradient(180deg, rgba(60, 88, 98, 0.96), rgba(60, 88, 98, 0.90))',
          }}
        >
          <div className="w-full max-w-6xl text-white text-left">{children}</div>
        </div>

        {bottomLine ? (
          <div className="bg-white px-6 py-6 sm:px-10 sm:py-8">
            <div className="w-full max-w-6xl text-left">
              <div className="font-label text-xs uppercase tracking-wider text-secondary">
                Bottom line
              </div>
              <div className="mt-3 text-body">{bottomLine}</div>
            </div>
          </div>
        ) : null}
      </div>
    </section>
  )
}

