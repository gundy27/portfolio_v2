import { cn } from '@/lib/utils/cn'

export interface RadioProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: React.ReactNode
}

export function Radio({ className, label, id, ...props }: RadioProps) {
  const inputId = id ?? `${props.name ?? 'radio'}-${String(props.value ?? 'value')}`

  return (
    <label
      htmlFor={inputId}
      className={cn(
        'inline-flex items-start gap-2 select-none',
        props.disabled ? 'cursor-not-allowed opacity-60' : 'cursor-pointer',
        className
      )}
    >
      <input
        {...props}
        id={inputId}
        type="radio"
        className={cn(
          'mt-0.5 h-4 w-4 border border-gray-300 bg-white',
          'accent-[color:var(--color-accent)]',
          'focus:outline-none focus:ring-2 focus:ring-[color:var(--color-accent)]/30',
          props.disabled ? 'cursor-not-allowed' : 'cursor-pointer'
        )}
      />
      {label ? (
        <span className="text-sm text-[color:var(--color-text-body)]">{label}</span>
      ) : null}
    </label>
  )
}

