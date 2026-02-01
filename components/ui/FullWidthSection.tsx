import { cn } from '@/lib/utils/cn'

export interface FullWidthSectionProps {
  children: React.ReactNode
  width?: 'narrow' | 'text' | 'wide'
  className?: string
  contentClassName?: string
}

const widthClass: Record<NonNullable<FullWidthSectionProps['width']>, string> = {
  narrow: 'text-block-narrow',
  text: 'text-block',
  wide: 'max-w-5xl mx-auto',
}

export function FullWidthSection({
  children,
  width = 'text',
  className,
  contentClassName,
}: FullWidthSectionProps) {
  return (
    <section className={cn('section-spacing-large', className)}>
      <div className={cn(widthClass[width], contentClassName)}>{children}</div>
    </section>
  )
}

