import { cn } from '@/lib/utils/cn'

export interface BulletListProps {
  items: string[]
  className?: string
  itemClassName?: string
}

export function BulletList({ items, className, itemClassName }: BulletListProps) {
  if (!items.length) return null

  return (
    <ul className={cn('list-disc list-outside ml-6 space-y-2 text-body', className)}>
      {items.map((item, idx) => (
        <li key={`${idx}-${item}`} className={cn('text-body', itemClassName)}>
          {item}
        </li>
      ))}
    </ul>
  )
}

