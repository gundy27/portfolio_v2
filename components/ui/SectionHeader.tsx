import { cn } from '@/lib/utils/cn'
import { Label } from './Label'

interface SectionHeaderProps {
  label: string
  heading: React.ReactNode
  headingLevel?: 'h1' | 'h2' | 'h3' | 'h4'
  className?: string
  labelClassName?: string
  headingClassName?: string
}

export function SectionHeader({
  label,
  heading,
  headingLevel = 'h2',
  className,
  labelClassName,
  headingClassName,
}: SectionHeaderProps) {
  const HeadingTag = headingLevel

  return (
    <div className={cn('section-header', className)}>
      <Label variant="accent" className={cn('section-label', labelClassName)}>
        {label}
      </Label>
      <HeadingTag className={cn('section-heading', headingClassName)}>
        {heading}
      </HeadingTag>
    </div>
  )
}

