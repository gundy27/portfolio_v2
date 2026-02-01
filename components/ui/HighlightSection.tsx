import { cn } from '@/lib/utils/cn'

export interface HighlightSectionProps {
  children: React.ReactNode
  className?: string
  innerClassName?: string
}

export function HighlightSection({ children, className, innerClassName }: HighlightSectionProps) {
  return (
    <section className={cn('section-spacing-large', className)}>
      <div
        className={cn('rounded-2xl px-6 py-10 sm:px-10 sm:py-14', innerClassName)}
        style={{
          background: 'linear-gradient(180deg, rgba(60, 88, 98, 0.96), rgba(60, 88, 98, 0.90))',
          border: '1px solid rgba(255, 255, 255, 0.14)',
          boxShadow: '0 10px 30px rgba(17, 17, 17, 0.08)',
        }}
      >
        <div className="max-w-5xl mx-auto text-white">{children}</div>
      </div>
    </section>
  )
}

