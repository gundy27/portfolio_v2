import { cn } from '@/lib/utils/cn'

function CheckIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 20 20"
      aria-hidden="true"
      className={cn('h-5 w-5 flex-none', className)}
      fill="currentColor"
    >
      <path
        fillRule="evenodd"
        d="M10 18a8 8 0 1 0 0-16 8 8 0 0 0 0 16Zm3.707-9.707a1 1 0 0 0-1.414-1.414L9 10.172 7.707 8.879a1 1 0 1 0-1.414 1.414l2 2a1 1 0 0 0 1.414 0l4-4Z"
        clipRule="evenodd"
      />
    </svg>
  )
}

export interface ChecklistItemProps {
  children: React.ReactNode
  className?: string
  iconClassName?: string
  textClassName?: string
}

export function ChecklistItem({ children, className, iconClassName, textClassName }: ChecklistItemProps) {
  return (
    <div className={cn('flex items-start gap-3', className)}>
      <CheckIcon className={cn('text-accent mt-0.5', iconClassName)} />
      <div className={cn('text-body leading-relaxed', textClassName)}>{children}</div>
    </div>
  )
}

